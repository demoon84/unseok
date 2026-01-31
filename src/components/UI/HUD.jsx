import React from 'react';
import styles from './HUD.module.css';

export function HUD({ score, energy, maxEnergy, powerLevel, shield = 0, elapsedTime = 0, bossCount = 0, totalBosses = 3 }) {
    const energyPercent = Math.max(0, energy / maxEnergy) * 100;
    const weaponPercent = (powerLevel / 10) * 100;

    // 경과 시간 포맷팅 (분:초)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // 경과된 분 수 (난이도 표시용)
    const elapsedMinutes = Math.floor(elapsedTime / 60);

    const getEnergyColor = () => {
        if (energyPercent > 60) return 'linear-gradient(to right, #22c55e, #10b981)';
        if (energyPercent > 30) return 'linear-gradient(to right, #facc15, #f59e0b)';
        return 'linear-gradient(to right, #ef4444, #dc2626)';
    };

    const getShieldInfo = () => {
        // 보호막 스택 표시
        if (shield > 0) {
            return {
                text: `SHIELD: ${'●'.repeat(shield)}${'○'.repeat(3 - shield)}`,
                className: styles.shieldActive
            };
        }
        // 에너지 레벨에 따른 상태 표시
        if (energyPercent > 60) {
            return { text: 'STATUS: STRONG', className: styles.shieldActive };
        } else if (energyPercent > 30) {
            return { text: 'STATUS: NORMAL', className: styles.shieldNormal };
        }
        return { text: 'STATUS: CRITICAL', className: styles.shieldCritical };
    };

    const shieldInfo = getShieldInfo();
    const isMaxLevel = powerLevel === 10;

    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                <div className={styles.scoreDisplay}>
                    SCORE: <span className={styles.scoreValue}>{Math.floor(score)}</span>
                </div>
                <div className={styles.energyContainer}>
                    <div className={styles.energyLabel}>Ship Integrity</div>
                    <div className={styles.energyBarOuter}>
                        <div
                            className={styles.energyBarInner}
                            style={{
                                width: `${energyPercent}%`,
                                background: getEnergyColor()
                            }}
                        />
                    </div>
                </div>
                {/* 경과 시간 표시 */}
                <div className={styles.timeDisplay}>
                    <span className={styles.timeLabel}>TIME: </span>
                    <span className={styles.timeValue}>{formatTime(elapsedTime)}</span>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.weaponLabel}>Weapon System</div>
                <div className={styles.weaponBarOuter}>
                    <div
                        className={`${styles.weaponBarInner} ${isMaxLevel ? styles.weaponMax : ''}`}
                        style={{ width: `${weaponPercent}%` }}
                    />
                </div>
                <div className={shieldInfo.className}>{shieldInfo.text}</div>
            </div>
        </div>
    );
}


