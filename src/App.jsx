import React, { useRef, useEffect } from 'react';
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
import { useSound } from './hooks/useSound';
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

    // 사운드 훅 (효과음만)
    const {
        playShoot,
        playExplosion,
        playPickup,
        playHit,
        playBulletHit,
        playBomb,
        playBossAlert,
        playGameOver,
        playVictory,
    } = useSound();

    // Refs
    const useBombRef = useRef(null);
    const bgmRef = useRef(null);

    // BGM 제어 함수
    const startBGM = () => {
        if (bgmRef.current) {
            bgmRef.current.volume = 0.01; // BGM 최소
            bgmRef.current.currentTime = 0;
            bgmRef.current.play().catch(() => { });
        }
    };

    const stopBGM = () => {
        if (bgmRef.current) {
            bgmRef.current.pause();
            bgmRef.current.currentTime = 0;
        }
    };

    // 게임 시작 (보스 상태도 리셋)
    const handleStart = () => {
        gameStart();
        resetBossState();
        startBGM(); // BGM 시작
    };

    // 보스 처치 핸들러
    const handleBossDefeat = () => {
        bossDefeat(setBossCount);
        playExplosion(true); // 보스 폭발음
    };

    // 데미지 + 효과음
    const handleDamage = () => {
        triggerDamageFlash();
        playHit();
    };

    // 폭탄 사용 + 효과음
    const handleBombUsed = () => {
        triggerBombFlash();
        playBomb();
    };

    // 보스 스폰 + 효과음
    const handleBossSpawnWithSound = (bossNumber) => {
        handleBossSpawn(bossNumber);
        playBossAlert();
    };

    // 게임 오버/승리 효과음 + BGM 정지
    useEffect(() => {
        if (gameState === 'gameover') {
            stopBGM();
            playGameOver();
        } else if (gameState === 'victory') {
            stopBGM();
            playVictory();
        }
    }, [gameState, playGameOver, playVictory, stopBGM]);

    return (
        <div className="app">
            {/* BGM Audio Tag */}
            <audio
                ref={bgmRef}
                src="/sounds/through_space.ogg"
                loop
                preload="auto"
                style={{ display: 'none' }}
            />

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
                onBossSpawn={handleBossSpawnWithSound}
                onBossDefeat={handleBossDefeat}
                onBossDamage={handleBossDamage}
                onDamage={handleDamage}
                onBombUsed={handleBombUsed}
                onLevelUp={() => { }}
                onShoot={playShoot}
                onExplosion={playExplosion}
                onPickup={playPickup}
                onBulletHit={playBulletHit}
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
                        onMainMenu={() => setGameState('menu')}
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
