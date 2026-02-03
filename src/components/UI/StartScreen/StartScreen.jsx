import React, { useCallback, useState, useEffect } from 'react';
import styles from './StartScreen.module.css';
import { fetchRankings, getTodayRanking, getWeeklyRanking } from '../../../utils/leaderboard';
import { t } from '../../../utils/i18n';

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

export function StartScreen({ onStart, onAchievements, onSettings }) {
    const [isLaunching, setIsLaunching] = useState(false);
    const [showRanking, setShowRanking] = useState(false);
    const [activeTab, setActiveTab] = useState('today');
    const [rankings, setRankings] = useState([]);

    // 로딩 상태 (sessionStorage로 1회만 표시)
    const alreadyLoaded = sessionStorage.getItem('meteor-commando-loaded') === 'true';
    const [loadProgress, setLoadProgress] = useState(alreadyLoaded ? 100 : 0);
    const [isLoaded, setIsLoaded] = useState(alreadyLoaded);

    // 에셋 프리로드 (1회만)
    useEffect(() => {
        // 이미 로딩 완료했으면 건너뛰기
        if (alreadyLoaded) return;

        let loaded = 0;
        const total = ASSETS.images.length + ASSETS.sounds.length;

        const updateProgress = () => {
            loaded++;
            // 에셋 로딩은 50%까지만 표시
            setLoadProgress(Math.floor((loaded / total) * 50));

            if (loaded >= total) {
                // 에셋 로딩 완료 후 50%에서 100%까지 2초간 채우기
                let currentProgress = 50;
                const interval = setInterval(() => {
                    currentProgress += 2.5; // 2초 동안 50% 증가 (40번 * 50ms = 2000ms)
                    setLoadProgress(Math.min(100, Math.floor(currentProgress)));

                    if (currentProgress >= 100) {
                        clearInterval(interval);
                        setIsLoaded(true);
                        sessionStorage.setItem('meteor-commando-loaded', 'true');
                    }
                }, 50);
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
    }, [alreadyLoaded]);

    // 순위 데이터 로드
    useEffect(() => {
        fetchRankings().then(() => {
            setRankings(activeTab === 'today' ? getTodayRanking() : getWeeklyRanking());
        });
    }, []);

    // 탭 변경 시 순위 업데이트
    useEffect(() => {
        setRankings(activeTab === 'today' ? getTodayRanking() : getWeeklyRanking());
    }, [activeTab]);

    // 클릭 핸들러
    const handleStart = useCallback(() => {
        if (isLaunching || !isLoaded) return;

        setIsLaunching(true);

        // 도킹 아웃과 동시에 게임 시작 (비행기 진입 동기화)
        setTimeout(() => {
            onStart();
        }, 100);
    }, [onStart, isLaunching, isLoaded]);

    return (
        <div className={styles.container}>
            {/* 설정 버튼 (왼쪽 상단) */}
            <button
                className={styles.settingsToggle}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSettings?.();
                }}
                onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSettings?.();
                }}
            >
                ⚙️
            </button>

            {/* 업적 버튼 (오른쪽 상단) */}
            <button
                className={styles.achievementsToggle}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAchievements?.();
                }}
                onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAchievements?.();
                }}
            >
                🎖️
            </button>

            {/* 순위 버튼 (업적 아래) */}
            <button
                className={styles.rankingToggle}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowRanking(!showRanking);
                }}
                onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowRanking(!showRanking);
                }}
            >
                🏆
            </button>

            {/* 순위 패널 */}
            {showRanking && (
                <div
                    className={styles.rankingOverlay}
                    onClick={() => setShowRanking(false)}
                    onTouchEnd={(e) => { e.target === e.currentTarget && setShowRanking(false); }}
                >
                    <div
                        className={styles.rankingModal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.rankingHeader}>
                            <h2 className={styles.rankingTitle}>🏆 {t('ranking')}</h2>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowRanking(false)}
                                onTouchEnd={(e) => { e.preventDefault(); setShowRanking(false); }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.rankingTabs}>
                            <button
                                className={`${styles.tab} ${activeTab === 'today' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('today')}
                                onTouchEnd={(e) => { e.preventDefault(); setActiveTab('today'); }}
                            >
                                {t('today')}
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'weekly' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('weekly')}
                                onTouchEnd={(e) => { e.preventDefault(); setActiveTab('weekly'); }}
                            >
                                {t('weekly')}
                            </button>
                        </div>
                        <div className={styles.rankingList}>
                            {rankings.length === 0 ? (
                                <p className={styles.empty}>{t('noRecords')}</p>
                            ) : (
                                rankings.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.rankItem} ${index === 0 ? styles.gold :
                                            index === 1 ? styles.silver :
                                                index === 2 ? styles.bronze : ''
                                            }`}
                                    >
                                        <span className={styles.rank}>{index + 1}</span>
                                        <span className={styles.name}>{item.name}</span>
                                        <span className={styles.rankScore}>{item.score.toLocaleString()}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 로고 */}
            <div className={styles.logoSection}>
                <img src="/logo.png" alt="운석특공대" className={styles.logo} />
            </div>

            {/* 기지/격납고 - 시작시 아래로 내려감 */}
            <div className={`${styles.hangarSection} ${isLaunching ? styles.hangarHide : ''}`}>
                <img src="/hangar.png" alt="Hangar" className={styles.hangar} />

                <div className={styles.buttonContainer}>
                    {!isLoaded ? (
                        // 로딩 중일 때 프로그레스바 표시
                        <div className={styles.loadingContainer}>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${loadProgress}%` }}
                                />
                            </div>
                            <span className={styles.loadingText}>
                                {t('loadingAssets')} {loadProgress}%
                            </span>
                        </div>
                    ) : (
                        // 로딩 완료 시 시작 버튼 표시
                        <button
                            className={`${styles.startButton} ${isLaunching ? styles.hidden : ''}`}
                            onClick={handleStart}
                            onTouchEnd={(e) => { e.preventDefault(); handleStart(); }}
                            disabled={isLaunching}
                        >
                            {t('startMission')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
