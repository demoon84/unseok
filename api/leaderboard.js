import { Redis } from '@upstash/redis';

// Upstash Redis 클라이언트 - 다양한 환경 변수명 지원
const getRedisClient = () => {
    const url = process.env.UPSTASH_REDIS_REST_URL
        || process.env.KV_REST_API_URL
        || process.env.KV_URL
        || process.env.REDIS_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
        || process.env.KV_REST_API_TOKEN
        || process.env.KV_REST_API_READ_ONLY_TOKEN;

    if (!url || !token) {
        console.error('Redis credentials not found. Available env vars:', Object.keys(process.env).filter(k => k.includes('KV') || k.includes('REDIS') || k.includes('UPSTASH')));
        return null;
    }

    return new Redis({ url, token });
};

const redis = getRedisClient();

const DAILY_KEY_PREFIX = 'leaderboard:daily:';
const WEEKLY_KEY_PREFIX = 'leaderboard:weekly:';

// 현재 날짜 키 (YYYY-MM-DD)
const getTodayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// 이번 주 키 (YYYY-WXX)
const getWeekKey = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};

export default async function handler(req, res) {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Redis 클라이언트 없으면 빈 순위 반환
    if (!redis) {
        if (req.method === 'GET') {
            return res.status(200).json({ today: [], weekly: [], error: 'Redis not configured' });
        }
        return res.status(503).json({ error: 'Database not available' });
    }

    try {
        if (req.method === 'GET') {
            // 순위 조회
            const todayKey = DAILY_KEY_PREFIX + getTodayKey();
            const weekKey = WEEKLY_KEY_PREFIX + getWeekKey();

            const [todayRanking, weeklyRanking] = await Promise.all([
                redis.zrange(todayKey, 0, 4, { rev: true, withScores: true }),
                redis.zrange(weekKey, 0, 4, { rev: true, withScores: true }),
            ]);

            // 형식 변환: [name1, score1, name2, score2, ...] → [{name, score}, ...]
            const formatRanking = (data) => {
                const result = [];
                for (let i = 0; i < data.length; i += 2) {
                    result.push({ name: data[i], score: Number(data[i + 1]) });
                }
                return result;
            };

            return res.status(200).json({
                today: formatRanking(todayRanking),
                weekly: formatRanking(weeklyRanking),
            });

        } else if (req.method === 'POST') {
            // 점수 등록
            const { name, score } = req.body;

            if (!name || typeof score !== 'number') {
                return res.status(400).json({ error: 'Invalid request' });
            }

            const todayKey = DAILY_KEY_PREFIX + getTodayKey();
            const weekKey = WEEKLY_KEY_PREFIX + getWeekKey();

            // 점수 추가 (Sorted Set)
            await Promise.all([
                redis.zadd(todayKey, { score, member: `${name}:${Date.now()}` }),
                redis.zadd(weekKey, { score, member: `${name}:${Date.now()}` }),
            ]);

            // 상위 5개만 유지 (나머지 삭제)
            await Promise.all([
                redis.zremrangebyrank(todayKey, 0, -6),
                redis.zremrangebyrank(weekKey, 0, -6),
            ]);

            // TTL 설정 (일별: 2일, 주별: 8일)
            await Promise.all([
                redis.expire(todayKey, 60 * 60 * 24 * 2),
                redis.expire(weekKey, 60 * 60 * 24 * 8),
            ]);

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Leaderboard API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
