const CACHE_NAME = "oolong_cache_v1"

const urlsToCache = [
    "./",
    "./index.html",
    "./site.webmanifest",
    "./assets/main.css"
]

self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            // Read resources
            importScripts("./assets/js/swResources.js");
            return cache.addAll(urlsToCache.concat(OolongResources));
        }).catch(function (err) {
            console.error(err);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        fetch(event.request).catch(function () {
            return caches.match(event.request);
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName != CACHE_NAME
                }).map(function (cacheName) {
                    console.log("Cleaned cache: " + cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
});