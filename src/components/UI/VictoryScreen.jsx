import React, { useCallback } from 'react';
import styles from './VictoryScreen.module.css';

export function VictoryScreen({ score, elapsedTime, onRestart }) {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleRestart = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        onRestart();
    }, [onRestart]);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>MISSION COMPLETE</h2>
            <div className={styles.subtitle}>🎉 축하합니다! 🎉</div>
            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>최종 점수</span>
                    <span className={styles.statValue}>{Math.floor(score)}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>클리어 시간</span>
                    <span className={styles.statValue}>{formatTime(elapsedTime)}</span>
                </div>
            </div>
            <button
                className={styles.restartButton}
                onClick={handleRestart}
                onTouchEnd={handleRestart}
            >
                다시 도전
            </button>
        </div>
    );
}

