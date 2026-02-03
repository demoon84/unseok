// Service Worker for Meteor Commando PWA

const CACHE_NAME = 'meteor-commando-v1';

// 캐시할 에셋 목록
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/logo.png',
    '/ship.png',
    '/hangar.png',
    '/bullet.png',
    '/bullet_red.png',
    '/sounds/retro_laser_01.ogg',
    '/sounds/explosion_01.ogg',
    '/sounds/explosion_02.ogg',
    '/sounds/item_pickup.flac',
    '/sounds/retro_explosion.ogg',
    '/sounds/misc_05.ogg',
    '/sounds/teleport_01.ogg',
    '/sounds/retro_beep_05.ogg',
    '/sounds/through_space.ogg'
];

// 설치 시 에셋 캐싱
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 활성화 시 이전 캐시 삭제
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// 네트워크 요청 처리 (Cache First, Network Fallback)
self.addEventListener('fetch', (event) => {
    // API 요청은 항상 네트워크 우선
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // 오프라인 시 빈 응답
                    return new Response(JSON.stringify({
                        error: 'offline',
                        today: [],
                        weekly: []
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // 정적 에셋은 캐시 우선
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((response) => {
                        // 유효한 응답만 캐시
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
});
