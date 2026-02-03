import React, { useState, useEffect } from 'react';
import styles from './GameOver.module.css';
import { addScore, fetchRankings, getTodayRanking, getWeeklyRanking, isHighScore } from '../../../utils/leaderboard';
import { ShareButton } from '../ShareButton/ShareButton';
import { t } from '../../../utils/i18n';

// 랜덤 이름 목록
const RANDOM_NAMES = [
    '우주조종사', '스타파일럿', '은하수호자', '혜성사냥꾼', '네뷸라',
    '오리온', '안드로메다', '시리우스', '베가', '알타이르',
    '폴라리스', '카시오페아', '플레이아데스', '드래코', '페가수스',
    '피닉스', '하이드라', '센타우루스', '아퀼라', '시그너스'
];

export function GameOver({ score, onRestart, onMainMenu }) {
    const [name, setName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [activeTab, setActiveTab] = useState('today');
    const [todayRanking, setTodayRanking] = useState([]);
    const [weeklyRanking, setWeeklyRanking] = useState([]);
    const [canSubmit, setCanSubmit] = useState(false);

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
                        <div className={styles.inputRow}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="이름을 입력하세요"
                                value={name}
                                onChange={(e) => setName(e.target.value.slice(0, 10))}
                                maxLength={10}
                                autoFocus
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

                {submitted && (
                    <p className={styles.submitted}>✅ 순위에 등록되었습니다!</p>
                )}

                {/* 순위 탭 */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'today' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('today')}
                        onTouchEnd={(e) => { e.preventDefault(); setActiveTab('today'); }}
                    >
                        오늘의 순위
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'weekly' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('weekly')}
                        onTouchEnd={(e) => { e.preventDefault(); setActiveTab('weekly'); }}
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
                    <button
                        className={styles.restartButton}
                        onClick={onMainMenu}
                        onTouchEnd={(e) => { e.preventDefault(); onMainMenu(); }}
                    >
                        {t('restart')}
                    </button>
                    <ShareButton score={Math.floor(score)} />
                </div>
            </div>
        </div>
    );
}
