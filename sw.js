const CACHE_NAME = "vne-kadra-v7";

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
 * Установка:
 * основные файлы обязательны;
 * отсутствие необязательной иконки
 * не должно ломать установку Service Worker.
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
 * Активация:
 * удаляем кэши предыдущих версий.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const oldCaches = cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name));

      return Promise.all(oldCaches);
    })
  );

  self.clients.claim();
});

/*
 * Запросы навигации:
 * сначала проверяем сеть, чтобы пользователь быстрее
 * получал новую версию index.html.
 *
 * При отсутствии сети открываем закэшированную версию.
 */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  /*
   * Не перехватываем запросы к чужим доменам.
   */
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response && response.ok) {
            const cache = await caches.open(CACHE_NAME);

            await cache.put(
              "./index.html",
              response.clone()
            );
          }

          return response;
        })
        .catch(async () => {
          const exactMatch = await caches.match(request);

          if (exactMatch) {
            return exactMatch;
          }

          const indexMatch = await caches.match(
            "./index.html"
          );

          if (indexMatch) {
            return indexMatch;
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
   * Для файлов приложения используем стратегию
   * «сначала сеть, затем кэш».
   *
   * Во время разработки это помогает быстрее получать
   * обновлённые app.js, data.js и styles.css.
   */
  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (
          response &&
          response.ok &&
          response.type !== "opaque"
        ) {
          const cache = await caches.open(CACHE_NAME);

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
