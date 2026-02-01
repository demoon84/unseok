import React, { useRef, useEffect, useCallback } from 'react';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { Enemy } from '../../game/Enemy';
import { Item } from '../../game/Item';
import { Particle } from '../../game/Particle';
import { drawPlayer, drawBullets, drawStars, initStars } from '../../game/renderer';
import { useInput } from '../../hooks/useInput';
import { useWeapon } from '../../hooks/useWeapon';
import styles from './GameCanvas.module.css';

export function GameCanvas({
    gameState,
    onScoreUpdate,
    onEnergyUpdate,
    onPowerLevelUpdate,
    onShieldUpdate,
    onBombUpdate,
    useBombRef,
    onGameOver,
    onBossSpawn,
    onBossDefeat,
    onBossDamage,
    onDamage,
    onBombUsed,
    onLevelUp,
    onShoot,
    onExplosion,
    onPickup,
    onBulletHit,
    elapsedTime = 0,
    bossCount = 0
}) {
    const canvasRef = useRef(null);
    const animationIdRef = useRef(null);
    const starsRef = useRef([]);
    const bulletsRef = useRef([]);
    const enemiesRef = useRef([]);
    const itemsRef = useRef([]);
    const particlesRef = useRef([]);
    const spawnTimerRef = useRef(0);
    const scoreRef = useRef(0);
    const bossActiveRef = useRef(false);
    const bossRef = useRef(null);
    const gameStartTimeRef = useRef(Date.now()); // 게임 시작 시간
    const bossSpawnedCountRef = useRef(0); // 스폰된 보스 수
    const lastBossDefeatTimeRef = useRef(null); // 마지막 보스 처치 시간 (Date.now())
    const fullPowerStartTimeRef = useRef(null); // 풀파워 모드 시작 시간
    const lastWeaponDecayTimeRef = useRef(null); // 무기 레벨 감소 타이머
    const bombEffectRef = useRef({ active: false, startTime: 0, centerX: 0, centerY: 0 }); // 폭탄 효과
    const initialPowerDroppedRef = useRef(false); // 초기 파워 드랍 여부
    const initialShieldDroppedRef = useRef(false); // 초기 쉴드 드랍 여부
    const bossSpawnTimeRef = useRef(null); // 보스 스폰 시간 (타이머 보너스 계산용)

    const playerRef = useRef({
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        speed: GAME_CONFIG.PLAYER.SPEED,
        powerLevel: 1,
        energy: GAME_CONFIG.PLAYER.MAX_ENERGY,
        maxEnergy: GAME_CONFIG.PLAYER.MAX_ENERGY,
        shield: 0, // 보호막 스택 (최대 3)
        bombs: 2, // 폭탄 보유량 (초기값 2, 최대 4)
        invincible: false,
        invincibleTimer: 0,
        isKeyboardMode: false
    });

    const gameActiveRef = useRef(false);
    const gameLoopRef = useRef(null);
    const resetGameRef = useRef(null);

    const { updatePlayerPosition } = useInput(canvasRef, playerRef, gameActiveRef);
    const { shoot, updateBullets } = useWeapon(playerRef, bulletsRef);

    // Initialize canvas and stars
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        starsRef.current = initStars(canvas.width, canvas.height);

        const player = playerRef.current;
        player.x = canvas.width / 2;
        player.y = canvas.height * GAME_CONFIG.PLAYER.INITIAL_Y_RATIO;
        player.targetX = player.x;
        player.targetY = player.y;
    }, []);

    // Handle resize
    useEffect(() => {
        const handleResize = () => initCanvas();
        window.addEventListener('resize', handleResize);
        initCanvas();
        return () => window.removeEventListener('resize', handleResize);
    }, [initCanvas]);
    // B key for bomb - useBomb 함수 정의 후에 동작해야 함
    const bombKeyHandlerRef = useRef(null);
    bombKeyHandlerRef.current = () => {
        if (gameActiveRef.current) {
            const player = playerRef.current;
            const canvas = canvasRef.current;
            if (!canvas || player.bombs <= 0) return;

            // 폭탄 소모
            player.bombs -= 1;
            onBombUpdate?.(player.bombs);

            // 폭탄 효과 활성화 (충격파 애니메이션)
            bombEffectRef.current = {
                active: true,
                startTime: Date.now(),
                centerX: player.x,
                centerY: player.y
            };

            // 화면 전체 플래시 효과 트리거
            onBombUsed?.();

            // 모든 적 제거 (보스 제외) 및 점수 획득
            let scoreGain = 0;
            for (const enemy of enemiesRef.current) {
                for (let i = 0; i < 15; i++) {
                    particlesRef.current.push(new Particle(enemy.x, enemy.y, '#f97316'));
                }
                scoreGain += 50;
            }

            // 보스에게 데미지 (단계별 차등: 1차=50%, 2차=40%, 3차=35%)
            if (bossRef.current) {
                const bossNum = bossSpawnedCountRef.current;
                const damagePercent = bossNum === 1 ? 0.5 : (bossNum === 2 ? 0.4 : 0.35);
                const bossDamage = Math.floor(bossRef.current.maxHp * damagePercent);
                bossRef.current.hp -= bossDamage;
                onBossDamage?.(bossRef.current.hp, bossRef.current.maxHp);

                for (let i = 0; i < 30; i++) {
                    particlesRef.current.push(new Particle(bossRef.current.x, bossRef.current.y, '#f97316'));
                }
            }

            enemiesRef.current = [];
            scoreRef.current += scoreGain;
            onScoreUpdate(scoreRef.current);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'KeyB') {
                bombKeyHandlerRef.current?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Reset game state
    const resetGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        scoreRef.current = 0;
        bulletsRef.current = [];
        enemiesRef.current = [];
        itemsRef.current = [];
        particlesRef.current = [];
        spawnTimerRef.current = 0;
        bossActiveRef.current = false;
        bossRef.current = null;
        gameStartTimeRef.current = Date.now(); // 게임 시작 시간 초기화
        bossSpawnedCountRef.current = 0; // 보스 카운트 초기화
        lastBossDefeatTimeRef.current = null; // 보스 처치 시간 초기화
        lastWeaponDecayTimeRef.current = Date.now(); // 무기 감소 타이머 초기화
        initialPowerDroppedRef.current = false; // 초기 파워 드랍 초기화
        initialShieldDroppedRef.current = false; // 초기 쉴드 드랍 초기화

        const player = playerRef.current;
        player.powerLevel = 1;
        player.energy = GAME_CONFIG.PLAYER.MAX_ENERGY;
        player.shield = 0; // 보호막 초기화
        player.bombs = 1; // 폭탄 초기화 (시작 시 1개)
        player.invincible = true; // 진입 중 무적
        player.invincibleTimer = 60; // 1초 무적
        player.x = canvas.width / 2;
        player.y = canvas.height + 50; // 화면 아래에서 시작
        player.targetX = player.x;
        player.targetY = canvas.height * GAME_CONFIG.PLAYER.INITIAL_Y_RATIO;
        player.isEntering = true; // 진입 중 플래그

        onScoreUpdate(0);
        onEnergyUpdate(GAME_CONFIG.PLAYER.MAX_ENERGY);
        onPowerLevelUpdate(1);
        onBombUpdate?.(1);
    }, [onScoreUpdate, onEnergyUpdate, onPowerLevelUpdate, onBombUpdate]);

    // Trigger damage - 운석 충돌 시 보호막/파워/에너지 처리
    const triggerDamage = useCallback((amount) => {
        const player = playerRef.current;
        if (player.invincible) return;

        // 보호막이 있으면 1스택 소모하고 충돌 방어
        if (player.shield > 0) {
            player.shield -= 1;
            onShieldUpdate(player.shield);

            // 보호막 파괴 파티클 (파란색)
            for (let i = 0; i < 15; i++) {
                particlesRef.current.push(new Particle(player.x, player.y, '#3b82f6'));
            }

            // 타격음 재생 (보호막 방어 시에도)
            onDamage();

            // 짧은 무적 시간
            player.invincible = true;
            player.invincibleTimer = 30;
            return;
        }

        // 파워 레벨 감소 (1 감소, 최소 3)
        const newPowerLevel = Math.max(3, player.powerLevel - 1);
        if (player.powerLevel !== newPowerLevel) {
            player.powerLevel = newPowerLevel;
            onPowerLevelUpdate(player.powerLevel);
        }

        // 에너지 감소 (항상 적용)
        player.energy -= amount;
        onEnergyUpdate(player.energy);

        onDamage();

        // 에너지가 0 이하면 게임 오버
        if (player.energy <= 0) {
            gameActiveRef.current = false;
            for (let i = 0; i < 80; i++) {
                particlesRef.current.push(new Particle(player.x, player.y, '#fff'));
            }
            onGameOver();
        } else {
            player.invincible = true;
            player.invincibleTimer = GAME_CONFIG.TIMING.INVINCIBLE_FRAMES;
            for (let i = 0; i < 20; i++) {
                particlesRef.current.push(new Particle(player.x, player.y, '#ef4444'));
            }
        }
    }, [onEnergyUpdate, onPowerLevelUpdate, onDamage, onGameOver, onShieldUpdate]);

    // Use bomb - 화면 내 모든 적 제거
    const useBomb = useCallback(() => {
        const player = playerRef.current;
        const canvas = canvasRef.current;
        if (!canvas || player.bombs <= 0 || !gameActiveRef.current) return false;

        // 폭탄 소모
        player.bombs -= 1;
        onBombUpdate?.(player.bombs);

        // 화면 전체 플래시 효과 트리거
        onBombUsed?.();

        // 모든 적 제거 (보스 제외) 및 점수 획득
        let scoreGain = 0;
        for (const enemy of enemiesRef.current) {
            // 폭발 파티클 생성
            for (let i = 0; i < 15; i++) {
                particlesRef.current.push(new Particle(enemy.x, enemy.y, '#f97316'));
            }
            scoreGain += 50; // 적당 50점
        }

        // 보스에게 데미지 (단계별 차등: 1차=50%, 2차=40%, 3차=35%)
        if (bossRef.current) {
            const bossNum = bossSpawnedCountRef.current;
            const damagePercent = bossNum === 1 ? 0.5 : (bossNum === 2 ? 0.4 : 0.35);
            const bossDamage = Math.floor(bossRef.current.maxHp * damagePercent);
            bossRef.current.hp -= bossDamage;
            onBossDamage?.(bossRef.current.hp, bossRef.current.maxHp);

            // 보스도 폭발 이펙트
            for (let i = 0; i < 30; i++) {
                particlesRef.current.push(new Particle(bossRef.current.x, bossRef.current.y, '#f97316'));
            }
        }

        // 보스를 제외한 모든 적 제거
        enemiesRef.current = enemiesRef.current.filter(e => e.isBoss);

        // 점수 추가
        scoreRef.current += scoreGain;
        onScoreUpdate(scoreRef.current);

        return true;
    }, [onBombUpdate, onBombUsed, onScoreUpdate, onBossDamage]);

    // useBombRef에 함수 연결
    useEffect(() => {
        if (useBombRef) {
            useBombRef.current = useBomb;
        }
    }, [useBomb, useBombRef]);
    // Spawn boss
    const spawnBoss = useCallback((bossNumber) => {
        if (bossActiveRef.current) return;
        bossActiveRef.current = true;
        bossSpawnedCountRef.current = bossNumber;
        onBossSpawn(bossNumber);

        setTimeout(() => {
            const canvas = canvasRef.current;
            if (canvas && gameActiveRef.current) {
                // 보스 스폰 시간 기록 (타이머 보너스 계산용)
                bossSpawnTimeRef.current = Date.now();
                // 경과 시간(분) 계산
                const elapsedMinutes = Math.floor((Date.now() - gameStartTimeRef.current) / 60000);
                const boss = new Enemy(canvas.width, scoreRef.current, true, null, null, null, false, elapsedMinutes, bossNumber);
                enemiesRef.current.push(boss);
                bossRef.current = boss;
            }
        }, GAME_CONFIG.BOSS.WARNING_DURATION_MS);
    }, [onBossSpawn]);

    // Main game loop
    const gameLoop = useCallback(() => {
        if (!gameActiveRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Auto-shoot
        shoot();
        onShoot?.();

        const player = playerRef.current;

        // Update invincibility
        if (player.invincible) {
            player.invincibleTimer--;
            if (player.invincibleTimer <= 0) {
                player.invincible = false;
            }
        }

        // 무기 레벨 감소: 레벨 3 이상일 때 10초마다 1 감소
        if (player.powerLevel >= 3) {
            const now = Date.now();
            if (lastWeaponDecayTimeRef.current && now - lastWeaponDecayTimeRef.current >= 10000) {
                player.powerLevel = Math.max(3, player.powerLevel - 1);
                onPowerLevelUpdate(player.powerLevel);
                lastWeaponDecayTimeRef.current = now;
            }
        } else {
            // 레벨 3 미만이면 타이머 리셋 (다시 3이 되었을 때부터 카운트)
            lastWeaponDecayTimeRef.current = Date.now();
        }

        // 풀파워 유지 (시간 제한 없음)

        // Draw stars (playing = 1x speed)
        drawStars(ctx, starsRef.current, canvas.height, 1);

        // Update player position
        updatePlayerPosition(canvas);

        // Draw player
        drawPlayer(ctx, player, true);

        // Update and draw items
        for (let i = itemsRef.current.length - 1; i >= 0; i--) {
            const item = itemsRef.current[i];
            item.update();
            item.draw(ctx);

            if (item.checkCollision(player.x, player.y)) {
                if (item.type === 'POWER') {
                    player.powerLevel = Math.min(10, player.powerLevel + 1);
                    player.energy = Math.min(player.maxEnergy, player.energy + GAME_CONFIG.ITEM.POWER_ENERGY_RESTORE);
                    onPowerLevelUpdate(player.powerLevel);
                } else if (item.type === 'SHIELD') {
                    // 보호막: 최대 3중첩
                    player.shield = Math.min(GAME_CONFIG.ITEM.SHIELD_MAX_STACK, player.shield + 1);
                    onShieldUpdate(player.shield);
                } else if (item.type === 'BOMB') {
                    // 폭탄: 최대 2개
                    player.bombs = Math.min(GAME_CONFIG.ITEM.BOMB_MAX_STACK, player.bombs + 1);
                    onBombUpdate?.(player.bombs);
                } else {
                    // HEALTH
                    player.energy = Math.min(player.maxEnergy, player.energy + GAME_CONFIG.ITEM.HEALTH_ENERGY_RESTORE);
                }
                onEnergyUpdate(player.energy);
                onLevelUp();
                onPickup?.();
                itemsRef.current.splice(i, 1);
                continue;
            }

            if (item.isOffScreen(canvas.height)) {
                itemsRef.current.splice(i, 1);
            }
        }

        // Update bullets
        updateBullets(canvas.width);
        drawBullets(ctx, bulletsRef.current);

        // 보스 스폰 로직
        // 1번째 보스: 게임 시작 30초 후
        // 2번째 보스: 1번째 보스 처치 30초 후
        // 3번째 보스: 2번째 보스 처치 30초 후
        const bossIntervalMs = 30 * 1000; // 모든 보스: 30초

        if (!bossActiveRef.current && bossSpawnedCountRef.current < GAME_CONFIG.BOSS.TOTAL_BOSSES) {
            let shouldSpawnBoss = false;

            if (bossSpawnedCountRef.current === 0) {
                // 첫 보스: 게임 시작 30초 후
                const elapsedMs = Date.now() - gameStartTimeRef.current;
                if (elapsedMs >= bossIntervalMs) {
                    shouldSpawnBoss = true;
                }
            } else {
                // 이후 보스: 이전 보스 처치 30초 후
                if (lastBossDefeatTimeRef.current) {
                    const timeSinceDefeat = Date.now() - lastBossDefeatTimeRef.current;
                    if (timeSinceDefeat >= bossIntervalMs) {
                        shouldSpawnBoss = true;
                    }
                }
            }

            if (shouldSpawnBoss) {
                spawnBoss(bossSpawnedCountRef.current + 1);
            }
        }

        // Spawn enemies
        const score = scoreRef.current; // score 변수 정의
        const elapsedMinutes = Math.floor((Date.now() - gameStartTimeRef.current) / 60000);
        spawnTimerRef.current++;

        // 스폰 간격: 점수 + 시간에 따라 감소 (더 많은 운석)
        const timeReduction = elapsedMinutes * 2; // 1분당 2씩 감소
        const spawnThreshold = bossActiveRef.current
            ? GAME_CONFIG.ENEMY.BOSS_SPAWN_THRESHOLD
            : Math.max(GAME_CONFIG.ENEMY.MIN_SPAWN_THRESHOLD,
                GAME_CONFIG.ENEMY.BASE_SPAWN_THRESHOLD - (score / 1000) - timeReduction);

        if (spawnTimerRef.current > spawnThreshold) {
            // 경과 시간(분) 계산하여 적 HP에 반영
            const newEnemy = new Enemy(canvas.width, score, false, null, null, null, false, elapsedMinutes);
            enemiesRef.current.push(newEnemy);

            // 보스전 중 운석 폭포 효과 (보스 단계별 차등)
            if (bossActiveRef.current) {
                // 1차 보스: 5~10개, 2차 보스: 10~15개, 3차 보스: 10~18개
                const bossNum = bossSpawnedCountRef.current;
                const baseCount = bossNum === 1 ? 5 : (bossNum === 2 ? 10 : 10);
                const extraRange = bossNum === 1 ? 6 : (bossNum === 2 ? 6 : 9);
                const meteorCount = baseCount + Math.floor(Math.random() * extraRange);

                for (let k = 0; k < meteorCount; k++) {
                    setTimeout(() => {
                        if (gameActiveRef.current && canvasRef.current && bossActiveRef.current) {
                            const meteorEnemy = new Enemy(canvasRef.current.width, scoreRef.current, false, null, null, null, false, elapsedMinutes);
                            meteorEnemy.isBig = false;
                            meteorEnemy.width = 25 + Math.random() * 25;
                            meteorEnemy.height = meteorEnemy.width;
                            meteorEnemy.initialWidth = meteorEnemy.width;
                            meteorEnemy.color = '#334155';
                            meteorEnemy.generateShape();
                            meteorEnemy.generateCraters();
                            enemiesRef.current.push(meteorEnemy);
                        }
                    }, k * 80);
                }
            }

            spawnTimerRef.current = 0;
        }

        // 게임 시작 10초 내 파워 아이템 보장 드랍
        const elapsedSeconds = (Date.now() - gameStartTimeRef.current) / 1000;
        if (!initialPowerDroppedRef.current && elapsedSeconds >= 8 && elapsedSeconds <= 10) {
            // 8~10초 사이에 화면 상단에서 파워 아이템 스폰
            const spawnX = canvas.width * 0.3 + Math.random() * canvas.width * 0.4; // 중앙 40% 영역
            itemsRef.current.push(new Item(spawnX, -20, 'POWER'));
            initialPowerDroppedRef.current = true;
        }

        // 게임 시작 20초 내 쉴드 아이템 보장 드랍
        if (!initialShieldDroppedRef.current && elapsedSeconds >= 18 && elapsedSeconds <= 20) {
            // 18~20초 사이에 화면 상단에서 쉴드 아이템 스폰
            const spawnX = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
            itemsRef.current.push(new Item(spawnX, -20, 'SHIELD'));
            initialShieldDroppedRef.current = true;
        }

        // Update and draw enemies
        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
            const enemy = enemiesRef.current[i];
            enemy.update(canvas.width, canvas.height);
            enemy.draw(ctx);

            if (!player.invincible && enemy.checkPlayerCollision(player.x, player.y)) {
                // 충돌 시 80% 확률로 파워 또는 쉴드 아이템 드랍 (플레이어 위쪽에 생성)
                if (!enemy.isBoss && Math.random() < 0.8) {
                    const itemType = Math.random() < 0.7 ? 'POWER' : 'SHIELD'; // 70% 파워, 30% 쉴드
                    itemsRef.current.push(new Item(player.x, player.y - 50, itemType));
                }
                triggerDamage(enemy.getDamageValue());
                if (!enemy.isBoss) {
                    enemiesRef.current.splice(i, 1);
                }
                continue;
            }

            // Bullet collision (화면에 완전히 들어온 운석만 피격 가능)
            const isOnScreen = enemy.y > 0;
            if (isOnScreen) {
                for (let j = bulletsRef.current.length - 1; j >= 0; j--) {
                    const bullet = bulletsRef.current[j];
                    if (enemy.checkBulletCollision(bullet.x, bullet.y)) {
                        // 무기 레벨에 따른 데미지: 레벨 1~4는 1~4, 레벨 5~9는 5~9, 레벨 10은 15
                        const powerLevel = player.powerLevel;
                        const baseDamage = powerLevel === 10 ? 15 : powerLevel;

                        // 시간에 따른 데미지 감소 (1분=100%, 2분=60%, 3분+=35%)
                        const damageReduction = Math.max(0.35, 1 - (elapsedMinutes * 0.4));
                        const damage = Math.max(1, Math.floor(baseDamage * damageReduction));

                        const isDestroyed = enemy.takeDamage(damage);
                        bulletsRef.current.splice(j, 1);
                        onBulletHit?.(); // 발사체 명중 효과음
                        // 운석 피격 시 폭발음 (거대 운석은 3회 반복)
                        const explosionCount = enemy.isBig ? 3 : 1;
                        for (let e = 0; e < explosionCount; e++) {
                            setTimeout(() => onExplosion?.(enemy.isBoss), e * 50);
                        }

                        if (enemy.isBoss) {
                            onBossDamage(enemy.hp, enemy.maxHp);
                        }

                        // 운석: HP 비율에 따라 크기 축소 (HP 1 초과인 경우만)
                        if (!isDestroyed && enemy.maxHp > 1) {
                            const hpRatio = enemy.hp / enemy.maxHp;
                            const minWidth = enemy.isBoss ? 50 : 20;
                            // HP 비율에 정비례하여 크기 계산 (최소 크기 보장)
                            const targetWidth = Math.max(minWidth, enemy.initialWidth * hpRatio);

                            // 현재 크기가 목표보다 크면 축소
                            if (enemy.width > targetWidth) {
                                enemy.width = targetWidth;
                                enemy.height = enemy.width;
                                // 데미지 재계산
                                enemy.damage = Math.max(5, Math.floor(enemy.width / 4));
                            }

                            // 파편 생성: HP 75%, 50%, 25% 도달 시 각 1회씩 (총 3회)
                            if (!enemy.fragmentSpawned) enemy.fragmentSpawned = { 75: false, 50: false, 25: false };
                            const hpPercent = Math.floor(hpRatio * 100);

                            if (hpPercent <= 75 && !enemy.fragmentSpawned[75] && enemy.width > 40) {
                                enemy.fragmentSpawned[75] = true;
                                const fragmentSize = Math.max(15, enemy.initialWidth / 4);
                                enemiesRef.current.push(
                                    new Enemy(canvas.width, score, false, enemy.x, enemy.y, fragmentSize, true)
                                );
                            }
                            if (hpPercent <= 50 && !enemy.fragmentSpawned[50] && enemy.width > 35) {
                                enemy.fragmentSpawned[50] = true;
                                const fragmentSize = Math.max(15, enemy.initialWidth / 4);
                                enemiesRef.current.push(
                                    new Enemy(canvas.width, score, false, enemy.x, enemy.y, fragmentSize, true)
                                );
                            }
                            if (hpPercent <= 25 && !enemy.fragmentSpawned[25] && enemy.width > 30) {
                                enemy.fragmentSpawned[25] = true;
                                const fragmentSize = Math.max(15, enemy.initialWidth / 5);
                                enemiesRef.current.push(
                                    new Enemy(canvas.width, score, false, enemy.x, enemy.y, fragmentSize, true)
                                );
                            }

                            // 최소 크기에 도달하면 강제 파괴
                            if (enemy.width <= minWidth) {
                                enemy.hp = 0;
                            }
                        }

                        // HP가 0이면 파괴 (최소 크기 도달 포함)
                        const shouldDestroy = isDestroyed || enemy.hp <= 0;
                        if (shouldDestroy) {
                            // Explosion particles
                            for (let k = 0; k < 20; k++) {
                                particlesRef.current.push(new Particle(enemy.x, enemy.y, enemy.color));
                            }

                            // Update score (보스전 중에는 일반 적 점수 50% 감소)
                            const baseScore = enemy.getScoreValue();
                            const scoreMultiplier = (!enemy.isBoss && bossActiveRef.current) ? 0.5 : 1.0;
                            scoreRef.current += Math.floor(baseScore * scoreMultiplier);
                            onScoreUpdate(scoreRef.current);

                            // Boss defeat - drops energy and power
                            if (enemy.isBoss) {
                                bossActiveRef.current = false;
                                bossRef.current = null;
                                lastBossDefeatTimeRef.current = Date.now(); // 보스 처치 시간 기록

                                // 보스 타이머 보너스 계산 (빠른 처치 = 높은 보너스)
                                const bossKillTime = bossSpawnTimeRef.current
                                    ? (Date.now() - bossSpawnTimeRef.current) / 1000
                                    : 60;
                                let timerBonus = 500; // 기본 보너스
                                if (bossKillTime <= 20) timerBonus = 5000;      // 20초 이내
                                else if (bossKillTime <= 30) timerBonus = 3000; // 30초 이내
                                else if (bossKillTime <= 45) timerBonus = 1500; // 45초 이내
                                scoreRef.current += timerBonus;
                                onScoreUpdate(scoreRef.current);
                                bossSpawnTimeRef.current = null;

                                onBossDefeat();
                                // 보스 처치 보상: 에너지, 파워, 폭탄 드랍
                                itemsRef.current.push(new Item(enemy.x, enemy.y, 'HEALTH'));
                                itemsRef.current.push(new Item(enemy.x, enemy.y + 40, 'BOMB')); // 폭탄 100% 드랍
                                for (let m = 0; m < 2; m++) {
                                    itemsRef.current.push(new Item(enemy.x + (m - 1) * 40, enemy.y, 'POWER'));
                                }
                            } else {
                                // 일반 적 아이템 드랍 (풀파워 시 드랍률 1%)
                                const isFullPower = player.powerLevel === 10;
                                const powerDropChance = isFullPower ? 0.01 : GAME_CONFIG.ITEM.POWER_DROP_CHANCE;
                                const shieldDropChance = isFullPower ? 0 : GAME_CONFIG.ITEM.SHIELD_DROP_CHANCE;
                                const bombDropChance = GAME_CONFIG.ITEM.BOMB_DROP_CHANCE;

                                if (Math.random() < powerDropChance) {
                                    itemsRef.current.push(new Item(enemy.x, enemy.y, 'POWER'));
                                    initialPowerDroppedRef.current = true; // 파워 드랍됨
                                }
                                // 쉴드는 파편에서만 드랍
                                if (enemy.isFragment && Math.random() < shieldDropChance) {
                                    itemsRef.current.push(new Item(enemy.x, enemy.y, 'SHIELD'));
                                }
                            }

                            enemiesRef.current.splice(i, 1);
                        }
                        break;
                    }
                }
            } // isOnScreen 블록 닫기

            // Remove off-screen enemies
            if (enemy.isOffScreen(canvas.width, canvas.height)) {
                if (enemy.isBoss) {
                    bossActiveRef.current = false;
                    bossRef.current = null;
                }
                enemiesRef.current.splice(i, 1);
            }
        }

        // Update and draw particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const particle = particlesRef.current[i];
            particle.update();
            particle.draw(ctx);
            if (!particle.isAlive()) {
                particlesRef.current.splice(i, 1);
            }
        }

        animationIdRef.current = requestAnimationFrame(() => gameLoopRef.current?.());
    }, [shoot, updatePlayerPosition, updateBullets, spawnBoss, triggerDamage,
        onScoreUpdate, onEnergyUpdate, onPowerLevelUpdate, onBossDamage,
        onBossDefeat, onLevelUp]);

    // gameLoop과 resetGame을 ref에 저장하여 최신 함수 참조
    gameLoopRef.current = gameLoop;
    resetGameRef.current = resetGame;

    // Start game
    useEffect(() => {
        if (gameState === 'playing') {
            gameActiveRef.current = true;
            resetGameRef.current();
            const runLoop = () => {
                gameLoopRef.current();
            };
            animationIdRef.current = requestAnimationFrame(runLoop);
        } else {
            gameActiveRef.current = false;
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        }

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, [gameState]);

    // Draw idle state (when not playing)
    useEffect(() => {
        if (gameState !== 'playing') {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;

            const drawIdle = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawStars(ctx, starsRef.current, canvas.height, 0.3); // 느린 속도
                // 메뉴에서는 비행기를 그리지 않음 (준비 화면에 격납고만 표시)
                requestAnimationFrame(drawIdle);
            };

            const idleId = requestAnimationFrame(drawIdle);
            return () => cancelAnimationFrame(idleId);
        }
    }, [gameState]);

    return (
        <canvas
            ref={canvasRef}
            className={styles.canvas}
        />
    );
}
