import { useRef, useCallback } from 'react';
import { GAME_CONFIG, WEAPON_PATTERNS, getSpreadPattern, getMaxLevelPattern } from '../constants/gameConfig';

// Custom hook for weapon/shooting system
export function useWeapon(playerRef, bulletsRef) {
    const lastShotTimeRef = useRef(0);

    const addBullet = useCallback((offsetX, vy, vx = 0, isRed = false) => {
        const player = playerRef.current;

        bulletsRef.current.push({
            x: player.x + offsetX,
            y: player.y - 10,
            vx: vx,
            vy: vy,
            red: isRed,
            size: isRed ? GAME_CONFIG.BULLET.SIZE_RED : GAME_CONFIG.BULLET.SIZE
        });
    }, [playerRef, bulletsRef]);

    const shoot = useCallback(() => {
        const now = Date.now();
        const player = playerRef.current;
        const level = player.powerLevel;

        // Calculate cooldown based on level
        const currentCooldown = level === 10
            ? GAME_CONFIG.TIMING.SHOT_COOLDOWN_MAX_LEVEL
            : Math.max(GAME_CONFIG.TIMING.SHOT_COOLDOWN_MIN,
                GAME_CONFIG.TIMING.SHOT_COOLDOWN_BASE - (level * 10));

        if (now - lastShotTimeRef.current < currentCooldown) return;

        const bSpeed = GAME_CONFIG.BULLET.SPEED;

        // Apply weapon pattern based on level
        if (level >= 1 && level <= 4 && WEAPON_PATTERNS[level]) {
            WEAPON_PATTERNS[level](addBullet, bSpeed);
        } else if (level >= 5 && level <= 10) {
            getSpreadPattern(level, addBullet, bSpeed);
        } else {
            // 레벨 0 또는 기타: 기본 1발
            addBullet(0, -bSpeed);
        }

        lastShotTimeRef.current = now;
    }, [playerRef, addBullet]);

    const updateBullets = useCallback((canvasWidth) => {
        bulletsRef.current = bulletsRef.current.filter(b => {
            b.x += b.vx;
            b.y += b.vy;
            return b.y > -100 && b.x > -200 && b.x < canvasWidth + 200;
        });
    }, [bulletsRef]);

    return { shoot, updateBullets, addBullet };
}
