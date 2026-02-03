import React, { useState, useEffect } from 'react';
import { t } from '../../../utils/i18n';
import styles from './LoadingScreen.module.css';

// 프리로드할 에셋 목록
const ASSETS = {
    images: [
        '/logo.png',
        '/ship.png',
        '/hangar.png',
        '/bullet.png',
        '/bullet_red.png',
    ],
    sounds: [
        '/sounds/retro_laser_01.ogg',
        '/sounds/explosion_01.ogg',
        '/sounds/explosion_02.ogg',
        '/sounds/item_pickup.flac',
        '/sounds/retro_explosion.ogg',
        '/sounds/misc_05.ogg',
        '/sounds/teleport_01.ogg',
        '/sounds/retro_beep_05.ogg',
        '/sounds/through_space.ogg',
    ]
};

export function LoadingScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let loaded = 0;
        const total = ASSETS.images.length + ASSETS.sounds.length;

        const updateProgress = () => {
            loaded++;
            setProgress(Math.floor((loaded / total) * 100));

            if (loaded >= total) {
                // 로딩 완료 - 버튼 표시
                setIsReady(true);
            }
        };

        // 이미지 프리로드
        ASSETS.images.forEach(src => {
            const img = new Image();
            img.onload = updateProgress;
            img.onerror = updateProgress;
            img.src = src;
        });

        // 사운드 프리로드
        ASSETS.sounds.forEach(src => {
            fetch(src)
                .then(() => updateProgress())
                .catch(() => updateProgress());
        });
    }, []);

    const handleStart = () => {
        onComplete();
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <img
                    src="/logo.png"
                    alt="Meteor Commando"
                    className={styles.logo}
                />

                {!isReady ? (
                    <>
                        <div className={styles.progressContainer}>
                            <div
                                className={styles.progressBar}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className={styles.status}>
                            {t('loadingAssets')} {progress}%
                        </div>
                    </>
                ) : (
                    <button
                        className={styles.startButton}
                        onClick={handleStart}
                        onTouchEnd={(e) => { e.preventDefault(); handleStart(); }}
                    >
                        🚀 {t('missionStart') || '임무 시작'}
                    </button>
                )}
            </div>
        </div>
    );
}
