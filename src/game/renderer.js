import { GAME_CONFIG } from '../constants/gameConfig';

// 비행기 이미지 로드
let shipImage = null;
let shipImageLoaded = false;

export function loadShipImage() {
    if (shipImage) return;
    shipImage = new Image();
    shipImage.onload = () => {
        shipImageLoaded = true;
    };
    shipImage.src = '/ship.png';
}

// 초기 로드
loadShipImage();

// Draw player spaceship
export function drawPlayer(ctx, player, gameActive) {
    if (player.invincible && Math.floor(Date.now() / 80) % 2 === 0) return;

    ctx.save();
    ctx.translate(player.x, player.y);

    // 좌우 이동에 따른 기울임 (왼쪽 이동 = 왼쪽 기울임, 오른쪽 이동 = 오른쪽 기울임)
    const tilt = Math.max(-0.4, Math.min(0.4, (player.vx || 0) * 0.08)); // 최대 약 23도
    ctx.rotate(tilt);

    // Shield effect (if shield > 0)
    if (player.shield > 0) {
        const shieldPulse = Math.sin(Date.now() / 150) * 5;
        const shieldRadius = 40 + shieldPulse;

        // 육각형 쉴드
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 + Math.sin(Date.now() / 100) * 0.3})`;
        ctx.lineWidth = 2 + player.shield;
        ctx.shadowBlur = 15 + player.shield * 5;
        ctx.shadowColor = '#3b82f6';

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60 - 90) * Math.PI / 180;
            const x = Math.cos(angle) * shieldRadius;
            const y = Math.sin(angle) * shieldRadius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // 내부 글로우
        ctx.fillStyle = `rgba(59, 130, 246, ${0.1 * player.shield})`;
        ctx.fill();
    }

    // Power level glow effect
    if (player.powerLevel > 1) {
        ctx.shadowBlur = player.powerLevel * 4;
        ctx.shadowColor = '#3b82f6';
    }

    // Draw ship image or fallback to vector
    const shipSize = 60;
    if (shipImageLoaded && shipImage) {
        ctx.shadowBlur = 0;
        ctx.drawImage(shipImage, -shipSize / 2, -shipSize / 2, shipSize, shipSize);
    } else {
        // Fallback: draw vector ship
        const s = 0.5;
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(0 * s, -35 * s);
        ctx.lineTo(18 * s, 12 * s);
        ctx.lineTo(45 * s, 18 * s);
        ctx.lineTo(18 * s, 24 * s);
        ctx.lineTo(16 * s, 45 * s);
        ctx.lineTo(-16 * s, 45 * s);
        ctx.lineTo(-18 * s, 24 * s);
        ctx.lineTo(-45 * s, 18 * s);
        ctx.lineTo(-18 * s, 12 * s);
        ctx.closePath();
        ctx.fill();

        // Draw cockpit
        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.ellipse(0, 0, 9 * s, 15 * s, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// 미사일 이미지 로드
let bulletImage = null;
let bulletImageLoaded = false;
let bulletRedImage = null;
let bulletRedImageLoaded = false;

export function loadBulletImage() {
    if (!bulletImage) {
        bulletImage = new Image();
        bulletImage.onload = () => { bulletImageLoaded = true; };
        bulletImage.src = '/bullet.png';
    }
    if (!bulletRedImage) {
        bulletRedImage = new Image();
        bulletRedImage.onload = () => { bulletRedImageLoaded = true; };
        bulletRedImage.src = '/bullet_red.png';
    }
}

// 초기 로드
loadBulletImage();

// Draw bullets
export function drawBullets(ctx, bullets) {
    bullets.forEach(b => {
        const img = b.red ? bulletRedImage : bulletImage;
        const loaded = b.red ? bulletRedImageLoaded : bulletImageLoaded;

        if (loaded) {
            // 크기 (30% 증가)
            const imgWidth = b.size * 1.3;
            const imgHeight = b.size * 2.6;

            // 이동 방향에 따른 회전 각도 계산
            const vx = b.vx || 0;
            const vy = b.vy || -10; // 기본값: 위로 이동
            const angle = Math.atan2(vy, vx) + Math.PI / 2; // 이미지가 위를 향하므로 90도 보정

            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(angle);
            ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
            ctx.restore();
        } else {
            // 폴백: 원형
            ctx.fillStyle = b.red ? '#ef4444' : '#38bdf8';
            ctx.shadowBlur = b.red ? 20 : 8;
            ctx.shadowColor = ctx.fillStyle;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.shadowBlur = 0;
}

// Draw background stars (speedMultiplier: 1=normal, 0.3=slow for menu/gameover)
export function drawStars(ctx, stars, canvasHeight, speedMultiplier = 1) {
    ctx.fillStyle = '#fff';
    stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        s.y += s.speed * speedMultiplier;
        if (s.y > canvasHeight) s.y = -20;
    });
}

// Initialize stars
export function initStars(canvasWidth, canvasHeight) {
    const stars = [];
    for (let i = 0; i < GAME_CONFIG.STARS.COUNT; i++) {
        stars.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            size: Math.random() * GAME_CONFIG.STARS.MAX_SIZE,
            speed: Math.random() * GAME_CONFIG.STARS.MAX_SPEED + GAME_CONFIG.STARS.MIN_SPEED
        });
    }
    return stars;
}
