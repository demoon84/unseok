import { useState, useCallback } from 'react';

/**
 * 화면 이펙트 관리 훅
 * - 데미지 플래시
 * - 보스 경고 플래시
 * - 폭탄 플래시
 */
export function useEffects() {
    const [showDamageFlash, setShowDamageFlash] = useState(false);
    const [showBombFlash, setShowBombFlash] = useState(false);

    // 플레이어 데미지 이펙트
    const triggerDamageFlash = useCallback(() => {
        setShowDamageFlash(true);
        setTimeout(() => setShowDamageFlash(false), 300);
    }, []);

    // 폭탄 사용 이펙트
    const triggerBombFlash = useCallback(() => {
        setShowBombFlash(true);
        setTimeout(() => setShowBombFlash(false), 500);
    }, []);

    return {
        showDamageFlash,
        showBombFlash,
        triggerDamageFlash,
        triggerBombFlash,
    };
}
