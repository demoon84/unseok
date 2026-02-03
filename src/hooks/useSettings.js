import { useState, useCallback, useEffect } from 'react';

const SETTINGS_KEY = 'meteor-commando-settings';

const defaultSettings = {
    soundEnabled: true,  // 소리 활성화 여부
    language: 'ko',      // 언어
};

// 설정 로드 (마이그레이션 포함)
const loadSettings = () => {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);

            // 이전 버전 마이그레이션 (bgmVolume/sfxVolume -> bgmEnabled/sfxEnabled)
            if ('bgmVolume' in parsed && !('bgmEnabled' in parsed)) {
                parsed.bgmEnabled = parsed.bgmVolume > 0;
                delete parsed.bgmVolume;
            }
            if ('sfxVolume' in parsed && !('sfxEnabled' in parsed)) {
                parsed.sfxEnabled = parsed.sfxVolume > 0;
                delete parsed.sfxVolume;
            }

            return { ...defaultSettings, ...parsed };
        }
    } catch (e) {
        console.warn('Failed to load settings:', e);
    }
    return defaultSettings;
};

// 설정 저장
const saveSettings = (settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export function useSettings() {
    const [settings, setSettings] = useState(loadSettings);
    const [isPaused, setIsPaused] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // 설정 변경 시 저장
    useEffect(() => {
        saveSettings(settings);
    }, [settings]);

    // 소리 토글
    const toggleSound = useCallback(() => {
        setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
    }, []);

    // 언어 설정
    const setLanguage = useCallback((lang) => {
        setSettings(prev => ({ ...prev, language: lang }));
    }, []);

    // 일시정지 토글
    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    // 일시정지 설정
    const setPaused = useCallback((paused) => {
        setIsPaused(paused);
    }, []);

    // 설정 패널 열기/닫기
    const openSettings = useCallback((isPlaying = false) => {
        setIsSettingsOpen(true);
        if (isPlaying) {
            setIsPaused(true); // 게임 중일 때만 자동 일시정지
        }
    }, []);

    const closeSettings = useCallback(() => {
        setIsSettingsOpen(false);
        // 설정 닫아도 일시정지는 유지 (Resume 버튼으로 해제)
    }, []);

    return {
        // 설정 값
        soundEnabled: settings.soundEnabled,
        language: settings.language,

        // 일시정지 상태
        isPaused,

        // 설정 패널 상태
        isSettingsOpen,

        // 설정 함수
        toggleSound,
        setLanguage,

        // 일시정지 제어
        togglePause,
        setPaused,

        // 설정 패널 제어
        openSettings,
        closeSettings,
    };
}
