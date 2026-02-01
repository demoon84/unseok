import { GAME_CONFIG } from '../constants/gameConfig';

// Item class for power-ups and health
export class Item {
    constructor(x, y, type = 'POWER') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = GAME_CONFIG.ITEM.SIZE;
        this.speedY = GAME_CONFIG.ITEM.SPEED;
        this.pulse = 0;
    }

    update() {
        this.y += this.speedY;
        this.pulse += 0.2;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        const s = 1 + Math.sin(this.pulse) * 0.4;
        ctx.scale(s, s);

        if (this.type === 'POWER') {
            this.drawPowerItem(ctx);
        } else if (this.type === 'SHIELD') {
            this.drawShieldItem(ctx);
        } else if (this.type === 'BOMB') {
            this.drawBombItem(ctx);
        } else {
            this.drawHealthItem(ctx);
        }

        ctx.restore();
    }

    drawPowerItem(ctx) {
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();

        // Draw star shape
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(
                Math.cos((18 + i * 72) / 180 * Math.PI) * this.size / 2,
                -Math.sin((18 + i * 72) / 180 * Math.PI) * this.size / 2
            );
            ctx.lineTo(
                Math.cos((54 + i * 72) / 180 * Math.PI) * (this.size / 4),
                -Math.sin((54 + i * 72) / 180 * Math.PI) * (this.size / 4)
            );
        }
        ctx.fill();

        // Draw "P" label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P', 0, 0);
    }

    drawHealthItem(ctx) {
        ctx.fillStyle = '#10b981';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#10b981';
        ctx.beginPath();
        ctx.roundRect(-this.size / 2, -this.size / 2, this.size, this.size, 4);
        ctx.fill();

        // Draw "H" label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', 0, 0);
    }

    drawShieldItem(ctx) {
        ctx.fillStyle = '#3b82f6';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#3b82f6';

        // Draw shield shape (hexagon)
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60 - 90) * Math.PI / 180;
            const x = Math.cos(angle) * this.size / 2;
            const y = Math.sin(angle) * this.size / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Draw "S" label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', 0, 0);
    }

    drawBombItem(ctx) {
        ctx.fillStyle = '#f97316'; // 주황색
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#f97316';

        // Draw bomb shape (circle)
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw fuse
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(0, -this.size / 2 - 6);
        ctx.lineTo(4, -this.size / 2 - 10);
        ctx.stroke();

        // Add spark effect
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(4, -this.size / 2 - 10, 3 + Math.sin(this.pulse * 2) * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw "B" label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('B', 0, 0);
    }

    isOffScreen(canvasHeight) {
        return this.y > canvasHeight + 100;
    }

    checkCollision(playerX, playerY) {
        return Math.hypot(playerX - this.x, playerY - this.y) < 35;
    }
}
