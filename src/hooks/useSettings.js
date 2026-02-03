import { useState, useCallback, useEffect } from 'react';

const SETTINGS_KEY = 'meteor-commando-settings';

const defaultSettings = {
    bgmVolume: 0.01,   // BGM 볼륨 (0-1)
    sfxVolume: 1.0,    // 효과음 볼륨 (0-1)
    language: 'ko',    // 언어
};

// 설정 로드
const loadSettings = () => {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            return { ...defaultSettings, ...JSON.parse(saved) };
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

    // BGM 볼륨 설정
    const setBgmVolume = useCallback((volume) => {
        setSettings(prev => ({ ...prev, bgmVolume: Math.max(0, Math.min(1, volume)) }));
    }, []);

    // SFX 볼륨 설정
    const setSfxVolume = useCallback((volume) => {
        setSettings(prev => ({ ...prev, sfxVolume: Math.max(0, Math.min(1, volume)) }));
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
    const openSettings = useCallback(() => {
        setIsSettingsOpen(true);
        setIsPaused(true); // 설정 열면 자동 일시정지
    }, []);

    const closeSettings = useCallback(() => {
        setIsSettingsOpen(false);
        // 설정 닫아도 일시정지는 유지 (Resume 버튼으로 해제)
    }, []);

    return {
        // 설정 값
        bgmVolume: settings.bgmVolume,
        sfxVolume: settings.sfxVolume,
        language: settings.language,

        // 일시정지 상태
        isPaused,

        // 설정 패널 상태
        isSettingsOpen,

        // 설정 함수
        setBgmVolume,
        setSfxVolume,
        setLanguage,

        // 일시정지 제어
        togglePause,
        setPaused,

        // 설정 패널 제어
        openSettings,
        closeSettings,
    };
}
