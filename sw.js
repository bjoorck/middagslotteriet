const CACHE_NAME = 'middagslotteriet-v13';
const urlsToCache = ['./', './index.html', './app.html', './manual.html'];

self.addEventListener('install', function (event) {
  self.skipWaiting(); // ta över direkt i stället för att vänta tills alla flikar/den installerade appen stängts
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache).catch(function () { /* best effort */ });
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim(); // börja servera redan öppna/installerade sidor med en gång
    })
  );
});

self.addEventListener('fetch', function (event) {
  // Nätverk först: hämta alltid den senaste versionen när det finns nät, och
  // spara en färsk kopia i cachen under tiden. Cachen används bara som reserv
  // om nätet är nere (offline) — annars syns uppdateringar direkt nästa gång
  // sidan öppnas, istället för att vänta på att den gamla cachen upptäcks som
  // föråldrad.
  event.respondWith(
    fetch(event.request).then(function (response) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
      return response;
    }).catch(function () {
      return caches.match(event.request);
    })
  );
});
