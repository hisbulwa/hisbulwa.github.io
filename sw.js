importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

if (workbox)
  console.log(`Workbox berhasil dimuat`);
else
  console.log(`Workbox gagal dimuat`);

workbox.precaching.precacheAndRoute([
    { url: '/index.html', revision: '1' },
    { url: '/nav.html', revision: '1' },
    { url: '/team.html', revision: '1' },
    { url: '/push.js', revision: '1' },
    { url: '/icon.png', revision: '1' },
    { url: '/css/materialize.min.css', revision: '1' },
    { url: '/js/materialize.min.js', revision: '1' },
    { url: '/js/script.js', revision: '1' },
    { url: '/js/jquery-3.1.1.min.js', revision: '1' },
    { url: '/js/notifikasi.js', revision: '1' },
    { url: '/js/idb.js', revision: '1' },
    { url: '/js/script.js', revision: '1' },
]);

workbox.routing.registerRoute(
  new RegExp('/pages/'),
    workbox.strategies.staleWhileRevalidate({
        cacheName: 'pages'
    })
);

workbox.routing.registerRoute(
  new RegExp('^https://api\\.football-data\\.org/v2/'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'footballdataapi-cache',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200],
      })
    ]
  })
);

// const CACHE_NAME = "bundesliga-v4";
// var urlsToCache = [
//   "/",
//   "/nav.html",
//   "/index.html",
//   "/team.html",
//   "/pages/home.html",
//   "/pages/favorite.html",
//   "/pages/jadwal.html",
//   "/css/materialize.min.css",
//   "/js/materialize.min.js",
//   "/js/idb.js",
//   "/js/jquery-3.3.1.min.js",
//   "/js/nav.js",
//   "/js/api.js",
//   "/js/notifikasi.js",
//   "/push.js",
//   "/js/favorite.js",
//   "/icon.png"
// ];
//
// self.addEventListener("install", function(event) {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then(function(cache) {
//       return cache.addAll(urlsToCache);
//     })
//   );
// });
//
// self.addEventListener("fetch", function(event) {
//   var base_url = "https://api.football-data.org/v2/";
//
//   if (event.request.url.indexOf(base_url) > -1) {
//     event.respondWith(
//       caches.open(CACHE_NAME).then(function(cache) {
//         return fetch(event.request).then(function(response) {
//           // console.log('cihuy');
//           cache.put(event.request.url, response.clone());
//           return response;
//         })
//       })
//     );
//   } else {
//       event.respondWith(
//           caches.match(event.request, { ignoreSearch: true }).then(function(response) {
//               return response || fetch (event.request);
//           })
//       )
// }
// });
//
// self.addEventListener("activate", function(event) {
//   event.waitUntil(
//     caches.keys().then(function(cacheNames) {
//       return Promise.all(
//         cacheNames.map(function(cacheName) {
//           if (cacheName != CACHE_NAME) {
//             console.log("ServiceWorker: cache " + cacheName + " dihapus");
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
// });


self.addEventListener('notificationclick', function (event) {
  if (!event.action) {
    // Penguna menyentuh area notifikasi diluar action
    console.log('Notification Click.');
    return;
  }
  switch (event.action) {
    case 'yes-action':
      console.log('Pengguna memilih action yes.');
      // buka tab baru
      clients.openWindow("./index.html");
      break;
    case 'no-action':
      console.log('Pengguna memilih action no');
      break;
    default:
      console.log(`Action yang dipilih tidak dikenal: '${event.action}'`);
      break;
  }
});


// untuk push notifikasi
self.addEventListener('push', function(event) {
  var body;
  if (event.data) {
    body = event.data.text();
  } else {
    body = 'Push message no payload';
  }
  var options = {
    body: body,
    icon: 'img/notification.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  event.waitUntil(
    self.registration.showNotification('Push Notification', options)
  );
});
