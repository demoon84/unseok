import { useCallback, useRef, useEffect } from 'react';

/**
 * Web Audio API 기반 효과음 Hook
 * iOS Safari 호환성 강화 + 에러 복구
 */

// 모바일 감지
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

// 효과음 파일 경로
const SOUND_FILES = {
    shoot: '/sounds/retro_laser_01.ogg',
    explosion: '/sounds/explosion_01.ogg',
    bossExplosion: '/sounds/explosion_02.ogg',
    pickup: '/sounds/item_pickup.flac',
    hit: '/sounds/retro_explosion.ogg',
    bomb: '/sounds/explosion_02.ogg',
    bossAlert: '/sounds/retro_beep_05.ogg',
    bigMeteorAlert: '/sounds/retro_beep_05.ogg', // 거대 운석 경고음
    gameOver: '/sounds/misc_05.ogg',
    victory: '/sounds/teleport_01.ogg',
};

// 쓰로틀링 간격 (ms) - 모바일에서 더 길게
const THROTTLE = {
    shoot: isMobile ? 300 : 150,
    explosion: isMobile ? 250 : 100,
    pickup: 200,
    hit: 400,
    bomb: 500,
    bossAlert: 1000,
    bigMeteorAlert: 500, // 거대 운석 경고
    gameOver: 1000,
    victory: 1000,
};

// 볼륨 설정 (모바일/PC 동일)
const VOLUMES = {
    shoot: 0.15,        // 발사음
    explosion: 1.0,     // 폭발음
    bossExplosion: 1.0, // 보스 폭발
    pickup: 0.9,        // 아이템 획득
    hit: 1.0,           // 피격음
    bomb: 1.0,          // 폭탄
    bossAlert: 1.0,     // 보스 경고
    bigMeteorAlert: 1.0, // 거대 운석 경고
    gameOver: 1.0,      // 게임오버
    victory: 1.0,       // 승리
};

export function useSound() {
    const audioContextRef = useRef(null);
    const audioBuffers = useRef({});
    const isEnabledRef = useRef(true);
    const lastPlayTime = useRef({});
    const isInitialized = useRef(false);
    const loadingRef = useRef(false);

    // AudioContext 생성/반환
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('AudioContext not supported');
                return null;
            }
        }
        return audioContextRef.current;
    }, []);

    // AudioContext resume (iOS 필수)
    const resumeContext = useCallback(() => {
        const ctx = audioContextRef.current;
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
        }
    }, []);

    // 단일 오디오 파일 로드
    const loadAudioBuffer = useCallback(async (key, url) => {
        const ctx = getAudioContext();
        if (!ctx) return;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            audioBuffers.current[key] = audioBuffer;
        } catch (e) {
            // 실패해도 게임 진행에 영향 없음
        }
    }, [getAudioContext]);

    // 오디오 초기화 (첫 상호작용 시)
    const initAudio = useCallback(async () => {
        if (isInitialized.current || loadingRef.current) return;
        loadingRef.current = true;

        const ctx = getAudioContext();
        if (!ctx) {
            loadingRef.current = false;
            return;
        }

        // iOS에서 컨텍스트 활성화
        resumeContext();

        // 필수 사운드만 먼저 로드 (발사, 폭발)
        const prioritySounds = ['shoot', 'explosion'];
        await Promise.all(
            prioritySounds.map(key => loadAudioBuffer(key, SOUND_FILES[key]))
        );

        // 나머지는 백그라운드에서 로드
        Object.entries(SOUND_FILES)
            .filter(([key]) => !prioritySounds.includes(key))
            .forEach(([key, url]) => loadAudioBuffer(key, url));

        isInitialized.current = true;
        loadingRef.current = false;
    }, [getAudioContext, resumeContext, loadAudioBuffer]);

    // 클린업
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(() => { });
                audioContextRef.current = null;
            }
        };
    }, []);

    // 사운드 재생
    const playSound = useCallback((key) => {
        if (!isEnabledRef.current) return;

        // 컨텍스트 활성화 (매번 체크)
        resumeContext();

        const buffer = audioBuffers.current[key];
        if (!buffer) return;

        // 쓰로틀링
        const now = Date.now();
        const throttleMs = THROTTLE[key] || 150;
        const lastTime = lastPlayTime.current[key] || 0;
        if (now - lastTime < throttleMs) return;
        lastPlayTime.current[key] = now;

        try {
            const ctx = audioContextRef.current;
            if (!ctx || ctx.state !== 'running') return;

            const source = ctx.createBufferSource();
            source.buffer = buffer;

            const gainNode = ctx.createGain();
            gainNode.gain.value = VOLUMES[key] || 0.2;

            source.connect(gainNode);
            gainNode.connect(ctx.destination);
            source.start(0);
        } catch (e) {
            // 무시
        }
    }, [resumeContext]);

    // 토글
    const toggleSound = useCallback(() => {
        isEnabledRef.current = !isEnabledRef.current;
        return isEnabledRef.current;
    }, []);

    // 개별 효과음
    const playShoot = useCallback(() => {
        initAudio();
        playSound('shoot');
    }, [initAudio, playSound]);

    const playExplosion = useCallback((isBoss = false) => {
        playSound(isBoss ? 'bossExplosion' : 'explosion');
    }, [playSound]);

    const playPickup = useCallback(() => {
        playSound('pickup');
    }, [playSound]);

    const playHit = useCallback(() => {
        playSound('hit');
    }, [playSound]);

    const playBulletHit = useCallback(() => {
        // 비활성화
    }, []);

    const playBomb = useCallback(() => {
        playSound('bomb');
    }, [playSound]);

    const playBossAlert = useCallback(() => {
        playSound('bossAlert');
    }, [playSound]);

    const playBigMeteorAlert = useCallback(() => {
        playSound('bigMeteorAlert');
    }, [playSound]);

    const playGameOver = useCallback(() => {
        playSound('gameOver');
    }, [playSound]);

    const playVictory = useCallback(() => {
        playSound('victory');
    }, [playSound]);

    return {
        playShoot,
        playExplosion,
        playPickup,
        playHit,
        playBulletHit,
        playBomb,
        playBossAlert,
        playBigMeteorAlert,
        playGameOver,
        playVictory,
        toggleSound,
        isEnabled: () => isEnabledRef.current
    };
}
