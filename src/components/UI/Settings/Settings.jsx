import React, { useState, useEffect } from 'react';
import { t, getLanguage, setLanguage, getAvailableLanguages, onLanguageChange } from '../../../utils/i18n';
import styles from './Settings.module.css';

export function Settings({
    soundEnabled,
    onToggleSound,
    isPaused,
    onResume,
    onClose
}) {
    const [currentLang, setCurrentLang] = useState(getLanguage());
    const languages = getAvailableLanguages();

    // 언어 변경 리스너
    useEffect(() => {
        return onLanguageChange((lang) => setCurrentLang(lang));
    }, []);

    const handleLanguageChange = (lang) => {
        // 즉시 언어 변경 적용
        setLanguage(lang);
    };

    return (
        <div
            className={styles.overlay}
            onClick={(e) => { e.target === e.currentTarget && onClose(); }}
            onTouchEnd={(e) => { e.target === e.currentTarget && onClose(); }}
        >
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('settings')}</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.content}>
                    {/* 소리 토글 */}
                    <div className={styles.setting}>
                        <label className={styles.label}>
                            {t('sound')}
                        </label>
                        <button
                            className={`${styles.toggleBtn} ${soundEnabled ? styles.toggleOn : styles.toggleOff}`}
                            onClick={onToggleSound}
                            onTouchEnd={(e) => { e.preventDefault(); onToggleSound(); }}
                        >
                            {soundEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* 언어 선택 */}
                    <div className={styles.setting}>
                        <label className={styles.label}>
                            {t('language')}
                        </label>
                        <div className={styles.langButtons}>
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    className={`${styles.langBtn} ${currentLang === lang.code ? styles.active : ''}`}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    onTouchEnd={(e) => { e.preventDefault(); handleLanguageChange(lang.code); }}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 게임 중일 때만 Resume 버튼 표시 */}
                {isPaused && (
                    <button
                        className={styles.resumeBtn}
                        onClick={onResume}
                        onTouchEnd={(e) => { e.preventDefault(); onResume(); }}
                    >
                        {t('resume')}
                    </button>
                )}
            </div>
        </div>
    );
}
