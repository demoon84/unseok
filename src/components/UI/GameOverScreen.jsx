import React, { useCallback } from 'react';
import styles from './GameOverScreen.module.css';

export function GameOverScreen({ score, onRestart }) {
    const handleRestart = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        onRestart();
    }, [onRestart]);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>MISSION FAILED</h2>
            <p className={styles.score}>최종 점수: {Math.floor(score)}</p>
            <button
                className={styles.restartButton}
                onClick={handleRestart}
                onTouchEnd={handleRestart}
            >
                재출격
            </button>
        </div>
    );
}

