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
        POWER_DROP_CHANCE: 0.50, // 50%
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

    // 레벨 시스템 설정 (향후 확장 가능)
    LEVEL: {
        1: {
            NAME: 'Level 1',
            TARGET_SCORE: 120000,        // 목표 최대 점수
            BOSS_INTERVAL_SECONDS: 30,   // 보스 등장 간격
            TOTAL_BOSSES: 3,             // 총 보스 수
            ENEMY_SPAWN_RATE: 1.0,       // 적 스폰 속도 배율
            ENEMY_HP_MULTIPLIER: 1.0,    // 적 HP 배율
            BOSS_HP_MULTIPLIER: 1.0,     // 보스 HP 배율
            SCORE_MULTIPLIER: 1.0,       // 점수 배율
        },
        // 향후 레벨 추가 예시:
        // 2: { NAME: 'Level 2', TARGET_SCORE: 180000, BOSS_INTERVAL_SECONDS: 25, ... }
    },
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
