import React from 'react';
import { t, getLanguage, setLanguage, getAvailableLanguages } from '../../../utils/i18n';
import styles from './Settings.module.css';

export function Settings({
    bgmVolume,
    sfxVolume,
    onBgmVolumeChange,
    onSfxVolumeChange,
    isPaused,
    onResume,
    onClose
}) {
    const currentLang = getLanguage();
    const languages = getAvailableLanguages();

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        // 페이지 새로고침하여 변경 적용
        window.location.reload();
    };

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
            onTouchEnd={(e) => { e.target === e.currentTarget && onClose(); }}
        >
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>⚙️ {t('settings')}</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.content}>
                    {/* BGM 볼륨 */}
                    <div className={styles.setting}>
                        <label className={styles.label}>
                            🎵 {t('bgmVolume')}
                        </label>
                        <div className={styles.sliderContainer}>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={Math.round(bgmVolume * 100)}
                                onChange={(e) => onBgmVolumeChange(Number(e.target.value) / 100)}
                                className={styles.slider}
                            />
                            <span className={styles.value}>{Math.round(bgmVolume * 100)}%</span>
                        </div>
                    </div>

                    {/* SFX 볼륨 */}
                    <div className={styles.setting}>
                        <label className={styles.label}>
                            🔊 {t('sfxVolume')}
                        </label>
                        <div className={styles.sliderContainer}>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={Math.round(sfxVolume * 100)}
                                onChange={(e) => onSfxVolumeChange(Number(e.target.value) / 100)}
                                className={styles.slider}
                            />
                            <span className={styles.value}>{Math.round(sfxVolume * 100)}%</span>
                        </div>
                    </div>

                    {/* 언어 선택 */}
                    <div className={styles.setting}>
                        <label className={styles.label}>
                            🌐 {t('language')}
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
                        ▶️ {t('resume')}
                    </button>
                )}
            </div>
        </div>
    );
}
