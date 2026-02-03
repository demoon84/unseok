import { useState, useCallback, useEffect } from 'react';
import { showAchievement } from '../components/UI/Toast/Toast';
import { t } from '../utils/i18n';

const ACHIEVEMENTS_KEY = 'meteor-commando-achievements';
const UNLOCKED_LEVELS_KEY = 'meteor-commando-unlocked-levels';

// 업적 정의
const ACHIEVEMENT_DEFINITIONS = [
    {
        id: 'first_kill',
        name: { ko: '첫 격추', en: 'First Kill' },
        description: { ko: '첫 번째 운석 파괴', en: 'Destroy your first meteor' },
        icon: '🎯',
        condition: (stats) => stats.totalKills >= 1
    },
    {
        id: 'boss_slayer',
        name: { ko: '보스 슬레이어', en: 'Boss Slayer' },
        description: { ko: '첫 번째 보스 처치', en: 'Defeat your first boss' },
        icon: '👹',
        condition: (stats) => stats.bossKills >= 1
    },
    {
        id: 'survivor',
        name: { ko: '생존자', en: 'Survivor' },
        description: { ko: '5분 이상 생존', en: 'Survive for 5 minutes' },
        icon: '⏱️',
        condition: (stats) => stats.maxSurvivalTime >= 300
    },
    {
        id: 'sharpshooter',
        name: { ko: '명사수', en: 'Sharpshooter' },
        description: { ko: '연속 50 격추', en: '50 consecutive kills' },
        icon: '🎯',
        condition: (stats) => stats.maxKillStreak >= 50
    },
    {
        id: 'bomber',
        name: { ko: '폭격수', en: 'Bomber' },
        description: { ko: '폭탄으로 10마리 처치', en: 'Kill 10 enemies with bombs' },
        icon: '💣',
        condition: (stats) => stats.bombKills >= 10
    },
    {
        id: 'score_10k',
        name: { ko: '만점 돌파', en: '10K Club' },
        description: { ko: '10,000점 달성', en: 'Score 10,000 points' },
        icon: '📊',
        condition: (stats) => stats.highScore >= 10000
    },
    {
        id: 'score_50k',
        name: { ko: '고득점자', en: '50K Club' },
        description: { ko: '50,000점 달성', en: 'Score 50,000 points' },
        icon: '🏆',
        condition: (stats) => stats.highScore >= 50000
    },
    {
        id: 'score_100k',
        name: { ko: '레전드', en: 'Legend' },
        description: { ko: '100,000점 달성', en: 'Score 100,000 points' },
        icon: '👑',
        condition: (stats) => stats.highScore >= 100000
    },
    {
        id: 'full_power',
        name: { ko: '풀파워', en: 'Full Power' },
        description: { ko: '무기 레벨 10 달성', en: 'Reach weapon level 10' },
        icon: '⚡',
        condition: (stats) => stats.maxPowerLevel >= 10
    },
    {
        id: 'mission_complete',
        name: { ko: '임무 완료', en: 'Mission Complete' },
        description: { ko: '레벨 1 클리어', en: 'Clear Level 1' },
        icon: '🌟',
        condition: (stats) => stats.levelsCleared >= 1
    },
    {
        id: 'level2_clear',
        name: { ko: '숙련 조종사', en: 'Skilled Pilot' },
        description: { ko: '레벨 2 클리어', en: 'Clear Level 2' },
        icon: '✨',
        condition: (stats) => stats.levelsCleared >= 2
    },
    {
        id: 'level3_clear',
        name: { ko: '에이스', en: 'Ace Pilot' },
        description: { ko: '레벨 3 클리어', en: 'Clear Level 3' },
        icon: '🎖️',
        condition: (stats) => stats.levelsCleared >= 3
    }
];

// 기본 통계
const defaultStats = {
    totalKills: 0,
    bossKills: 0,
    bombKills: 0,
    highScore: 0,
    maxSurvivalTime: 0,
    maxKillStreak: 0,
    maxPowerLevel: 0,
    levelsCleared: 0,
    gamesPlayed: 0,
};

// 통계 로드
const loadStats = () => {
    try {
        const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            return {
                stats: { ...defaultStats, ...data.stats },
                unlocked: data.unlocked || []
            };
        }
    } catch (e) {
        console.warn('Failed to load achievements:', e);
    }
    return { stats: defaultStats, unlocked: [] };
};

// 통계 저장
const saveData = (stats, unlocked) => {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify({ stats, unlocked }));
};

// 해제된 레벨 로드
export const loadUnlockedLevels = () => {
    try {
        const saved = localStorage.getItem(UNLOCKED_LEVELS_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load unlocked levels:', e);
    }
    return [1]; // 기본: 레벨 1만 해제
};

// 레벨 해제
export const unlockLevel = (level) => {
    const unlocked = loadUnlockedLevels();
    if (!unlocked.includes(level)) {
        unlocked.push(level);
        unlocked.sort((a, b) => a - b);
        localStorage.setItem(UNLOCKED_LEVELS_KEY, JSON.stringify(unlocked));
    }
};

export function useAchievements() {
    const [data, setData] = useState(loadStats);
    const [currentStreak, setCurrentStreak] = useState(0);

    // 업적 체크 및 알림
    const checkAchievements = useCallback((stats, currentUnlocked) => {
        const newUnlocked = [];
        const lang = localStorage.getItem('meteor-commando-lang') || 'ko';

        ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
            if (!currentUnlocked.includes(achievement.id) && achievement.condition(stats)) {
                newUnlocked.push(achievement.id);
                // 토스트 알림
                showAchievement(`${achievement.icon} ${achievement.name[lang]}`);
            }
        });

        return newUnlocked;
    }, []);

    // 통계 업데이트
    const updateStats = useCallback((updates) => {
        setData(prev => {
            const newStats = { ...prev.stats };

            // 업데이트 적용
            Object.entries(updates).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    if (key.startsWith('max') || key === 'highScore') {
                        // max 값은 최대값만 유지
                        newStats[key] = Math.max(newStats[key], value);
                    } else {
                        // 일반 값은 누적
                        newStats[key] = (newStats[key] || 0) + value;
                    }
                }
            });

            // 업적 체크
            const newUnlocked = checkAchievements(newStats, prev.unlocked);
            const allUnlocked = [...prev.unlocked, ...newUnlocked];

            // 저장
            saveData(newStats, allUnlocked);

            return { stats: newStats, unlocked: allUnlocked };
        });
    }, [checkAchievements]);

    // 킬 등록
    const registerKill = useCallback((isBoss = false, isBombKill = false) => {
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);

        updateStats({
            totalKills: 1,
            bossKills: isBoss ? 1 : 0,
            bombKills: isBombKill ? 1 : 0,
            maxKillStreak: newStreak
        });
    }, [currentStreak, updateStats]);

    // 스트릭 리셋
    const resetStreak = useCallback(() => {
        setCurrentStreak(0);
    }, []);

    // 게임 종료 시
    const endGame = useCallback((score, survivalTime, powerLevel, cleared = false, level = 1) => {
        let levelsCleared = 0;

        if (cleared) {
            levelsCleared = level;
            // 다음 레벨 해제
            unlockLevel(level + 1);
        }

        updateStats({
            gamesPlayed: 1,
            highScore: score,
            maxSurvivalTime: survivalTime,
            maxPowerLevel: powerLevel,
            levelsCleared
        });

        resetStreak();
    }, [updateStats, resetStreak]);

    // 업적 목록 가져오기
    const getAchievements = useCallback(() => {
        const lang = localStorage.getItem('meteor-commando-lang') || 'ko';
        return ACHIEVEMENT_DEFINITIONS.map(a => ({
            ...a,
            name: a.name[lang],
            description: a.description[lang],
            unlocked: data.unlocked.includes(a.id)
        }));
    }, [data.unlocked]);

    return {
        stats: data.stats,
        unlockedAchievements: data.unlocked,
        registerKill,
        resetStreak,
        endGame,
        getAchievements,
        updateStats
    };
}
