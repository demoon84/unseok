import { useEffect, useRef, useCallback } from 'react';

// Custom hook for keyboard and mouse/touch input handling
export function useInput(canvasRef, playerRef, gameActiveRef) {
    const keysRef = useRef({
        up: false,
        down: false,
        left: false,
        right: false
    });

    // 터치 시작 위치 저장용
    const touchStartRef = useRef({ x: 0, y: 0 });
    const playerStartRef = useRef({ x: 0, y: 0 });

    // 키 코드 → 방향 매핑
    const keyMap = {
        'ArrowUp': 'up', 'KeyW': 'up',
        'ArrowDown': 'down', 'KeyS': 'down',
        'ArrowLeft': 'left', 'KeyA': 'left',
        'ArrowRight': 'right', 'KeyD': 'right'
    };

    // Keyboard handlers
    useEffect(() => {
        const handleKeyDown = (e) => {
            const direction = keyMap[e.code];
            if (direction) {
                keysRef.current[direction] = true;
                playerRef.current.isKeyboardMode = true;
                e.preventDefault();
            }
        };

        const handleKeyUp = (e) => {
            const direction = keyMap[e.code];
            if (direction) {
                keysRef.current[direction] = false;
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [playerRef]);

    // Mouse/Touch handlers
    useEffect(() => {
        // 마우스는 절대 위치 사용 (데스크톱)
        const handleMouseMove = (e) => {
            playerRef.current.isKeyboardMode = false;
            playerRef.current.targetX = e.clientX;
            playerRef.current.targetY = e.clientY;
        };

        // 터치 시작 - 현재 위치 저장 (점프하지 않음)
        const handleTouchStart = (e) => {
            if (e.touches && e.touches[0]) {
                touchStartRef.current = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
                // 터치 시작 시 현재 플레이어 위치 저장
                playerStartRef.current = {
                    x: playerRef.current.targetX,
                    y: playerRef.current.targetY
                };
                playerRef.current.isKeyboardMode = false;
            }
            e.preventDefault();
        };

        // 터치 이동 - 상대적 이동량만 적용
        const handleTouchMove = (e) => {
            if (e.touches && e.touches[0]) {
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;

                // 터치 시작점으로부터의 이동량 계산
                const deltaX = currentX - touchStartRef.current.x;
                const deltaY = currentY - touchStartRef.current.y;

                // 이동량을 플레이어 시작 위치에 더함
                playerRef.current.targetX = playerStartRef.current.x + deltaX;
                playerRef.current.targetY = playerStartRef.current.y + deltaY;
                playerRef.current.isKeyboardMode = false;
            }
            e.preventDefault();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [playerRef]);

    // Update player position based on input
    const updatePlayerPosition = useCallback((canvas) => {
        const player = playerRef.current;
        const keys = keysRef.current;

        // 진입 애니메이션 처리
        if (player.isEntering) {
            const targetY = canvas.height * 0.75; // 목표 위치
            player.y += (targetY - player.y) * 0.10; // 2배 빠른 진입

            // 목표 위치에 도달하면 진입 완료
            if (Math.abs(player.y - targetY) < 5) {
                player.y = targetY;
                player.targetY = targetY;
                player.isEntering = false;
            }
            return;
        }

        if (player.isKeyboardMode) {
            const prevX = player.x;
            if (keys.up) player.y -= player.speed;
            if (keys.down) player.y += player.speed;
            if (keys.left) player.x -= player.speed;
            if (keys.right) player.x += player.speed;

            player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
            player.y = Math.max(20, Math.min(canvas.height - 20, player.y));
            player.targetX = player.x;
            player.targetY = player.y;
            player.vx = player.x - prevX; // 기울임용 속도
        } else {
            // 부드러운 이동
            const prevX = player.x;
            player.x += (player.targetX - player.x) * 0.22;
            player.y += (player.targetY - player.y) * 0.22;

            // 화면 경계 제한
            player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
            player.y = Math.max(20, Math.min(canvas.height - 20, player.y));
            player.vx = player.x - prevX; // 기울임용 속도
        }
    }, [playerRef]);

    return { keysRef, updatePlayerPosition };
}
