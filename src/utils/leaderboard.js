// Leaderboard utility - localStorage 기반

const STORAGE_KEY = 'sky-dash-leaderboard';

// 현재 날짜 키 (YYYY-MM-DD)
const getTodayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// 이번 주 시작일 (월요일)
const getWeekKey = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return `${monday.getFullYear()}-W${String(Math.ceil(monday.getDate() / 7)).padStart(2, '0')}`;
};

// 전체 데이터 로드
const loadData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { daily: {}, weekly: {} };
    } catch {
        return { daily: {}, weekly: {} };
    }
};

// 데이터 저장
const saveData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// 점수 추가
export const addScore = (name, score) => {
    const data = loadData();
    const todayKey = getTodayKey();
    const weekKey = getWeekKey();
    const timestamp = Date.now();

    const entry = { name, score, timestamp };

    // 오늘 순위에 추가
    if (!data.daily[todayKey]) {
        data.daily[todayKey] = [];
    }
    data.daily[todayKey].push(entry);
    data.daily[todayKey].sort((a, b) => b.score - a.score);
    data.daily[todayKey] = data.daily[todayKey].slice(0, 5); // 상위 5개만

    // 주간 순위에 추가
    if (!data.weekly[weekKey]) {
        data.weekly[weekKey] = [];
    }
    data.weekly[weekKey].push(entry);
    data.weekly[weekKey].sort((a, b) => b.score - a.score);
    data.weekly[weekKey] = data.weekly[weekKey].slice(0, 5); // 상위 5개만

    // 오래된 데이터 정리 (7일 이전 일별, 4주 이전 주별)
    const keys = Object.keys(data.daily);
    if (keys.length > 7) {
        keys.sort().slice(0, keys.length - 7).forEach(k => delete data.daily[k]);
    }
    const weekKeys = Object.keys(data.weekly);
    if (weekKeys.length > 4) {
        weekKeys.sort().slice(0, weekKeys.length - 4).forEach(k => delete data.weekly[k]);
    }

    saveData(data);
};

// 오늘 순위 가져오기
export const getTodayRanking = () => {
    const data = loadData();
    const todayKey = getTodayKey();
    return data.daily[todayKey] || [];
};

// 주간 순위 가져오기
export const getWeeklyRanking = () => {
    const data = loadData();
    const weekKey = getWeekKey();
    return data.weekly[weekKey] || [];
};

// 순위에 들 수 있는지 체크
export const isHighScore = (score) => {
    const today = getTodayRanking();
    const weekly = getWeeklyRanking();

    const canEnterToday = today.length < 5 || score > today[today.length - 1]?.score;
    const canEnterWeekly = weekly.length < 5 || score > weekly[weekly.length - 1]?.score;

    return canEnterToday || canEnterWeekly;
};
