// Leaderboard utility - API 기반 글로벌 순위 (로컬에서는 localStorage fallback)
import { showError, showInfo } from '../components/UI/Toast/Toast';
import { t } from './i18n';

const API_URL = '/api/leaderboard';
const LOCAL_STORAGE_KEY = 'sky-dash-leaderboard';

// 로컬 환경 감지 (포트 5173, 3000 등 개발 서버 포트도 체크)
const isLocalDev = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.port === '5173' ||
        window.location.port === '3000');

// 캐시 없이 매번 조회
let cachedRankings = { today: [], weekly: [] };

// === 로컬 스토리지 헬퍼 (로컬 개발용) ===
const getTodayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getWeekKey = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};

const loadLocalData = () => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : { daily: {}, weekly: {} };
    } catch {
        return { daily: {}, weekly: {} };
    }
};

const saveLocalData = (data) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

// === 메인 API ===

// 순위 조회 (캐시 없이 항상 최신 데이터)
export const fetchRankings = async () => {
    // 로컬 개발 환경에서는 localStorage 사용
    if (isLocalDev) {
        const data = loadLocalData();
        const todayKey = getTodayKey();
        const weekKey = getWeekKey();
        cachedRankings = {
            today: (data.daily[todayKey] || []).map(item => ({ ...item, name: item.name })),
            weekly: (data.weekly[weekKey] || []).map(item => ({ ...item, name: item.name }))
        };
        return cachedRankings;
    }

    // 프로덕션에서는 API 호출
    try {
        const response = await fetch(API_URL, {
            signal: AbortSignal.timeout(5000) // 5초 타임아웃
        });
        if (response.ok) {
            cachedRankings = await response.json();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Failed to fetch rankings:', error);
        // 오프라인 감지
        if (!navigator.onLine) {
            showInfo(t('offlineMode'));
        }
    }

    return cachedRankings;
};

// 점수 추가 (중복 제출 방지)
let isSubmitting = false;

export const addScore = async (name, score) => {
    // 중복 제출 방지
    if (isSubmitting) {
        console.log('Score submission already in progress');
        return false;
    }
    isSubmitting = true;

    try {
        // 로컬 개발 환경에서는 localStorage 사용
        if (isLocalDev) {
            const data = loadLocalData();
            const todayKey = getTodayKey();
            const weekKey = getWeekKey();
            const timestamp = Date.now();
            const entry = { name, score, timestamp };

            // 오늘 순위에 추가
            if (!data.daily[todayKey]) data.daily[todayKey] = [];
            data.daily[todayKey].push(entry);
            data.daily[todayKey].sort((a, b) => b.score - a.score);
            data.daily[todayKey] = data.daily[todayKey].slice(0, 5);

            // 주간 순위에 추가
            if (!data.weekly[weekKey]) data.weekly[weekKey] = [];
            data.weekly[weekKey].push(entry);
            data.weekly[weekKey].sort((a, b) => b.score - a.score);
            data.weekly[weekKey] = data.weekly[weekKey].slice(0, 5);

            saveLocalData(data);
            await fetchRankings();
            return true;
        }

        // 프로덕션에서는 API 호출 (재시도 로직 포함)
        let retries = 2;
        let lastError = null;

        while (retries >= 0) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, score }),
                    signal: AbortSignal.timeout(5000)
                });

                if (response.ok) {
                    await fetchRankings();
                    return true;
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                lastError = error;
                retries--;
                if (retries >= 0) {
                    await new Promise(r => setTimeout(r, 1000)); // 1초 대기 후 재시도
                }
            }
        }

        // 모든 재시도 실패
        console.error('Failed to add score after retries:', lastError);
        if (!navigator.onLine) {
            showError(t('offlineMode'));
        } else {
            showError(t('networkError'));
        }
    } finally {
        isSubmitting = false;
    }
    return false;
};

// 오늘 순위 가져오기 (동기 - 캐시에서)
export const getTodayRanking = () => {
    return cachedRankings.today.map(item => ({
        ...item,
        name: typeof item.name === 'string' ? item.name.split(':')[0] : item.name
    }));
};

// 주간 순위 가져오기 (동기 - 캐시에서)
export const getWeeklyRanking = () => {
    return cachedRankings.weekly.map(item => ({
        ...item,
        name: typeof item.name === 'string' ? item.name.split(':')[0] : item.name
    }));
};

// 순위에 들 수 있는지 체크
export const isHighScore = (score) => {
    const today = getTodayRanking();
    const weekly = getWeeklyRanking();

    const canEnterToday = today.length < 5 || score > (today[today.length - 1]?.score || 0);
    const canEnterWeekly = weekly.length < 5 || score > (weekly[weekly.length - 1]?.score || 0);

    return canEnterToday || canEnterWeekly;
};
