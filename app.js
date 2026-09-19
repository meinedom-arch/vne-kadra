const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("#themeToggle");
const installButton = document.querySelector("#installButton");

const sheetBackdrop = document.querySelector("#sheetBackdrop");
const sheetTitle = document.querySelector("#sheetTitle");
const sheetContent = document.querySelector("#sheetContent");
const sheetClose = document.querySelector("#sheetClose");

const { articles, tasks, crisisRoutes, categories } = VK_DATA;

const STORAGE_KEY = "vne-kadra-state-v6";

const defaultState = {
  screen: "today",
  theme: "dark",
  fontSize: "normal",
  level: "Ищу новые идеи",
  season: "auto",
  dailyCount: 3,

  favorites: [],
  completedTasks: [],

  selectedTaskId: null,
  selectedArticleId: null,
  selectedCrisisId: null,

  learnQuery: "",
  learnCategory: "Все",
  learnMode: "catalog",

  filterPlace: "все",
  filterPeriod: "все",
  filterCondition: "все",

  dailyOverrides: {}
};

let state = loadState();
let deferredInstallPrompt = null;

const levels = [
  ["Начинаю", "Базовые упражнения с подробными инструкциями"],
  ["Снимаю уверенно", "Композиция, серии, свет и жанры"],
  ["Ищу новые идеи", "Эксперименты и необычные ограничения"],
  ["Возвращаю вдохновение", "Мягкая практика без требования результата"]
];

const fontSizes = [
  ["compact", "Компактный"],
  ["normal", "Обычный"],
  ["large", "Крупный"],
  ["extra-large", "Очень крупный"]
];

const seasonOptions = [
  ["auto", "Определять автоматически"],
  ["все", "Не учитывать сезон"],
  ["весна", "Весна"],
  ["лето", "Лето"],
  ["осень", "Осень"],
  ["зима", "Зима"]
];

const placeOptions = [
  ["все", "Любое место"],
  ["дом", "Дома"],
  ["улица", "На улице"],
  ["где угодно", "Где угодно"]
];

const periodOptions = [
  ["все", "Любое время"],
  ["день", "Днём"],
  ["вечер", "Вечером"],
  ["ночь", "Ночью"],
  ["утро", "Утром"]
];

const conditionOptions = [
  ["все", "Любые условия"],
  ["солнце", "Солнечно"],
  ["дождь", "Дождь"],
  ["снег", "Снег"],
  ["туман", "Туман"],
  ["любая", "Без привязки"]
];

function loadState() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem("vne-kadra-state-v5") ||
      localStorage.getItem("vne-kadra-state");

    return saved
      ? { ...defaultState, ...JSON.parse(saved) }
      : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function scrollTop(behavior = "smooth") {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior });
  });
}

function dateKey() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function dateSeed() {
  return [...dateKey()].reduce(
    (sum, character, index) =>
      sum + character.charCodeAt(0) * (index + 1),
    0
  );
}

function currentSeason() {
  if (state.season !== "auto") {
    return state.season;
  }

  const month = new Date().getMonth() + 1;

  if ([12, 1, 2].includes(month)) return "зима";
  if ([3, 4, 5].includes(month)) return "весна";
  if ([6, 7, 8].includes(month)) return "лето";

  return "осень";
}

function seasonLabel() {
  const season = currentSeason();

  if (season === "все") return "Любой сезон";

  return season.charAt(0).toUpperCase() + season.slice(1);
}

function formatDate() {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());
}

function labelOf(options, value) {
  return options.find((item) => item[0] === value)?.[1] || value;
}

function applyPreferences() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.font = state.fontSize;

  const color = document.querySelector('meta[name="theme-color"]');

  if (color) {
    color.content =
      state.theme === "dark" ? "#11100f" : "#f4f0eb";
  }
}

function isFavorite(id) {
  return state.favorites.includes(id);
}

function isCompleted(id) {
  return state.completedTasks.includes(id);
}

function levelMatches(task) {
  if (task.levels.includes("все")) return true;

  if (state.level === "Возвращаю вдохновение") {
    return (
      task.category === "Кризис" ||
      task.id === "five-frames" ||
      task.place === "дом"
    );
  }

  return task.levels.includes(state.level);
}

function seasonMatches(task) {
  const season = currentSeason();

  return (
    season === "все" ||
    task.seasons.includes("все") ||
    task.seasons.includes(season)
  );
}

function recommendedTasks() {
  const result = tasks.filter(
    (task) => levelMatches(task) && seasonMatches(task)
  );

  return result.length >= 3 ? result : tasks.filter(seasonMatches);
}

function stableSort(items, seed) {
  const score = (id) =>
    [...`${id}-${seed}`].reduce(
      (sum, char, index) =>
        sum + char.charCodeAt(0) * (index + 1),
      0
    );

  return [...items].sort(
    (first, second) => score(first.id) - score(second.id)
  );
}

function dailyIds() {
  const key = dateKey();

  if (Array.isArray(state.dailyOverrides[key])) {
    return state.dailyOverrides[key];
  }

  const source = stableSort(recommendedTasks(), dateSeed());
  const ids = [];

  for (const item of [...source, ...tasks]) {
    if (!ids.includes(item.id)) {
      ids.push(item.id);
    }

    if (ids.length === 3) break;
  }

  state.dailyOverrides[key] = ids;
  saveState();

  return ids;
}

function dailyTasks() {
  return dailyIds()
    .map((id) => tasks.find((task) => task.id === id))
    .filter(Boolean)
    .slice(0, state.dailyCount);
}

function mainDailyTask() {
  return (
    tasks.find((task) => task.id === dailyIds()[0]) ||
    tasks[0]
  );
}

function currentTask() {
  return (
    tasks.find((task) => task.id === state.selectedTaskId) ||
    mainDailyTask()
  );
}

function updateNavigation() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.screen === state.screen
    );
  });
}

function setScreen(screen) {
  state.screen = screen;

  if (screen !== "learn") {
    state.learnMode = "catalog";
  }

  saveState();
  render();
  scrollTop();
}

function openTask(id) {
  state.selectedTaskId = id;
  state.screen = "shoot";
  saveState();
  render();
  scrollTop("auto");
}

function render() {
  applyPreferences();
  updateNavigation();

  if (state.screen === "today") renderToday();
  if (state.screen === "learn") renderLearn();
  if (state.screen === "shoot") renderShoot();
  if (state.screen === "collection") renderCollection();
  if (state.screen === "profile") renderProfile();
}

function renderToday(animate = false) {
  const dayTasks = dailyTasks();
  const main = dayTasks[0] || mainDailyTask();

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <span class="date-label">${escapeHtml(formatDate())}</span>
        <h2>Смотри чуть дальше.</h2>
        <p>
          ${escapeHtml(seasonLabel())}. Рекомендации учитывают выбранный
          уровень и время года.
        </p>
      </div>

      <article class="hero-card ${animate ? "is-changing" : ""}">
        <div class="hero-content">
          <p class="hero-kicker">Главное задание</p>
          <h2>${escapeHtml(main.title)}</h2>
          <p class="hero-description">
            ${escapeHtml(main.description)}
          </p>
        </div>

        <div class="hero-footer">
          <span class="hero-meta">${escapeHtml(main.category)}</span>

          <div class="hero-actions">
            <button
              class="primary-button"
              type="button"
              data-action="open-main-task"
            >
              Начать
            </button>

            <button
              class="hero-change-button"
              type="button"
              data-action="change-daily"
              aria-label="Сменить задание"
            >
              ↻
            </button>
          </div>
        </div>
      </article>

      ${
        dayTasks.length > 1
          ? `
            <div class="section-header">
              <h3>Ещё на сегодня</h3>
              <span class="date-label">${dayTasks.length}</span>
            </div>

            <div class="daily-list">
              ${dayTasks
                .slice(1)
                .map(taskMiniCard)
                .join("")}
            </div>
          `
          : ""
      }

      <div class="section-header">
        <h3>Быстрый выбор</h3>
        <button type="button" data-action="open-all-tasks">
          Все задания
        </button>
      </div>

      <div class="quick-grid">
        <button class="quick-card" type="button" data-action="random">
          <span class="quick-icon">⤨</span>
          <strong>Случайная идея</strong>
          <small>С учётом уровня и сезона</small>
        </button>

        <button class="quick-card" type="button" data-action="home">
          <span class="quick-icon">⌂</span>
          <strong>Снять дома</strong>
          <small>Практика без выхода на улицу</small>
        </button>

        <button class="quick-card" type="button" data-action="inspiration">
          <span class="quick-icon">↻</span>
          <strong>Вернуть вдохновение</strong>
          <small>Спокойные маршруты без давления</small>
        </button>

        <button class="quick-card" type="button" data-action="learn">
          <span class="quick-icon">✦</span>
          <strong>Изучить приём</strong>
          <small>Открыть энциклопедию</small>
        </button>
      </div>

      <div class="section-header">
        <h3>Наблюдение</h3>
      </div>

      <div class="info-card">
        <div class="info-icon">◌</div>
        <div>
          <h3>Не обязательно ехать далеко</h3>
          <p>
            Смена высоты камеры, света или расстояния часто меняет
            знакомое место сильнее, чем новый маршрут.
          </p>
        </div>
      </div>
    </section>
  `;
}

function taskMiniCard(task) {
  return `
    <button
      class="card daily-mini-card"
      type="button"
      data-task="${escapeHtml(task.id)}"
    >
      <span>
        <strong>${escapeHtml(task.title)}</strong>
        <small>
          ${escapeHtml(task.category)} · ${escapeHtml(task.place)}
        </small>
      </span>
      <span class="arrow">→</span>
    </button>
  `;
}

function changeDailyTask() {
  const ids = dailyIds();
  const available = recommendedTasks().filter(
    (task) => !ids.includes(task.id)
  );

  const pool = available.length
    ? available
    : tasks.filter((task) => task.id !== ids[0]);

  const replacement =
    pool[Math.floor(Math.random() * pool.length)];

  ids[0] = replacement.id;
  state.dailyOverrides[dateKey()] = ids;
  saveState();

  renderToday(true);
  showToast("Главное задание изменено");
}

/* Энциклопедия */

function renderLearn() {
  if (state.learnMode === "inspiration") {
    renderInspiration();
    return;
  }

  const categoryNames = [
    "Все",
    ...categories.map((item) => item.name)
  ];

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Изучать</h2>
        <p>
          Энциклопедия приёмов, жанров и способов видеть привычное иначе.
        </p>
      </div>

      <div class="search-box">
        <span class="search-icon">⌕</span>
        <input
          id="articleSearch"
          type="search"
          autocomplete="off"
          placeholder="Найти технику или жанр"
          value="${escapeHtml(state.learnQuery)}"
        />
      </div>

      ${
        !state.learnQuery && state.learnCategory === "Все"
          ? `
            <div class="catalog-grid">
              ${categories
                .map(
                  (category) => `
                    <button
                      class="catalog-card"
                      type="button"
                      data-catalog="${escapeHtml(category.name)}"
                    >
                      <span class="catalog-icon">
                        ${escapeHtml(category.icon)}
                      </span>
                      <strong>${escapeHtml(category.name)}</strong>
                      <small>${escapeHtml(category.description)}</small>
                    </button>
                  `
                )
                .join("")}

              <button
                class="catalog-card"
                type="button"
                data-action="inspiration"
              >
                <span class="catalog-icon">↻</span>
                <strong>Вдохновение</strong>
                <small>Помощь при творческом кризисе</small>
              </button>
            </div>
          `
          : ""
      }

      <div class="section-header">
        <h3>Материалы</h3>
        <span class="date-label" id="articleCount"></span>
      </div>

      <div class="chips">
        ${categoryNames
          .map(
            (category) => `
              <button
                class="chip ${
                  state.learnCategory === category ? "active" : ""
                }"
                type="button"
                data-category="${escapeHtml(category)}"
              >
                ${escapeHtml(category)}
              </button>
            `
          )
          .join("")}
      </div>

      <div id="articleResults" class="card-list"></div>
    </section>
  `;

  updateArticleResults();

  document
    .querySelector("#articleSearch")
    ?.addEventListener("input", (event) => {
      state.learnQuery = event.target.value;
      saveState();
      updateArticleResults();
    });
}

function articleMatches(article) {
  const query = state.learnQuery.trim().toLowerCase();

  const categoryMatch =
    state.learnCategory === "Все" ||
    article.category === state.learnCategory;

  const text = [
    article.title,
    article.category,
    article.description,
    article.tags.join(" ")
  ]
    .join(" ")
    .toLowerCase();

  return categoryMatch && text.includes(query);
}

function updateArticleResults() {
  const filtered = articles.filter(articleMatches);
  const container = document.querySelector("#articleResults");
  const counter = document.querySelector("#articleCount");

  if (counter) counter.textContent = filtered.length;

  if (!container) return;

  container.innerHTML = filtered.length
    ? filtered.map(articleCard).join("")
    : `<div class="empty-state">Ничего не найдено.</div>`;
}

function articleCard(article) {
  return `
    <button
      class="card"
      type="button"
      data-article="${escapeHtml(article.id)}"
    >
      <div class="card-top">
        <span class="category-label">
          ${escapeHtml(article.category)}
        </span>
        <span class="favorite ${isFavorite(article.id) ? "active" : ""}">
          ${isFavorite(article.id) ? "♥" : "♡"}
        </span>
      </div>

      <h3>${escapeHtml(article.title)}</h3>
      <p>${escapeHtml(article.description)}</p>

      <div class="tags">
        ${article.tags
          .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
          .join("")}
      </div>
    </button>
  `;
}

function renderArticle(id) {
  const article = articles.find((item) => item.id === id);

  if (!article) return;

  state.selectedArticleId = id;
  saveState();

  app.innerHTML = `
    <article class="article-detail">
      <button class="back-button" type="button" data-action="back-learn">
        ← Назад к энциклопедии
      </button>

      <div class="card-top">
        <span class="category-label">
          ${escapeHtml(article.category)}
        </span>

        <button
          class="ghost-button"
          type="button"
          data-action="favorite"
          data-id="${escapeHtml(article.id)}"
        >
          ${isFavorite(id) ? "♥ В коллекции" : "♡ Сохранить"}
        </button>
      </div>

      <h2>${escapeHtml(article.title)}</h2>
      <p class="article-lead">${escapeHtml(article.intro)}</p>

      <section class="detail-section">
        <h3>Как применять</h3>
        <ol>
          ${article.points
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ol>
      </section>

      <section class="detail-section">
        <h3>Типичные ошибки</h3>
        <ul>
          ${article.mistakes
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </section>

      <section class="detail-section">
        <h3>Практика</h3>
        <div class="notice">${escapeHtml(article.exercise)}</div>
      </section>
    </article>
  `;

  scrollTop("auto");
}

/* Вдохновение */

function renderInspiration() {
  const selected = crisisRoutes.find(
    (route) => route.id === state.selectedCrisisId
  );

  if (selected) {
    app.innerHTML = `
      <section class="screen">
        <button class="back-button" type="button" data-action="crisis-list">
          ← Все состояния
        </button>

        <div class="screen-heading">
          <h2>${escapeHtml(selected.title)}</h2>
          <p>${escapeHtml(selected.description)}</p>
        </div>

        <div class="card crisis-card">
          ${selected.steps
            .map(
              (step, index) => `
                <div class="route-step">
                  <span class="route-number">${index + 1}</span>
                  <p>${escapeHtml(step)}</p>
                </div>
              `
            )
            .join("")}
        </div>

        <div class="motivation">
          ✦ Цель маршрута — не получить идеальный кадр, а снова начать
          замечать.
        </div>

        <button
          class="primary-button"
          type="button"
          data-action="crisis-task"
        >
          Подобрать практическое задание
        </button>
      </section>
    `;

    scrollTop("auto");
    return;
  }

  app.innerHTML = `
    <section class="screen">
      <button class="back-button" type="button" data-action="back-learn">
        ← Назад к энциклопедии
      </button>

      <div class="screen-heading">
        <h2>Вернуть вдохновение</h2>
        <p>
          Выберите состояние, которое сейчас ближе всего. Здесь нет
          обязательной серии дней и оценки результата.
        </p>
      </div>

      <div class="card-list">
        ${crisisRoutes
          .map(
            (route) => `
              <button
                class="card crisis-card"
                type="button"
                data-crisis="${escapeHtml(route.id)}"
              >
                <h3>${escapeHtml(route.title)}</h3>
                <p>${escapeHtml(route.description)}</p>
              </button>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

/* Задания */

function filteredTasks() {
  return tasks.filter((task) => {
    const place =
      state.filterPlace === "все" ||
      task.place === state.filterPlace ||
      task.place === "где угодно";

    const period =
      state.filterPeriod === "все" ||
      task.period.includes(state.filterPeriod) ||
      task.period === "любое время";

    const condition =
      state.filterCondition === "все" ||
      task.conditions.includes(state.filterCondition) ||
      task.conditions.includes("любая");

    return place && period && condition && seasonMatches(task);
  });
}

function renderShoot() {
  const selected = currentTask();
  const list = filteredTasks();

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Снять</h2>
        <p>
          Используйте инструкцию как отправную точку, а не как строгий
          набор правил.
        </p>
      </div>

      ${detailedTask(selected)}

      <div class="section-header">
        <h3>Фильтры</h3>
      </div>

      <div class="filter-grid">
        ${filterButton(
          "place",
          labelOf(placeOptions, state.filterPlace)
        )}

        ${filterButton(
          "period",
          labelOf(periodOptions, state.filterPeriod)
        )}

        ${filterButton(
          "condition",
          labelOf(conditionOptions, state.filterCondition)
        )}

        <button class="filter-button" type="button" data-action="season">
          ${escapeHtml(seasonLabel())}
        </button>
      </div>

      <div class="section-header">
        <h3>Подходящие задания</h3>
        <span class="date-label">${list.length}</span>
      </div>

      <div class="card-list">
        ${
          list.length
            ? list.map(taskCard).join("")
            : `<div class="empty-state">
                Для выбранных условий пока нет задания.
              </div>`
        }
      </div>
    </section>
  `;
}

function filterButton(type, label) {
  return `
    <button
      class="filter-button"
      type="button"
      data-action="filter-${escapeHtml(type)}"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

function detailedTask(task) {
  return `
    <article class="task-card">
      <div class="card-top">
        <span class="category-label">
          ${escapeHtml(task.category)}
        </span>

        ${
          isCompleted(task.id)
            ? `<span class="tag">Выполнено</span>`
            : ""
        }
      </div>

      <h2>${escapeHtml(task.title)}</h2>
      <p class="task-description">${escapeHtml(task.description)}</p>

      <div class="task-meta">
        <span class="tag">${escapeHtml(task.place)}</span>
        <span class="tag">${escapeHtml(task.period)}</span>
        <span class="tag">${escapeHtml(seasonText(task.seasons))}</span>
      </div>

      <div class="task-visual">
        <div class="visual-object"></div>
        <div class="visual-pot"></div>
        <div class="visual-phone"></div>
        <div class="visual-label">
          Меняйте положение смартфона и сравнивайте результат
        </div>
      </div>

      <div class="motivation">
        ✦ ${escapeHtml(task.motivation)}
      </div>

      <section class="detail-section">
        <h3>Цель</h3>
        <div class="notice">${escapeHtml(task.goal)}</div>
      </section>

      <section class="detail-section">
        <h3>Что подготовить</h3>
        <ul>
          ${task.preparation
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </section>

      <section class="detail-section">
        <h3>Пошагово</h3>
        <ol>
          ${task.steps
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ol>
      </section>

      <section class="detail-section">
        <h3>Типичные ошибки</h3>
        <ul>
          ${task.mistakes
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </section>

      <section class="detail-section">
        <h3>Если условия не подходят</h3>
        <div class="notice">${escapeHtml(task.alternative)}</div>
      </section>

      <section class="detail-section">
        <h3>Усложнение</h3>
        <p>${escapeHtml(task.challenge)}</p>
      </section>

      <div class="task-actions">
        <button class="primary-button" type="button" data-action="random">
          Другое задание
        </button>

        <button
          class="secondary-button"
          type="button"
          data-action="complete"
        >
          ${
            isCompleted(task.id)
              ? "Убрать отметку"
              : "Отметить выполненным"
          }
        </button>
      </div>
    </article>
  `;
}

function seasonText(seasons) {
  return seasons.includes("все")
    ? "любой сезон"
    : seasons.join(", ");
}

function taskCard(task) {
  return `
    <button
      class="card"
      type="button"
      data-task="${escapeHtml(task.id)}"
    >
      <div class="card-top">
        <span class="category-label">
          ${escapeHtml(task.category)}
        </span>
        ${isCompleted(task.id) ? `<span class="tag">Выполнено</span>` : ""}
      </div>

      <h3>${escapeHtml(task.title)}</h3>
      <p>${escapeHtml(task.description)}</p>

      <div class="tags">
        <span class="tag">${escapeHtml(task.place)}</span>
        <span class="tag">${escapeHtml(seasonText(task.seasons))}</span>
      </div>
    </button>
  `;
}

function randomTask(mode = "normal") {
  let source = recommendedTasks();

  if (mode === "home") {
    source = tasks.filter(
      (task) => task.place === "дом" || task.place === "где угодно"
    );
  }

  if (mode === "crisis") {
    source = tasks.filter(
      (task) =>
        task.category === "Кризис" ||
        task.id === "five-frames" ||
        task.id === "archive-theme"
    );
  }

  source = source.filter((task) => task.id !== currentTask().id);

  if (!source.length) source = tasks;

  const selected = source[Math.floor(Math.random() * source.length)];
  openTask(selected.id);
}

function toggleComplete(id) {
  if (isCompleted(id)) {
    state.completedTasks = state.completedTasks.filter(
      (item) => item !== id
    );
    showToast("Отметка удалена");
  } else {
    state.completedTasks.push(id);
    showToast("Практика сохранена");
  }

  saveState();
  renderShoot();
}

/* Коллекция */

function renderCollection() {
  const favoriteArticles = articles.filter((article) =>
    state.favorites.includes(article.id)
  );

  const completed = tasks.filter((task) =>
    state.completedTasks.includes(task.id)
  );

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Коллекция</h2>
        <p>Сохранённые знания и выполненные практики.</p>
      </div>

      <div class="section-header">
        <h3>Материалы</h3>
        <span class="date-label">${favoriteArticles.length}</span>
      </div>

      ${
        favoriteArticles.length
          ? `<div class="card-list">
              ${favoriteArticles.map(articleCard).join("")}
            </div>`
          : `<div class="empty-state">
              Сохранённые статьи появятся здесь.
            </div>`
      }

      <div class="section-header">
        <h3>Практика</h3>
        <span class="date-label">${completed.length}</span>
      </div>

      ${
        completed.length
          ? `<div class="card-list">
              ${completed.map(taskCard).join("")}
            </div>`
          : `<div class="empty-state">
              Выполненные задания появятся здесь.
            </div>`
      }

      <div class="section-header">
        <h3>Очистка</h3>
      </div>

      <div class="danger-zone">
        <button
          class="danger-button"
          type="button"
          data-action="clear-completed"
          ${completed.length ? "" : "disabled"}
        >
          Очистить выполненные задания
        </button>

        <button
          class="danger-button"
          type="button"
          data-action="clear-favorites"
          ${favoriteArticles.length ? "" : "disabled"}
        >
          Очистить сохранённые материалы
        </button>
      </div>
    </section>
  `;
}

/* Профиль */

function renderProfile() {
  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Профиль</h2>
        <p>Настройте рекомендации и чтение под себя.</p>
      </div>

      <div class="profile-card">
        ${profileChoice(
          "Уровень и цель",
          "Влияет на рекомендации",
          "level",
          state.level
        )}

        ${profileChoice(
          "Размер текста",
          "Размер инструкций и описаний",
          "font",
          labelOf(fontSizes, state.fontSize)
        )}

        ${profileChoice(
          "Сезон",
          "Влияет на задания дня",
          "season",
          state.season === "auto"
            ? `Авто: ${seasonLabel()}`
            : seasonLabel()
        )}

        <div class="profile-row">
          <div class="profile-copy">
            <strong>Заданий на сегодня</strong>
            <small>Количество карточек на главной</small>
          </div>

          <div class="count-selector">
            ${[1, 2, 3]
              .map(
                (count) => `
                  <button
                    class="count-button ${
                      state.dailyCount === count ? "active" : ""
                    }"
                    type="button"
                    data-count="${count}"
                  >
                    ${count}
                  </button>
                `
              )
              .join("")}
          </div>
        </div>

        <div class="profile-row">
          <div class="profile-copy">
            <strong>Тёмная тема</strong>
            <small>Тёплый интерфейс для вечера</small>
          </div>

          <button
            class="toggle ${state.theme === "dark" ? "active" : ""}"
            type="button"
            data-action="toggle-theme"
            aria-label="Переключить тему"
          ></button>
        </div>

        <div class="profile-row">
          <div class="profile-copy">
            <strong>Выполнено</strong>
            <small>Без рейтингов и обязательной серии</small>
          </div>
          <strong>${state.completedTasks.length}</strong>
        </div>
      </div>

      <div class="section-header">
        <h3>Данные</h3>
      </div>

      <div class="danger-zone">
        <button
          class="danger-button"
          type="button"
          data-action="clear-completed"
        >
          Очистить выполненные задания
        </button>

        <button
          class="danger-button"
          type="button"
          data-action="clear-favorites"
        >
          Очистить избранное
        </button>
      </div>
    </section>
  `;
}

function profileChoice(title, subtitle, action, value) {
  return `
    <div class="profile-row">
      <div class="profile-copy">
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(subtitle)}</small>
      </div>

      <button
        class="setting-button"
        type="button"
        data-action="choose-${escapeHtml(action)}"
      >
        ${escapeHtml(value)}
      </button>
    </div>
  `;
}

/* Bottom sheet */

function openSheet(title, options, current, callback) {
  sheetTitle.textContent = title;

  sheetContent.innerHTML = options
    .map(
      (item) => `
        <button
          class="sheet-option ${item[0] === current ? "active" : ""}"
          type="button"
          data-sheet-value="${escapeHtml(item[0])}"
        >
          <span>
            <strong>${escapeHtml(item[1])}</strong>
            ${item[2] ? `<small>${escapeHtml(item[2])}</small>` : ""}
          </span>
          <span class="sheet-check">✓</span>
        </button>
      `
    )
    .join("");

  sheetBackdrop.classList.remove("hidden");
  document.body.classList.add("sheet-open");

  sheetContent.onclick = (event) => {
    const button = event.target.closest("[data-sheet-value]");

    if (!button) return;

    callback(button.dataset.sheetValue);
    closeSheet();
  };
}

function closeSheet() {
  sheetBackdrop.classList.add("hidden");
  document.body.classList.remove("sheet-open");
  sheetContent.onclick = null;
}

sheetClose.addEventListener("click", closeSheet);

sheetBackdrop.addEventListener("click", (event) => {
  if (event.target === sheetBackdrop) closeSheet();
});

/* Обработчики */

document.addEventListener("click", (event) => {
  const navigation = event.target.closest("[data-screen]");

  if (navigation) {
    setScreen(navigation.dataset.screen);
    return;
  }

  const taskButton = event.target.closest("[data-task]");

  if (taskButton) {
    openTask(taskButton.dataset.task);
    return;
  }

  const articleButton = event.target.closest("[data-article]");

  if (articleButton) {
    renderArticle(articleButton.dataset.article);
    return;
  }

  const crisisButton = event.target.closest("[data-crisis]");

  if (crisisButton) {
    state.selectedCrisisId = crisisButton.dataset.crisis;
    saveState();
    renderInspiration();
    return;
  }

  const catalogButton = event.target.closest("[data-catalog]");

  if (catalogButton) {
    state.learnCategory = catalogButton.dataset.catalog;
    state.learnQuery = "";
    saveState();
    renderLearn();
    return;
  }

  const categoryButton = event.target.closest("[data-category]");

  if (categoryButton) {
    state.learnCategory = categoryButton.dataset.category;
    saveState();
    renderLearn();
    return;
  }

  const countButton = event.target.closest("[data-count]");

  if (countButton) {
    state.dailyCount = Number(countButton.dataset.count);
    saveState();
    renderProfile();
    return;
  }

  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) return;

  const action = actionButton.dataset.action;

  if (action === "open-main-task") openTask(mainDailyTask().id);
  if (action === "change-daily") changeDailyTask();
  if (action === "open-all-tasks") setScreen("shoot");
  if (action === "random") randomTask();
  if (action === "home") randomTask("home");
  if (action === "crisis-task") randomTask("crisis");

  if (action === "learn") {
    state.learnMode = "catalog";
    state.screen = "learn";
    saveState();
    render();
    scrollTop();
  }

  if (action === "inspiration") {
    state.screen = "learn";
    state.learnMode = "inspiration";
    state.selectedCrisisId = null;
    saveState();
    render();
    scrollTop();
  }

  if (action === "back-learn") {
    state.learnMode = "catalog";
    state.selectedCrisisId = null;
    state.screen = "learn";
    saveState();
    render();
    scrollTop();
  }

  if (action === "crisis-list") {
    state.selectedCrisisId = null;
    saveState();
    renderInspiration();
  }

  if (action === "favorite") {
    const id = actionButton.dataset.id;

    state.favorites = isFavorite(id)
      ? state.favorites.filter((item) => item !== id)
      : [...state.favorites, id];

    saveState();
    renderArticle(id);
    showToast(isFavorite(id) ? "Сохранено" : "Удалено из коллекции");
  }

  if (action === "complete") {
    toggleComplete(currentTask().id);
  }

  if (action === "toggle-theme") {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveState();
    applyPreferences();
    renderProfile();
  }

  if (action === "choose-level") {
    openSheet(
      "Уровень и цель",
      levels.map(([value, description]) => [
        value,
        value,
        description
      ]),
      state.level,
      (value) => {
        state.level = value;
        delete state.dailyOverrides[dateKey()];
        saveState();
        renderProfile();
        showToast("Рекомендации обновлены");
      }
    );
  }

  if (action === "choose-font") {
    openSheet(
      "Размер текста",
      fontSizes,
      state.fontSize,
      (value) => {
        state.fontSize = value;
        saveState();
        applyPreferences();
        renderProfile();
      }
    );
  }

  if (action === "choose-season" || action === "season") {
    openSheet(
      "Сезон",
      seasonOptions,
      state.season,
      (value) => {
        state.season = value;
        delete state.dailyOverrides[dateKey()];
        saveState();

        if (state.screen === "shoot") renderShoot();
        else renderProfile();

        showToast("Сезонные рекомендации обновлены");
      }
    );
  }

  if (action === "filter-place") {
    openSheet("Место", placeOptions, state.filterPlace, (value) => {
      state.filterPlace = value;
      saveState();
      renderShoot();
    });
  }

  if (action === "filter-period") {
    openSheet("Время суток", periodOptions, state.filterPeriod, (value) => {
      state.filterPeriod = value;
      saveState();
      renderShoot();
    });
  }

  if (action === "filter-condition") {
    openSheet(
      "Условия",
      conditionOptions,
      state.filterCondition,
      (value) => {
        state.filterCondition = value;
        saveState();
        renderShoot();
      }
    );
  }

  if (action === "clear-completed") {
    if (
      state.completedTasks.length &&
      confirm("Удалить все отметки о выполнении?")
    ) {
      state.completedTasks = [];
      saveState();
      render();
      showToast("Выполненные задания очищены");
    }
  }

  if (action === "clear-favorites") {
    if (
      state.favorites.length &&
      confirm("Удалить все сохранённые материалы?")
    ) {
      state.favorites = [];
      saveState();
      render();
      showToast("Избранное очищено");
    }
  }
});

themeToggle.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveState();
  applyPreferences();
  render();
});

/* PWA */

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.classList.remove("hidden");
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    showToast("Используйте пункт установки в меню браузера");
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;

  deferredInstallPrompt = null;
  installButton.classList.add("hidden");
});

window.addEventListener("appinstalled", () => {
  installButton.classList.add("hidden");
  showToast("«Вне кадра» установлено");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration =
        await navigator.serviceWorker.register("./sw.js");

      registration.update();
    } catch (error) {
      console.warn("Service Worker:", error);
    }
  });
}

applyPreferences();
render();
