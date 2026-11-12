const CACHE_NAME = 'crm-app-cache-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg'
];

self.addEventListener('install', (event) => {
  // Активируем новый Service Worker немедленно, не дожидаясь закрытия старых вкладок
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Удаляем все старые кеши (включая v1, v2, v3)
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] Удаление устаревшего кеша:', key);
              return caches.delete(key);
            }
          })
        );
      }),
      // Немедленно берем под контроль всех клиентов
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Запросы к API никогда не кешируем
  if (request.url.includes('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Для навигации по страницам (HTML) используем стратегию NETWORK-FIRST:
  // Сначала запрашиваем с сервера свежую версию, если офлайн — отдаем из кеша.
  if (request.mode === 'navigate' || request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Для остальных статических ассетов (css, js, svg): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
