import { useState, useCallback } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

/**
 * 보스 시스템 관리 훅
 * - 보스 HP 상태 및 UI 표시
 * - 보스 스폰/처치 이벤트 처리
 */
export function useBoss(onVictory) {
    const [showBossAlert, setShowBossAlert] = useState(false);
    const [showBossHUD, setShowBossHUD] = useState(false);
    const [showBossWarning, setShowBossWarning] = useState(false);
    const [bossHp, setBossHp] = useState(0);
    const [bossMaxHp, setBossMaxHp] = useState(0);

    // 보스 스폰
    const handleBossSpawn = useCallback(() => {
        setShowBossAlert(true);
        setShowBossWarning(true);

        setTimeout(() => {
            setShowBossAlert(false);
            setShowBossWarning(false);
            setShowBossHUD(true);
        }, GAME_CONFIG.BOSS.WARNING_DURATION_MS);
    }, []);

    // 보스 처치
    const handleBossDefeat = useCallback((setBossCount) => {
        setShowBossHUD(false);
        setBossCount(prev => {
            const newCount = prev + 1;
            if (newCount >= GAME_CONFIG.BOSS.TOTAL_BOSSES) {
                setTimeout(() => onVictory?.(), 1000);
            }
            return newCount;
        });
    }, [onVictory]);

    // 보스 데미지
    const handleBossDamage = useCallback((hp, maxHp) => {
        setBossHp(hp);
        setBossMaxHp(maxHp);
    }, []);

    // 게임 리셋 시 보스 상태 초기화
    const resetBossState = useCallback(() => {
        setShowBossHUD(false);
        setShowBossAlert(false);
        setShowBossWarning(false);
        setBossHp(0);
        setBossMaxHp(0);
    }, []);

    return {
        showBossAlert,
        showBossHUD,
        showBossWarning,
        bossHp,
        bossMaxHp,
        handleBossSpawn,
        handleBossDefeat,
        handleBossDamage,
        resetBossState,
    };
}
