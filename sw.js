// LegalOX.ai Service Worker v2 — NETWORK FIRST
// index.html her zaman önce ağdan çekilir; sadece internet yoksa önbellek kullanılır.
const CACHE = 'legalox-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k))) // TÜM eski önbellekleri sil (v1 dahil)
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // CDN ve Supabase isteklerini doğrudan geçir
  if (e.request.url.includes('cdn.jsdelivr') ||
      e.request.url.includes('fonts.googleapis') ||
      e.request.url.includes('fonts.gstatic') ||
      e.request.url.includes('supabase')) {
    return;
  }
  // NETWORK FIRST: önce ağdan çek, başarılıysa önbelleği güncelle;
  // ağ yoksa (offline) önbellekten sun.
  e.respondWith(
    fetch(e.request).then(resp => {
      if (resp && resp.status === 200 && resp.type === 'basic') {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    }).catch(() =>
      caches.match(e.request).then(cached =>
        cached || caches.match('/legalox/index.html')
      )
    )
  );
});
