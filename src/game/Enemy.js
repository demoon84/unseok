import { GAME_CONFIG } from '../constants/gameConfig';

// Enemy class for asteroids and boss
export class Enemy {
    constructor(canvasWidth, score, isBoss = false, startX = null, startY = null, startWidth = null, isFragment = false, elapsedMinutes = 0, bossNumber = 1) {
        this.isBoss = isBoss;
        this.isFragment = isFragment;
        this.elapsedMinutes = elapsedMinutes; // 경과 시간 (분)
        const scoreDifficulty = score / 5000;

        if (isBoss) {
            this.initBoss(canvasWidth, score, elapsedMinutes, bossNumber);
        } else if (isFragment) {
            this.initFragment(startX, startY, startWidth);
        } else {
            this.initNormal(canvasWidth, score, scoreDifficulty, elapsedMinutes);
        }

        // 초기 크기 저장 (스케일 계산용)
        this.initialWidth = this.width;
        this.generateShape();
        this.generateCraters();
    }

    initBoss(canvasWidth, score, elapsedMinutes, bossNumber) {
        // 단계별 크기 배율: 1단계=2배, 2단계=4배, 3단계=5배
        const sizeMultiplier = bossNumber === 1 ? 2 : (bossNumber === 2 ? 4 : 5);
        const baseWidth = GAME_CONFIG.ENEMY.BOSS_WIDTH;
        const calculatedWidth = baseWidth * sizeMultiplier;
        // 화면 너비의 60%를 최대 크기로 제한
        const maxWidth = canvasWidth * 0.6;
        this.width = Math.min(calculatedWidth, maxWidth);
        this.height = this.width;
        this.x = canvasWidth / 2;
        this.y = -this.height;
        this.speed = 2.5 + (bossNumber * 0.3); // 속도 증가
        // 튕기는 방향 초기화 (대각선으로 시작)
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5; // 약 45도 각도
        this.vx = this.speed * (Math.random() > 0.5 ? 1 : -1);
        this.vy = this.speed;
        // 보스 HP: 단계별로 대폭 증가 (2단계=3배, 3단계=5배)
        const hpMultiplier = bossNumber === 1 ? 1 : (bossNumber === 2 ? 3 : 5);
        const scoreDifficulty = score / 5000;
        const baseHp = Math.floor(this.width * 5); // 기본 HP 증가
        const timeBonus = elapsedMinutes * 30;
        this.maxHp = (baseHp + Math.floor(scoreDifficulty * 5) + timeBonus) * hpMultiplier;
        this.hp = this.maxHp;
        this.damage = 10 * bossNumber; // 보스 충돌 데미지 (1차:10, 2차:20, 3차:30)
        this.color = '#1e293b';
        this.moveDir = 1;
        this.rotation = 0;
    }

    initFragment(startX, startY, startWidth) {
        this.width = startWidth;
        this.height = startWidth;
        this.x = startX;
        this.y = startY;
        // 속도: 크기에 반비례
        const baseSpeed = 4;
        const sizeSpeedFactor = 50 / this.width;
        this.speed = baseSpeed * sizeSpeedFactor + Math.random() * 0.5;
        this.vx = (Math.random() - 0.5) * 8;
        // HP: 크기에 비례 (크기/10, 최소 1)
        this.maxHp = Math.max(1, Math.ceil(this.width / 10));
        this.hp = this.maxHp;
        this.damage = Math.floor(this.width / 4); // 데미지: 크기에 정비례
        this.color = '#475569';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.12;
    }

    initNormal(canvasWidth, score, scoreDifficulty, elapsedMinutes) {
        const bigChance = Math.min(0.6, 0.15 + (score / 20000));
        const isBig = Math.random() < bigChance;
        this.isBig = isBig; // 거대 운석 여부 저장

        this.width = isBig ? (80 + Math.random() * 40) : (30 + Math.random() * 20);
        this.height = this.width;
        this.x = Math.random() * (canvasWidth - this.width) + this.width / 2;
        this.y = -this.height;

        // 속도: 크기에 반비례 (작은 운석 = 빠름, 큰 운석 = 느림)
        const baseSpeed = 4;
        const sizeSpeedFactor = 50 / this.width; // 크기가 50일 때 1배, 100이면 0.5배
        this.speed = baseSpeed * sizeSpeedFactor + Math.random() * 0.5;
        this.vx = 0;

        // 데미지: 크기에 정비례 (작은 운석 = 10, 큰 운석 = 30)
        this.damage = Math.floor(this.width / 4);

        // HP calculation with time-based bonus (3분 기준 설계)
        // 모든 운석: 동일한 HP 공식 (크기/10 + 시간 보너스)
        const baseHp = Math.ceil(this.width / 10);
        // 시간 보너스: 3분 기준 급증 (1분=15, 2분=40, 3분=75)
        const timeBonus = Math.floor(elapsedMinutes * 10 + Math.pow(elapsedMinutes, 2) * 5);
        this.maxHp = baseHp + Math.floor(scoreDifficulty * 3) + timeBonus;
        this.hp = this.maxHp;
        this.color = isBig ? '#1e293b' : '#334155';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.12;
    }

    generateShape() {
        this.points = [];
        const steps = this.isBoss ? 20 : (this.width < 30 ? 5 : 8);

        for (let i = 0; i < steps; i++) {
            const angle = (i / steps) * Math.PI * 2;
            const range = this.isBoss ? 0.3 : 0.45;
            const dist = (this.width / 2) * (1 - Math.random() * range);
            this.points.push({
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist
            });
        }
    }

    generateCraters() {
        this.craters = [];
        const craterCount = this.isBoss ? 15 : (this.width < 40 ? 1 : 3);

        for (let i = 0; i < craterCount; i++) {
            this.craters.push({
                x: (Math.random() - 0.5) * this.width * 0.6,
                y: (Math.random() - 0.5) * this.width * 0.6,
                r: Math.random() * (this.width * 0.15) + (this.width * 0.05)
            });
        }
    }

    update(canvasWidth, canvasHeight = 800) {
        if (this.isBoss) {
            // 화면 전체를 튕기며 움직임
            this.x += this.vx;
            this.y += this.vy;

            // 좌우 벽 충돌 - 크기의 30%까지 화면 밖으로 나갈 수 있음
            const overflowMargin = this.width * 0.3;
            if (this.x > canvasWidth + overflowMargin) {
                this.x = canvasWidth + overflowMargin;
                this.vx *= -1;
            } else if (this.x < -overflowMargin) {
                this.x = -overflowMargin;
                this.vx *= -1;
            }

            // 상하 벽 충돌 - 가장자리 기준 (하단 10%는 비행기 영역 확보)
            const margin = this.width / 2 + 20;
            const bottomSafeZone = canvasHeight * 0.10; // 하단 10% 안전 영역
            if (this.y > canvasHeight - bottomSafeZone - margin) {
                this.y = canvasHeight - bottomSafeZone - margin;
                this.vy *= -1;
            } else if (this.y < margin + 50) { // 상단 여백 50
                this.y = margin + 50;
                this.vy *= -1;
            }

            this.rotation += 0.008;
        } else {
            this.y += this.speed;
            this.x += this.vx;
            this.rotation += this.rotSpeed;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // 크기 스케일 적용 (초기 크기 대비 현재 크기)
        const scale = this.width / this.initialWidth;
        ctx.scale(scale, scale);

        // Draw main body
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.isBoss ? 40 : (this.isFragment ? 4 : 8);
        ctx.shadowColor = 'rgba(0,0,0,0.7)';

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw craters
        this.craters.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fill();
        });

        ctx.restore();

        // Draw HP bar for all enemies with HP > 1 (including boss)
        if (this.maxHp > 1) {
            const hpPercent = Math.max(0, this.hp / this.maxHp);
            // HP 바 크기도 현재 크기에 비례
            const barWidth = this.width;
            const barHeight = this.isBoss ? 8 : 4;
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 15, barWidth, barHeight);
            const barColor = this.isBoss ? '#ef4444' : (hpPercent > 0.4 ? (this.isFragment ? '#cbd5e1' : '#fbbf24') : '#ef4444');
            ctx.fillStyle = barColor;
            ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 15, barWidth * hpPercent, barHeight);
        }
    }

    isOffScreen(canvasWidth, canvasHeight) {
        return this.y > canvasHeight + 300 || this.x < -200 || this.x > canvasWidth + 200;
    }

    checkPlayerCollision(playerX, playerY) {
        // 현재 크기 기준으로 충돌 거리 계산
        const collisionDist = this.width / 2 + 15;
        return Math.hypot(playerX - this.x, playerY - this.y) < collisionDist;
    }

    checkBulletCollision(bulletX, bulletY) {
        // 현재 크기 기준으로 충돌 거리 계산
        const hitDist = this.width / 2 + 10;
        return Math.hypot(bulletX - this.x, bulletY - this.y) < hitDist;
    }

    takeDamage(damage) {
        this.hp -= damage;
        return this.hp <= 0;
    }

    getScoreValue() {
        return this.isBoss ? GAME_CONFIG.SCORE.BOSS_BONUS : Math.floor(this.width * 3);
    }

    getDamageValue() {
        return this.damage || 10; // 크기에 비례한 데미지 반환
    }

    shouldSplit() {
        return this.width > 35 && !this.isBoss && !this.isFragment;
    }
}
