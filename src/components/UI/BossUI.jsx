import React from 'react';
import styles from './BossUI.module.css';

export function BossAlert() {
    return (
        <div className={styles.alertContainer}>
            <h2 className={styles.alertText}>⚠️ 거대운석 발견! ⚠️</h2>
        </div>
    );
}

export function BossHUD({ hp, maxHp }) {
    const hpPercent = Math.max(0, hp / maxHp) * 100;

    return (
        <div className={styles.hudContainer}>
            <div className={styles.bossLabel}>거대 운석</div>
            <div className={styles.hpBarOuter}>
                <div
                    className={styles.hpBar}
                    style={{ width: `${hpPercent}%` }}
                />
            </div>
        </div>
    );
}
