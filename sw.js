const CACHE_NAME = "vne-kadra-v8";

const CORE_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./data.js",
  "./app.js",
  "./manifest.json"
];

const OPTIONAL_FILES = [
  "./icon-192.png",
  "./icon-512.png"
];

/*
 * Установка новой версии.
 *
 * Основные файлы нужны для работы приложения офлайн.
 * Иконки добавляются отдельно: если одной из них нет,
 * установка Service Worker всё равно не должна сломаться.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CORE_FILES);

      await Promise.allSettled(
        OPTIONAL_FILES.map((file) => cache.add(file))
      );
    })
  );

  self.skipWaiting();
});

/*
 * При активации удаляем кэши старых версий:
 *
 * vne-kadra-v7
 * vne-kadra-v6
 * и более ранние.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const outdatedCaches = cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name));

      return Promise.all(outdatedCaches);
    })
  );

  self.clients.claim();
});

/*
 * Для переходов между страницами:
 * сначала пытаемся получить свежую index.html из сети,
 * затем используем офлайн-копию.
 */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  /*
   * Не кэшируем сторонние ресурсы.
   */
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response && response.ok) {
            const cache = await caches.open(
              CACHE_NAME
            );

            await cache.put(
              "./index.html",
              response.clone()
            );
          }

          return response;
        })
        .catch(async () => {
          const exactMatch = await caches.match(
            request
          );

          if (exactMatch) {
            return exactMatch;
          }

          const cachedIndex = await caches.match(
            "./index.html"
          );

          if (cachedIndex) {
            return cachedIndex;
          }

          return new Response(
            "Приложение временно недоступно без подключения к интернету.",
            {
              status: 503,
              headers: {
                "Content-Type":
                  "text/plain; charset=utf-8"
              }
            }
          );
        })
    );

    return;
  }

  /*
   * Для JavaScript, CSS, базы данных и манифеста:
 *
   * 1. Сначала пробуем сеть.
   * 2. Если сеть доступна — сохраняем свежую версию.
   * 3. Если сети нет — открываем последнюю сохранённую копию.
   *
   * Это особенно важно для data.js и app.js,
   * потому что они часто обновляются во время разработки.
   */
  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (
          response &&
          response.ok &&
          response.type !== "opaque"
        ) {
          const cache = await caches.open(
            CACHE_NAME
          );

          await cache.put(
            request,
            response.clone()
          );
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);

        if (cached) {
          return cached;
        }

        return new Response("", {
          status: 504,
          statusText: "Offline"
        });
      })
  );
});
