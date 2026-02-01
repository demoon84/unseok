import React, { useCallback, useState, useEffect } from 'react';
import styles from './VictoryScreen.module.css';
import { addScore, fetchRankings, getTodayRanking, getWeeklyRanking, isHighScore } from '../../../utils/leaderboard';

// 랜덤 이름 목록
const RANDOM_NAMES = [
    '우주조종사', '스타파일럿', '은하수호자', '혜성사냥꾼', '네뷸라',
    '오리온', '안드로메다', '시리우스', '베가', '알타이르',
    '폴라리스', '카시오페아', '플레이아데스', '드래코', '페가수스',
    '피닉스', '하이드라', '센타우루스', '아퀼라', '시그너스'
];

export function VictoryScreen({ score, elapsedTime, onRestart, onMainMenu }) {
    const [name, setName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [activeTab, setActiveTab] = useState('today');
    const [todayRanking, setTodayRanking] = useState([]);
    const [weeklyRanking, setWeeklyRanking] = useState([]);
    const [canSubmit, setCanSubmit] = useState(false);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // 랜덤 이름 생성
    const generateRandomName = () => {
        const randomIndex = Math.floor(Math.random() * RANDOM_NAMES.length);
        setName(RANDOM_NAMES[randomIndex]);
    };

    useEffect(() => {
        // localStorage에서 마지막 사용 이름 불러오기
        const savedName = localStorage.getItem('playerName');
        if (savedName) {
            setName(savedName);
        }
        // 순위 데이터 로드
        fetchRankings().then(() => {
            setCanSubmit(isHighScore(score));
            setTodayRanking(getTodayRanking());
            setWeeklyRanking(getWeeklyRanking());
        });
    }, [score]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name.trim() && !submitted) {
            // 이름을 localStorage에 저장
            localStorage.setItem('playerName', name.trim());
            await addScore(name.trim(), score);
            setSubmitted(true);
            setTodayRanking(getTodayRanking());
            setWeeklyRanking(getWeeklyRanking());
        }
    };

    const handleRestart = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        onRestart();
    }, [onRestart]);

    const handleMainMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        onMainMenu();
    }, [onMainMenu]);

    const rankings = activeTab === 'today' ? todayRanking : weeklyRanking;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>MISSION COMPLETE</h2>
            <div className={styles.subtitle}>🎉 축하합니다! 🎉</div>
            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>최종 점수</span>
                    <span className={styles.statValue}>{Math.floor(score).toLocaleString()}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>클리어 시간</span>
                    <span className={styles.statValue}>{formatTime(elapsedTime)}</span>
                </div>
            </div>

            {/* 순위 등록 폼 */}
            {canSubmit && !submitted && (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <p className={styles.congrats}>🏆 순위권 진입!</p>
                    <div className={styles.inputRow}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="이름을 입력하세요"
                            value={name}
                            onChange={(e) => setName(e.target.value.slice(0, 10))}
                            maxLength={10}
                            onTouchStart={(e) => e.stopPropagation()}
                        />
                        <button
                            type="button"
                            className={styles.randomButton}
                            onClick={generateRandomName}
                            onTouchEnd={(e) => { e.preventDefault(); generateRandomName(); }}
                            title="랜덤 이름"
                        >
                            🎲
                        </button>
                    </div>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={!name.trim()}
                        onTouchEnd={(e) => { e.preventDefault(); if (name.trim()) handleSubmit(e); }}
                    >
                        등록
                    </button>
                </form>
            )}

            {/* 순위 탭 */}
            <div className={styles.tabs}>
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

            {/* 순위 리스트 */}
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
                            <span className={styles.rankName}>{item.name}</span>
                            <span className={styles.rankScore}>{item.score.toLocaleString()}</span>
                        </div>
                    ))
                )}
            </div>

            <div className={styles.buttonGroup}>
                <button
                    className={styles.restartButton}
                    onClick={handleRestart}
                    onTouchEnd={handleRestart}
                >
                    다시 시작
                </button>
                <button
                    className={styles.homeButton}
                    onClick={handleMainMenu}
                    onTouchEnd={handleMainMenu}
                >
                    홈
                </button>
            </div>
        </div>
    );
}

