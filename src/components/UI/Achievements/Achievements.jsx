import React from 'react';
import { t } from '../../../utils/i18n';
import styles from './Achievements.module.css';

export function Achievements({ achievements, onClose }) {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>🏆 {t('achievements')}</h2>
                    <span className={styles.count}>{unlockedCount}/{totalCount}</span>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.list}>
                    {achievements.map(achievement => (
                        <div
                            key={achievement.id}
                            className={`${styles.item} ${achievement.unlocked ? styles.unlocked : styles.locked}`}
                        >
                            <span className={styles.icon}>{achievement.icon}</span>
                            <div className={styles.info}>
                                <span className={styles.name}>{achievement.name}</span>
                                <span className={styles.description}>{achievement.description}</span>
                            </div>
                            {achievement.unlocked && (
                                <span className={styles.checkmark}>✓</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
