// static/js/serviceworker.js
// Base Service Worker implementation.  To use your own Service Worker, set the PWA_SERVICE_WORKER_PATH variable in settings.py

// maybe useful later
// var staticCacheName = "static-cache-v" + new Date().getTime();
// var dynamicCacheName = "dynamic-cache-v" + new Date().getTime();

var versionCacheName = '1';

var staticCacheName = "static-cache-v" + versionCacheName;
var dynamicCacheName = "dynamic-cache-v" + versionCacheName;

var staticFilesToCache = [
  '/',
  '/fallback/',
  '/static/css/home.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
  '/manifest.json',
  '/static/css/install_prompt.css',
  '/static/images/icons/icon-192x192.png',
  '/static/images/icons/icon-512x512.png',
  '/static/js/install_prompt.js'
];

var filesNotToCache = [
  '/test/',
  '/test',
  '/fallback'
]

// Cache on install
self.addEventListener("install", event => {
  this.skipWaiting();
  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(staticFilesToCache);
      })
  )
});

// Clear cache on activate
self.addEventListener('activate', event => {
  // console.log('inside activate');
  event.waitUntil(
    self.clients.claim(),
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => (cacheName.startsWith("static-cache") || cacheName.startsWith("dynamic-cache")))
          .filter(cacheName => (cacheName !== staticCacheName && cacheName !== dynamicCacheName))
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (event) {

  // request is 'not to cache' or is not 'get', dont do anything
  const shouldCache = !filesNotToCache.some((file) => event.request.url.includes(file));
  if (event.request.method !== "GET" || !shouldCache) return;

  // it is get request and should be cached
  event.respondWith(
    fromCache(event.request).then(
      function (response) {
        // The response was found in the cache
        event.waitUntil(
          fetch(event.request).then(
            function (response) {
              // console.log('previous cache files updated to latest');
              return updateCache(event.request, response);
            },
            function () {
              // console.log('previous cache files could not be updated');
              return;
            }
          )
        );
        // console.log('collected from previous cache files');
        return response;
      },
      function () {
        // The response was not found in the cache so we look for it on the server
        return fetch(event.request)
          .then(function (response) {
            // If request was success, add or update it in the cache
            // console.log('Fetched data from server that was not available on any cache', response.url);
            event.waitUntil(
              updateCache(event.request, response.clone()).then(function () {
                // console.log("added new data to cache: ", response.url);
              })
            );
            return response;
          })
          .catch(function (error) {
            // console.log("[PWA Builder] Network request failed and no cache." + error);
            // If the network and cache fails, return the fallback page from cache
            // return caches.match('/fallback/'); // Ensure fallback is available in cache
            // Check if fallback is cached before serving it
            caches.match('/fallback/').then(function (fallbackResponse) {
              if (fallbackResponse) {
                return fallbackResponse;
              } else {
                // handle error if fallback is also missing
                return new Response("Something went wrong.", { status: 500 });
              }
            });

          });
      }
    )
  );
});

function fromCache(request) {
  // Open all caches
  return caches.keys().then(function (cacheNames) {
    // Iterate over each cache
    return Promise.all(cacheNames.map(function (cacheName) {
      return caches.open(cacheName).then(function (cache) {
        return cache.match(request).then(function (matching) {
          if (matching) {
            // Return the first matching cache response
            return matching;
          }
        });
      });
    })).then(function (matches) {
      // Find the first non-null matching response
      const match = matches.find(response => response);
      if (match) {
        return match;
      } else {
        // If no match found, reject with an error message
        return Promise.reject("no-match");
      }
    });
  });
}

function updateCache(request, response) {
  return caches.open(staticCacheName).then(function (cache) {
    return cache.match(request).then(function (cachedResponse) {
      if (cachedResponse) {
        // console.log("item exist in static cache, updating it: ", request.url);
        // Item exists in cache, update it
        return cache.put(request, response);
      } else {
        // Item is not in static cache, add or update in dynamic cache
        return caches.open(dynamicCacheName).then(function (cache) {
          // console.log("item does not exist in static cache, adding/updating to dynamic cache: ", request.url);
          return cache.put(request, response);
        });
      }
    });
  });
}

