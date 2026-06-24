// LegalOX.ai Service Worker v1
const CACHE = 'legalox-v1';
const ASSETS = [
  '/legalox/',
  '/legalox/index.html',
  'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      // Sadece yerel dosyaları cache'le, CDN'ler ağdan gelsin
      return c.addAll(['/legalox/','/legalox/index.html']).catch(()=>{});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // CDN isteklerini doğrudan geç
  if (e.request.url.includes('cdn.jsdelivr') || 
      e.request.url.includes('fonts.googleapis') ||
      e.request.url.includes('supabase')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match('/legalox/index.html'));
    })
  );
});
