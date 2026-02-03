import React, { useCallback, useState, useEffect } from 'react';
import styles from './StartScreen.module.css';
import { fetchRankings, getTodayRanking, getWeeklyRanking } from '../../../utils/leaderboard';
import { t } from '../../../utils/i18n';

export function StartScreen({ onStart, onAchievements }) {
    const [isLaunching, setIsLaunching] = useState(false);
    const [showRanking, setShowRanking] = useState(false);
    const [activeTab, setActiveTab] = useState('today');
    const [rankings, setRankings] = useState([]);

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
        if (isLaunching) return;

        setIsLaunching(true);

        // 도킹 아웃과 동시에 게임 시작 (비행기 진입 동기화)
        setTimeout(() => {
            onStart();
        }, 100);
    }, [onStart, isLaunching]);

    return (
        <div className={styles.container}>
            {/* 순위 토글 버튼 */}
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

            {/* 업적 버튼 */}
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

            {/* 순위 패널 */}
            {showRanking && (
                <div className={styles.rankingPanel}>
                    <div className={styles.rankingHeader}>
                        <h3>🏆 순위</h3>
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
                            오늘
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'weekly' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('weekly')}
                            onTouchEnd={(e) => { e.preventDefault(); setActiveTab('weekly'); }}
                        >
                            주간
                        </button>
                    </div>
                    <div className={styles.rankingList}>
                        {rankings.length === 0 ? (
                            <p className={styles.empty}>아직 기록이 없습니다</p>
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
            )}

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
                        onTouchEnd={(e) => { e.preventDefault(); handleStart(); }}
                        disabled={isLaunching}
                    >
                        임무 시작
                    </button>
                </div>
            </div>
        </div>
    );
}
