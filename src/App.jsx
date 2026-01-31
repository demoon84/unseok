import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameCanvas } from './components/Game/GameCanvas';
import { StartScreen } from './components/UI/StartScreen';
import { GameOver } from './components/UI/GameOver';
import { VictoryScreen } from './components/UI/VictoryScreen';
import { HUD } from './components/UI/HUD';
import { BossAlert, BossHUD } from './components/UI/BossUI';
import { GAME_CONFIG } from './constants/gameConfig';
import './App.css';

function App() {
    // Game state: 'menu' | 'playing' | 'gameover' | 'victory'
    const [gameState, setGameState] = useState('menu');

    // Game data
    const [score, setScore] = useState(0);
    const [energy, setEnergy] = useState(GAME_CONFIG.PLAYER.MAX_ENERGY);
    const [powerLevel, setPowerLevel] = useState(1);
    const [shield, setShield] = useState(0); // 보호막 스택
    const [elapsedTime, setElapsedTime] = useState(0); // 경과 시간 (초)
    const [bossCount, setBossCount] = useState(0); // 처치한 보스 수

    // Boss state
    const [showBossAlert, setShowBossAlert] = useState(false);
    const [showBossHUD, setShowBossHUD] = useState(false);
    const [bossHp, setBossHp] = useState(0);
    const [bossMaxHp, setBossMaxHp] = useState(0);

    // Effects state
    const [showDamageFlash, setShowDamageFlash] = useState(false);
    const [showBossWarning, setShowBossWarning] = useState(false);

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
        setElapsedTime(0);
        setBossCount(0);
        setShowBossHUD(false);
        setShowBossAlert(false);
        setBossHp(0);
        setBossMaxHp(0);
    }, []);

    // Game over
    const handleGameOver = useCallback(() => {
        setGameState('gameover');
        setShowBossHUD(false);
        setShowBossAlert(false);
    }, []);

    // Victory (3rd boss defeated)
    const handleVictory = useCallback(() => {
        setGameState('victory');
        setShowBossHUD(false);
        setShowBossAlert(false);
    }, []);

    // Boss spawn
    const handleBossSpawn = useCallback((bossNumber) => {
        setShowBossAlert(true);
        setShowBossWarning(true);

        setTimeout(() => {
            setShowBossAlert(false);
            setShowBossWarning(false);
            setShowBossHUD(true);
        }, GAME_CONFIG.BOSS.WARNING_DURATION_MS);
    }, []);

    // Boss defeat
    const handleBossDefeat = useCallback(() => {
        setShowBossHUD(false);
        setBossCount(prev => {
            const newCount = prev + 1;
            // 3번째 보스 처치 시 승리
            if (newCount >= GAME_CONFIG.BOSS.TOTAL_BOSSES) {
                setTimeout(() => handleVictory(), 1000);
            }
            return newCount;
        });
    }, [handleVictory]);

    // Boss damage
    const handleBossDamage = useCallback((hp, maxHp) => {
        setBossHp(hp);
        setBossMaxHp(maxHp);
    }, []);

    // Player damage
    const handleDamage = useCallback(() => {
        setShowDamageFlash(true);
        setTimeout(() => setShowDamageFlash(false), 300);
    }, []);

    // Level up
    const handleLevelUp = useCallback(() => {
        // Could add visual effects here
    }, []);

    return (
        <div className="app">
            {/* Flash overlay for damage effects */}
            <div
                className={`flash-overlay ${showDamageFlash ? 'damage-flash' : ''} ${showBossWarning ? 'boss-warning' : ''}`}
            />

            {/* Game canvas */}
            <GameCanvas
                gameState={gameState}
                onScoreUpdate={setScore}
                onEnergyUpdate={setEnergy}
                onPowerLevelUpdate={setPowerLevel}
                onShieldUpdate={setShield}
                onGameOver={handleGameOver}
                onBossSpawn={handleBossSpawn}
                onBossDefeat={handleBossDefeat}
                onBossDamage={handleBossDamage}
                onDamage={handleDamage}
                onLevelUp={handleLevelUp}
                elapsedTime={elapsedTime}
                bossCount={bossCount}
            />

            {/* UI Layer */}
            <div className="ui-layer">
                {/* Start Screen */}
                {gameState === 'menu' && (
                    <StartScreen onStart={handleStart} />
                )}

                {/* Game Over Screen */}
                {gameState === 'gameover' && (
                    <GameOver
                        score={score}
                        onRestart={handleStart}
                        onMainMenu={() => setGameState('menu')}
                    />
                )}

                {/* Victory Screen */}
                {gameState === 'victory' && (
                    <VictoryScreen
                        score={score}
                        elapsedTime={elapsedTime}
                        onRestart={handleStart}
                    />
                )}

                {/* Boss Alert */}
                {showBossAlert && (
                    <BossAlert />
                )}
            </div>

            {/* HUD (visible during gameplay) */}
            {gameState === 'playing' && !showBossAlert && (
                <HUD
                    score={score}
                    energy={energy}
                    maxEnergy={GAME_CONFIG.PLAYER.MAX_ENERGY}
                    powerLevel={powerLevel}
                    shield={shield}
                    elapsedTime={elapsedTime}
                    bossCount={bossCount}
                    totalBosses={GAME_CONFIG.BOSS.TOTAL_BOSSES}
                />
            )}
        </div>
    );
}

export default App;


