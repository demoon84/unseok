import React, { useState, useEffect } from 'react';
import { t } from '../../../utils/i18n';
import styles from './Tutorial.module.css';

const TUTORIAL_KEY = 'meteor-commando-tutorial-seen';

// 모바일 감지
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function Tutorial({ onClose }) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem(TUTORIAL_KEY, 'true');
        }
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>{t('tutorialTitle')}</h2>

                <div className={styles.sections}>
                    {/* PC 조작 */}
                    {!isMobile && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>🖥️ {t('pcControls')}</h3>
                            <div className={styles.control}>
                                <div className={styles.keys}>
                                    <span className={styles.key}>W</span>
                                    <div className={styles.keyRow}>
                                        <span className={styles.key}>A</span>
                                        <span className={styles.key}>S</span>
                                        <span className={styles.key}>D</span>
                                    </div>
                                </div>
                                <span className={styles.description}>{t('moveKeys')}</span>
                            </div>
                            <div className={styles.control}>
                                <span className={styles.key}>B</span>
                                <span className={styles.description}>{t('bombKey')}</span>
                            </div>
                        </div>
                    )}

                    {/* 모바일 조작 */}
                    {isMobile && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>📱 {t('mobileControls')}</h3>
                            <div className={styles.control}>
                                <span className={styles.icon}>👆</span>
                                <span className={styles.description}>{t('touchMove')}</span>
                            </div>
                            <div className={styles.control}>
                                <span className={styles.icon}>💣</span>
                                <span className={styles.description}>{t('bombButton')}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                        />
                        <span>{t('skipTutorial')}</span>
                    </label>

                    <button
                        className={styles.closeButton}
                        onClick={handleClose}
                        onTouchEnd={(e) => { e.preventDefault(); handleClose(); }}
                    >
                        {t('gotIt')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// 튜토리얼을 보여야 하는지 확인
export function shouldShowTutorial() {
    return localStorage.getItem(TUTORIAL_KEY) !== 'true';
}

// 튜토리얼 상태 리셋 (디버그용)
export function resetTutorial() {
    localStorage.removeItem(TUTORIAL_KEY);
}
