import React, { useState } from 'react';
import { t } from '../../../utils/i18n';
import { loadUnlockedLevels } from '../../../hooks/useAchievements';
import styles from './LevelSelect.module.css';

// 레벨 정보
const LEVELS = [
    {
        id: 1,
        name: { ko: '레벨 1: 첫 임무', en: 'Level 1: First Mission' },
        description: { ko: '30초 간격, 보스 3회', en: '30s interval, 3 bosses' },
        difficulty: 1,
        color: '#22c55e'
    },
    {
        id: 2,
        name: { ko: '레벨 2: 심화 작전', en: 'Level 2: Advanced Op' },
        description: { ko: '25초 간격, 보스 4회', en: '25s interval, 4 bosses' },
        difficulty: 2,
        color: '#f59e0b'
    },
    {
        id: 3,
        name: { ko: '레벨 3: 최종 결전', en: 'Level 3: Final Battle' },
        description: { ko: '20초 간격, 보스 5회', en: '20s interval, 5 bosses' },
        difficulty: 3,
        color: '#ef4444'
    }
];

export function LevelSelect({ onSelect, onBack }) {
    const unlockedLevels = loadUnlockedLevels();
    const lang = localStorage.getItem('meteor-commando-lang') || 'ko';
    // 기본적으로 첫 번째 해금된 레벨 선택
    const [selectedLevel, setSelectedLevel] = useState(unlockedLevels[0] || 1);

    const handleSelect = (levelId) => {
        setSelectedLevel(levelId);
    };

    const handleStart = () => {
        if (selectedLevel) {
            onSelect(selectedLevel);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.modal}>
                <h2 className={styles.title}>{t('selectLevel')}</h2>

                <div className={styles.levels}>
                    {LEVELS.map(level => {
                        const isUnlocked = unlockedLevels.includes(level.id);
                        const isSelected = selectedLevel === level.id;

                        return (
                            <button
                                key={level.id}
                                className={`${styles.levelCard} ${isUnlocked ? '' : styles.locked} ${isSelected ? styles.selected : ''}`}
                                style={{ '--level-color': level.color }}
                                onClick={() => isUnlocked && handleSelect(level.id)}
                                onTouchEnd={(e) => {
                                    e.preventDefault();
                                    if (isUnlocked) handleSelect(level.id);
                                }}
                                disabled={!isUnlocked}
                            >
                                <div className={styles.levelHeader}>
                                    <span className={styles.levelNumber}>{level.id}</span>
                                    <div className={styles.difficulty}>
                                        {[...Array(level.difficulty)].map((_, i) => (
                                            <span key={i} className={styles.star}>★</span>
                                        ))}
                                    </div>
                                </div>
                                <span className={styles.levelName}>{level.name[lang]}</span>
                                <span className={styles.levelDesc}>{level.description[lang]}</span>

                                {!isUnlocked && (
                                    <div className={styles.lockOverlay}>
                                        <span className={styles.lockIcon}>🔒</span>
                                        <span className={styles.lockText}>
                                            {lang === 'ko' ? '이전 레벨 클리어 필요' : 'Clear previous level'}
                                        </span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className={styles.buttonRow}>
                    <button
                        className={styles.backBtn}
                        onClick={onBack}
                        onTouchEnd={(e) => { e.preventDefault(); onBack(); }}
                    >
                        ← {t('mainMenu')}
                    </button>

                    <button
                        className={`${styles.startBtn} ${selectedLevel ? '' : styles.disabled}`}
                        onClick={handleStart}
                        onTouchEnd={(e) => { e.preventDefault(); handleStart(); }}
                        disabled={!selectedLevel}
                    >
                        {lang === 'ko' ? '시작' : 'Start'} →
                    </button>
                </div>
            </div>
        </div>
    );
}

// 레벨 설정 가져오기
export function getLevelConfig(levelId) {
    const configs = {
        1: {
            bossIntervalSeconds: 30,
            totalBosses: 3,
            enemySpawnRate: 1.0,
            enemyHpMultiplier: 1.0,
            bossHpMultiplier: 1.0,
            scoreMultiplier: 1.0
        },
        2: {
            bossIntervalSeconds: 25,
            totalBosses: 4,
            enemySpawnRate: 1.2,
            enemyHpMultiplier: 1.3,
            bossHpMultiplier: 1.5,
            scoreMultiplier: 1.5
        },
        3: {
            bossIntervalSeconds: 20,
            totalBosses: 5,
            enemySpawnRate: 1.5,
            enemyHpMultiplier: 1.6,
            bossHpMultiplier: 2.0,
            scoreMultiplier: 2.0
        }
    };
    return configs[levelId] || configs[1];
}
