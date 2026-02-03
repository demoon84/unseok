// Game Configuration Constants
export const GAME_CONFIG = {
    PLAYER: {
        WIDTH: 25,
        HEIGHT: 25,
        SPEED: 11,
        MAX_ENERGY: 50,
        MAX_LEVEL: 10,
        INITIAL_Y_RATIO: 0.8,
    },

    BULLET: {
        SPEED: 18,
        SIZE: 4,
        SIZE_RED: 7,
    },

    ENEMY: {
        BASE_SPAWN_THRESHOLD: 30,
        MIN_SPAWN_THRESHOLD: 5,
        BOSS_SPAWN_THRESHOLD: 60,
        BOSS_HP_BASE: 250,
        BOSS_WIDTH: 200,
        BOSS_HEIGHT: 200,
    },

    ITEM: {
        SIZE: 20,
        SPEED: 3,
        POWER_DROP_CHANCE: 0.03, // 3%
        SHIELD_DROP_CHANCE: 0.01, // 1%
        HEALTH_DROP_CHANCE: 0.30, // 보스 처치 시에만 사용됨
        BOMB_DROP_CHANCE: 1.0, // 100% (거대 운석에서만)
        POWER_ENERGY_RESTORE: 5,
        HEALTH_ENERGY_RESTORE: 30,
        SHIELD_MAX_STACK: 3, // 보호막 최대 중첩
        BOMB_MAX_STACK: 4, // 폭탄 최대 보유량
    },

    SCORE: {
        BOSS_BONUS: 5000,
    },

    BOSS: {
        SPAWN_INTERVAL_SECONDS: 180, // 3분 = 180초
        TOTAL_BOSSES: 3,             // 총 3회 보스
        WARNING_DURATION_MS: 3000,   // 보스 경고 표시 시간
    },

    TIMING: {
        SHOT_COOLDOWN_BASE: 160,
        SHOT_COOLDOWN_MIN: 80,
        SHOT_COOLDOWN_MAX_LEVEL: 45,
        INVINCIBLE_FRAMES: 120,
    },

    STARS: {
        COUNT: 150,
        MIN_SPEED: 2,
        MAX_SPEED: 8,
        MAX_SIZE: 2,
    },

    // 레벨 시스템 설정
    LEVEL: {
        1: {
            NAME: { ko: '레벨 1: 첫 임무', en: 'Level 1: First Mission' },
            TARGET_SCORE: 120000,
            BOSS_INTERVAL_SECONDS: 30,
            TOTAL_BOSSES: 3,
            ENEMY_SPAWN_RATE: 1.0,
            ENEMY_HP_MULTIPLIER: 1.0,
            BOSS_HP_MULTIPLIER: 1.0,
            SCORE_MULTIPLIER: 1.0,
        },
        2: {
            NAME: { ko: '레벨 2: 심화 작전', en: 'Level 2: Advanced Op' },
            TARGET_SCORE: 180000,
            BOSS_INTERVAL_SECONDS: 25,
            TOTAL_BOSSES: 4,
            ENEMY_SPAWN_RATE: 1.2,
            ENEMY_HP_MULTIPLIER: 1.3,
            BOSS_HP_MULTIPLIER: 1.5,
            SCORE_MULTIPLIER: 1.5,
        },
        3: {
            NAME: { ko: '레벨 3: 최종 결전', en: 'Level 3: Final Battle' },
            TARGET_SCORE: 250000,
            BOSS_INTERVAL_SECONDS: 20,
            TOTAL_BOSSES: 5,
            ENEMY_SPAWN_RATE: 1.5,
            ENEMY_HP_MULTIPLIER: 1.6,
            BOSS_HP_MULTIPLIER: 2.0,
            SCORE_MULTIPLIER: 2.0,
        },
    },
};

// 현재 레벨 설정 가져오기
export const getLevelConfig = (levelId) => {
    return GAME_CONFIG.LEVEL[levelId] || GAME_CONFIG.LEVEL[1];
};

// Weapon patterns by level
export const WEAPON_PATTERNS = {
    1: (addBullet, bSpeed) => addBullet(0, -bSpeed),
    2: (addBullet, bSpeed) => {
        addBullet(-8, -bSpeed);
        addBullet(8, -bSpeed);
    },
    3: (addBullet, bSpeed) => {
        addBullet(0, -bSpeed);
        addBullet(-12, -bSpeed);
        addBullet(12, -bSpeed);
    },
    4: (addBullet, bSpeed) => {
        addBullet(-3, -bSpeed);
        addBullet(3, -bSpeed);
        addBullet(-8, -bSpeed, -1);
        addBullet(8, -bSpeed, 1);
    },
};

// Get spread pattern for levels 5-9
export const getSpreadPattern = (level, addBullet, bSpeed) => {
    for (let i = 0; i < level; i++) {
        const angle = (i - (level - 1) / 2) * 0.125; // 0.25 -> 0.125 (절반)
        addBullet(0, -bSpeed, angle * 6); // 12 -> 6 (절반)
    }
};

// Max level pattern (BERSERK RED) - 퍼짐 1/3로 축소
export const getMaxLevelPattern = (addBullet, bSpeed) => {
    for (let i = 0; i < 22; i++) {
        const angle = (i - 10.5) * 0.045; // 0.09 -> 0.045 (절반)
        addBullet(0, -bSpeed - 5, angle * 2.5, true); // 5 -> 2.5 (절반)
    }
};
