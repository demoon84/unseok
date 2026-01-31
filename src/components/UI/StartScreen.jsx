import React, { useCallback, useState } from 'react';
import styles from './StartScreen.module.css';

export function StartScreen({ onStart }) {
    const [isLaunching, setIsLaunching] = useState(false);

    // 터치/클릭 핸들러
    const handleStart = useCallback((e) => {
        if (e.cancelable) e.preventDefault();
        if (isLaunching) return;

        setIsLaunching(true);

        // 도킹 아웃과 동시에 게임 시작 (비행기 진입 동기화)
        setTimeout(() => {
            onStart();
        }, 100);
    }, [onStart, isLaunching]);

    return (
        <div className={styles.container}>
            {/* 로고 */}
            <div className={styles.logoSection}>
                <img src="/logo.png" alt="운석특공대" className={styles.logo} />
            </div>

            {/* 기지/격납고 - 시작시 아래로 내려감 */}
            <div className={`${styles.hangarSection} ${isLaunching ? styles.hangarHide : ''}`}>
                <img src="/hangar.png" alt="Hangar" className={styles.hangar} />

                <div className={styles.buttonContainer}>
                    <button
                        className={`${styles.startButton} ${isLaunching ? styles.hidden : ''}`}
                        onClick={handleStart}
                        onTouchStart={handleStart}
                        disabled={isLaunching}
                    >
                        임무 시작
                    </button>
                </div>
            </div>
        </div>
    );
}
