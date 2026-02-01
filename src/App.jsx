import React, { useRef } from 'react';
import { GameCanvas } from './components/Game/GameCanvas';
import { StartScreen } from './components/UI/StartScreen/StartScreen';
import { GameOver } from './components/UI/GameOver/GameOver';
import { VictoryScreen } from './components/UI/VictoryScreen/VictoryScreen';
import { HUD } from './components/UI/HUD/HUD';
import { BossAlert } from './components/UI/BossUI/BossUI';
import { GAME_CONFIG } from './constants/gameConfig';
import { useGameState } from './hooks/useGameState';
import { useBoss } from './hooks/useBoss';
import { useEffects } from './hooks/useEffects';
import './App.css';

function App() {
    // 게임 상태 관리 훅
    const {
        gameState,
        score,
        energy,
        powerLevel,
        shield,
        bombs,
        elapsedTime,
        bossCount,
        setScore,
        setEnergy,
        setPowerLevel,
        setShield,
        setBombs,
        setBossCount,
        setGameState,
        handleStart: gameStart,
        handleGameOver,
        handleVictory,
    } = useGameState();

    // 보스 시스템 훅
    const {
        showBossAlert,
        showBossHUD,
        showBossWarning,
        handleBossSpawn,
        handleBossDefeat: bossDefeat,
        handleBossDamage,
        resetBossState,
    } = useBoss(handleVictory);

    // 이펙트 훅
    const {
        showDamageFlash,
        showBombFlash,
        triggerDamageFlash,
        triggerBombFlash,
    } = useEffects();

    // Bomb ref
    const useBombRef = useRef(null);

    // 게임 시작 (보스 상태도 리셋)
    const handleStart = () => {
        gameStart();
        resetBossState();
    };

    // 보스 처치 핸들러
    const handleBossDefeat = () => {
        bossDefeat(setBossCount);
    };

    return (
        <div className="app">
            {/* Flash overlay */}
            <div
                className={`flash-overlay ${showDamageFlash ? 'damage-flash' : ''} ${showBossWarning ? 'boss-warning' : ''} ${showBombFlash ? 'bomb-flash' : ''}`}
            />

            {/* Game canvas */}
            <GameCanvas
                gameState={gameState}
                onScoreUpdate={setScore}
                onEnergyUpdate={setEnergy}
                onPowerLevelUpdate={setPowerLevel}
                onShieldUpdate={setShield}
                onBombUpdate={setBombs}
                useBombRef={useBombRef}
                onGameOver={handleGameOver}
                onBossSpawn={handleBossSpawn}
                onBossDefeat={handleBossDefeat}
                onBossDamage={handleBossDamage}
                onDamage={triggerDamageFlash}
                onBombUsed={triggerBombFlash}
                onLevelUp={() => { }}
                elapsedTime={elapsedTime}
                bossCount={bossCount}
            />

            {/* UI Layer */}
            <div className="ui-layer">
                {gameState === 'menu' && (
                    <StartScreen onStart={handleStart} />
                )}

                {gameState === 'gameover' && (
                    <GameOver
                        score={score}
                        onRestart={handleStart}
                        onMainMenu={() => setGameState('menu')}
                    />
                )}

                {gameState === 'victory' && (
                    <VictoryScreen
                        score={score}
                        elapsedTime={elapsedTime}
                        onRestart={handleStart}
                    />
                )}

                {showBossAlert && <BossAlert />}
            </div>

            {/* HUD */}
            {gameState === 'playing' && !showBossAlert && (
                <HUD
                    score={score}
                    energy={energy}
                    maxEnergy={GAME_CONFIG.PLAYER.MAX_ENERGY}
                    powerLevel={powerLevel}
                    shield={shield}
                    bombs={bombs}
                    onUseBomb={() => useBombRef.current?.()}
                    elapsedTime={elapsedTime}
                    bossCount={bossCount}
                    totalBosses={GAME_CONFIG.BOSS.TOTAL_BOSSES}
                />
            )}
        </div>
    );
}

export default App;
