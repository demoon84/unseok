import React, { useState, useEffect } from 'react';
import styles from './GameOver.module.css';
import { addScore, getTodayRanking, getWeeklyRanking, isHighScore } from '../../utils/leaderboard';

export function GameOver({ score, onRestart, onMainMenu }) {
    const [name, setName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [activeTab, setActiveTab] = useState('today');
    const [todayRanking, setTodayRanking] = useState([]);
    const [weeklyRanking, setWeeklyRanking] = useState([]);
    const [canSubmit, setCanSubmit] = useState(false);

    useEffect(() => {
        setCanSubmit(isHighScore(score));
        setTodayRanking(getTodayRanking());
        setWeeklyRanking(getWeeklyRanking());
    }, [score]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() && !submitted) {
            addScore(name.trim(), score);
            setSubmitted(true);
            setTodayRanking(getTodayRanking());
            setWeeklyRanking(getWeeklyRanking());
        }
    };

    const rankings = activeTab === 'today' ? todayRanking : weeklyRanking;

    return (
        <div className={styles.container}>
            <div className={styles.panel}>
                <h1 className={styles.title}>GAME OVER</h1>
                <div className={styles.score}>
                    <span className={styles.scoreLabel}>최종 점수</span>
                    <span className={styles.scoreValue}>{Math.floor(score).toLocaleString()}</span>
                </div>

                {/* 이름 입력 폼 */}
                {canSubmit && !submitted && (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <p className={styles.congrats}>🎉 순위권 진입!</p>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="이름을 입력하세요"
                            value={name}
                            onChange={(e) => setName(e.target.value.slice(0, 10))}
                            maxLength={10}
                            autoFocus
                        />
                        <button type="submit" className={styles.submitButton} disabled={!name.trim()}>
                            등록
                        </button>
                    </form>
                )}

                {submitted && (
                    <p className={styles.submitted}>✅ 순위에 등록되었습니다!</p>
                )}

                {/* 순위 탭 */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'today' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('today')}
                    >
                        오늘의 순위
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'weekly' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('weekly')}
                    >
                        주간 순위
                    </button>
                </div>

                {/* 순위 리스트 */}
                <div className={styles.rankingList}>
                    {rankings.length === 0 ? (
                        <p className={styles.empty}>아직 기록이 없습니다</p>
                    ) : (
                        rankings.map((entry, index) => (
                            <div key={index} className={`${styles.rankItem} ${index === 0 ? styles.gold : index === 1 ? styles.silver : index === 2 ? styles.bronze : ''}`}>
                                <span className={styles.rank}>{index + 1}</span>
                                <span className={styles.name}>{entry.name}</span>
                                <span className={styles.rankScore}>{entry.score.toLocaleString()}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* 버튼 */}
                <div className={styles.buttons}>
                    <button className={styles.restartButton} onClick={onRestart}>
                        다시 시작
                    </button>
                    <button className={styles.menuButton} onClick={onMainMenu}>
                        메인 메뉴
                    </button>
                </div>
            </div>
        </div>
    );
}
