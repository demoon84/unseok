import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameCanvas } from './components/Game/GameCanvas';
import { StartScreen } from './components/UI/StartScreen/StartScreen';
import { GameOver } from './components/UI/GameOver/GameOver';
import { VictoryScreen } from './components/UI/VictoryScreen/VictoryScreen';
import { HUD } from './components/UI/HUD/HUD';
import { BossAlert } from './components/UI/BossUI/BossUI';
import { Tutorial, shouldShowTutorial } from './components/UI/Tutorial/Tutorial';
import { Settings } from './components/UI/Settings/Settings';
import { LevelSelect } from './components/UI/LevelSelect/LevelSelect';
import { Achievements } from './components/UI/Achievements/Achievements';
import { ToastContainer, showInfo } from './components/UI/Toast/Toast';
import { GAME_CONFIG, getLevelConfig } from './constants/gameConfig';
import { useGameState } from './hooks/useGameState';
import { useBoss } from './hooks/useBoss';
import { useEffects } from './hooks/useEffects';
import { useSound } from './hooks/useSound';
import { useSettings } from './hooks/useSettings';
import { useAchievements } from './hooks/useAchievements';
import { t, initI18n, onLanguageChange } from './utils/i18n';
import './App.css';

// 언어 초기화
initI18n();

function App() {
    // 언어 변경 시 리렌더링 트리거
    const [, forceUpdate] = useState(0);
    useEffect(() => {
        return onLanguageChange(() => forceUpdate(n => n + 1));
    }, []);

    // 튜토리얼 상태
    const [showTutorial, setShowTutorial] = useState(false);

    // 레벨 선택 상태
    const [showLevelSelect, setShowLevelSelect] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(1);

    // 업적 패널 상태
    const [showAchievements, setShowAchievements] = useState(false);

    // 설정 훅
    const {
        soundEnabled,
        toggleSound,
        isPaused,
        setPaused,
        isSettingsOpen,
        openSettings,
        closeSettings
    } = useSettings();

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
    } = useSound(soundEnabled);

    // 업적 훅
    const {
        endGame,
        getAchievements,
        registerKill
    } = useAchievements();

    // Refs
    const useBombRef = useRef(null);
    const bgmRef = useRef(null);

    // 현재 레벨 설정
    const levelConfig = getLevelConfig(selectedLevel);

    // BGM on/off 적용
    useEffect(() => {
        if (bgmRef.current) {
            bgmRef.current.volume = soundEnabled ? 0.3 : 0;
        }
    }, [soundEnabled]);

    // BGM 제어 함수
    const startBGM = useCallback(() => {
        if (bgmRef.current && soundEnabled) {
            bgmRef.current.volume = 0.3;
            bgmRef.current.currentTime = 0;
            bgmRef.current.play().catch(() => { });
        }
    }, [soundEnabled]);

    const stopBGM = useCallback(() => {
        if (bgmRef.current) {
            bgmRef.current.pause();
            bgmRef.current.currentTime = 0;
        }
    }, []);

    // 게임 시작 버튼 클릭 시 레벨 선택으로
    const handleStartClick = useCallback(() => {
        // 첫 방문 시 튜토리얼 표시
        if (shouldShowTutorial()) {
            setShowTutorial(true);
        } else {
            setShowLevelSelect(true);
        }
    }, []);

    // 레벨 선택 후 게임 시작
    const handleLevelSelect = useCallback((level) => {
        setSelectedLevel(level);
        setShowLevelSelect(false);

        // 튜토리얼 체크
        if (shouldShowTutorial()) {
            setShowTutorial(true);
        } else {
            gameStart();
            resetBossState();
            startBGM();
        }
    }, [gameStart, resetBossState, startBGM]);

    // 튜토리얼 닫기 후 레벨 선택으로
    const handleTutorialClose = useCallback(() => {
        setShowTutorial(false);
        setShowLevelSelect(true);
    }, []);

    // 게임 시작 (보스 상태도 리셋)
    const handleStart = useCallback(() => {
        gameStart();
        resetBossState();
        startBGM();
    }, [gameStart, resetBossState, startBGM]);

    // 보스 처치 핸들러
    const handleBossDefeat = useCallback(() => {
        bossDefeat(setBossCount);
        playExplosion(true);
        registerKill(true, false);
    }, [bossDefeat, setBossCount, playExplosion, registerKill]);

    // 데미지 + 효과음
    const handleDamage = useCallback(() => {
        triggerDamageFlash();
        playHit();
    }, [triggerDamageFlash, playHit]);

    // 폭탄 사용 + 효과음
    const handleBombUsed = useCallback(() => {
        triggerBombFlash();
        playBomb();
    }, [triggerBombFlash, playBomb]);

    // 보스 스폰 + 효과음
    const handleBossSpawnWithSound = useCallback((bossNumber) => {
        handleBossSpawn(bossNumber);
        playBossAlert();
    }, [handleBossSpawn, playBossAlert]);

    // 설정에서 Resume
    const handleResume = useCallback(() => {
        closeSettings();
        setPaused(false);
    }, [closeSettings, setPaused]);

    // 게임 오버/승리 효과음 + BGM 정지 + 업적 기록
    useEffect(() => {
        if (gameState === 'gameover') {
            stopBGM();
            playGameOver();
            endGame(score, elapsedTime, powerLevel, false, selectedLevel);
        } else if (gameState === 'victory') {
            stopBGM();
            playVictory();
            endGame(score, elapsedTime, powerLevel, true, selectedLevel);
        }
    }, [gameState, playGameOver, playVictory, stopBGM, score, elapsedTime, powerLevel, selectedLevel, endGame]);

    return (
        <div className="app">
            {/* Toast Container */}
            <ToastContainer />

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
                isPaused={isPaused}
                levelConfig={levelConfig}
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
                {/* 메인 메뉴 */}
                {gameState === 'menu' && !showLevelSelect && (
                    <StartScreen
                        onStart={handleStartClick}
                        onAchievements={() => setShowAchievements(true)}
                        onSettings={openSettings}
                    />
                )}

                {/* 레벨 선택 */}
                {gameState === 'menu' && showLevelSelect && (
                    <LevelSelect
                        onSelect={handleLevelSelect}
                        onBack={() => setShowLevelSelect(false)}
                    />
                )}

                {/* 게임 오버 */}
                {gameState === 'gameover' && (
                    <GameOver
                        score={score}
                        onRestart={handleStart}
                        onMainMenu={() => {
                            setShowLevelSelect(false);
                            setGameState('menu');
                        }}
                    />
                )}

                {/* 승리 */}
                {gameState === 'victory' && (
                    <VictoryScreen
                        score={score}
                        elapsedTime={elapsedTime}
                        level={selectedLevel}
                        onRestart={handleStart}
                        onMainMenu={() => {
                            setShowLevelSelect(false);
                            setGameState('menu');
                        }}
                    />
                )}

                {showBossAlert && <BossAlert />}
            </div>

            {/* HUD + 설정 버튼 */}
            {gameState === 'playing' && !showBossAlert && (
                <>
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
                        totalBosses={levelConfig.TOTAL_BOSSES}
                        level={selectedLevel}
                    />
                </>
            )}

            {/* 튜토리얼 */}
            {showTutorial && (
                <Tutorial onClose={handleTutorialClose} />
            )}

            {/* 설정 패널 */}
            {isSettingsOpen && (
                <Settings
                    soundEnabled={soundEnabled}
                    onToggleSound={toggleSound}
                    isPaused={isPaused && gameState === 'playing'}
                    onResume={handleResume}
                    onClose={closeSettings}
                />
            )}

            {/* 업적 패널 */}
            {showAchievements && (
                <Achievements
                    achievements={getAchievements()}
                    onClose={() => setShowAchievements(false)}
                />
            )}

            {/* 일시정지 오버레이 */}
            {isPaused && gameState === 'playing' && !isSettingsOpen && (
                <div className="pause-overlay" onClick={() => setPaused(false)}>
                    <div className="pause-text">⏸️ {t('pause')}</div>
                    <div className="pause-hint">{t('resume')}</div>
                </div>
            )}
        </div>
    );
}

export default App;
