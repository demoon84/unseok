import { useState, useCallback, useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

/**
 * 게임 전역 상태 관리 훅
 * - 게임 상태 (menu, playing, gameover, victory)
 * - 플레이어 데이터 (점수, 에너지, 파워레벨, 실드, 폭탄)
 * - 경과 시간 및 보스 카운트
 */
export function useGameState() {
    // Game state: 'menu' | 'playing' | 'gameover' | 'victory'
    const [gameState, setGameState] = useState('menu');

    // Game data
    const [score, setScore] = useState(0);
    const [energy, setEnergy] = useState(GAME_CONFIG.PLAYER.MAX_ENERGY);
    const [powerLevel, setPowerLevel] = useState(1);
    const [shield, setShield] = useState(0);
    const [bombs, setBombs] = useState(2);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [bossCount, setBossCount] = useState(0);

    // Timer ref
    const timerRef = useRef(null);

    // 경과 시간 타이머
    useEffect(() => {
        if (gameState === 'playing') {
            setElapsedTime(0);
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [gameState]);

    // Start game
    const handleStart = useCallback(() => {
        setGameState('playing');
        setScore(0);
        setEnergy(GAME_CONFIG.PLAYER.MAX_ENERGY);
        setPowerLevel(1);
        setShield(0);
        setBombs(2);
        setElapsedTime(0);
        setBossCount(0);
    }, []);

    // Game over
    const handleGameOver = useCallback(() => {
        setGameState('gameover');
    }, []);

    // Victory - 남은 에너지 보너스 + 클리어 타임 보너스
    const handleVictory = useCallback(() => {
        // 클리어 타임 보너스 (빠른 클리어 = 높은 보너스)
        let clearTimeBonus = 0;
        if (elapsedTime <= 120) clearTimeBonus = 20000;      // 2분 이내
        else if (elapsedTime <= 180) clearTimeBonus = 10000; // 3분 이내
        else if (elapsedTime <= 240) clearTimeBonus = 5000;  // 4분 이내
        // 4분 초과: 0점

        const energyBonus = Math.floor(energy * 10); // 에너지 × 10 보너스
        setScore(prev => prev + energyBonus + clearTimeBonus);
        setGameState('victory');
    }, [energy, elapsedTime]);

    return {
        // State
        gameState,
        score,
        energy,
        powerLevel,
        shield,
        bombs,
        elapsedTime,
        bossCount,
        // Setters
        setScore,
        setEnergy,
        setPowerLevel,
        setShield,
        setBombs,
        setBossCount,
        setGameState,
        // Handlers
        handleStart,
        handleGameOver,
        handleVictory,
    };
}
