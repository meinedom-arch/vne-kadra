const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("#themeToggle");
const installButton = document.querySelector("#installButton");

const sheetBackdrop = document.querySelector("#sheetBackdrop");
const sheetTitle = document.querySelector("#sheetTitle");
const sheetContent = document.querySelector("#sheetContent");
const sheetClose = document.querySelector("#sheetClose");

const {
  articles,
  tasks,
  crisisRoutes,
  homeAlternatives,
  seasonalTasks,
  weeklyProjects,
  weekPlans,
  monthlyProjects,
  categories
} = VK_DATA;

const STORAGE_KEY = "vne-kadra-state-v7";

let deferredInstallPrompt = null;
let activeArticleId = null;

/*
 * ============================================================================
 * Настройки
 * ============================================================================
 */

const defaultState = {
  screen: "today",

  theme: "dark",
  fontSize: "normal",
  level: "Ищу новые идеи",
  season: "auto",

  /*
   * Количество заданий в ежедневной карусели.
   */
  dailyCount: 5,

  favorites: [],
  completedTasks: [],

  selectedTaskId: null,
  selectedCrisisId: null,

  learnQuery: "",
  learnCategory: "Все",
  learnMode: "catalog",

  filterPlace: "все",
  filterPeriod: "все",
  filterCondition: "все",
  filterLevel: "все",

  /*
   * Состояние ежедневных наборов.
   *
   * dailyState: {
   *   "2026-06-18": {
   *     pool: [],
   *     viewed: [],
   *     skipped: [],
   *     completed: [],
   *     activeIndex: 0
   *   }
   * }
   */
  dailyState: {},

  /*
   * Общая история недавно показанных заданий.
   * Используется для уменьшения количества повторов.
   */
  recentTaskIds: [],

  /*
   * Активный недельный план пользователя.
   * null означает, что план пока не запущен.
   */
  weekPlan: null
};

const levels = [
  {
    value: "Начинаю",
    label: "Начинаю",
    description:
      "Базовые упражнения и более подробные инструкции"
  },
  {
    value: "Снимаю уверенно",
    label: "Снимаю уверенно",
    description:
      "Композиция, свет, серии и работа с жанрами"
  },
  {
    value: "Ищу новые идеи",
    label: "Ищу новые идеи",
    description:
      "Эксперименты, ограничения и необычные приёмы"
  },
  {
    value: "Возвращаю вдохновение",
    label: "Возвращаю вдохновение",
    description:
      "Мягкие задания без требования идеального результата"
  }
];

const fontSizes = [
  {
    value: "compact",
    label: "Компактный",
    description:
      "Больше информации помещается на экране"
  },
  {
    value: "normal",
    label: "Обычный",
    description:
      "Основной размер текста"
  },
  {
    value: "large",
    label: "Крупный",
    description:
      "Увеличенные инструкции и описания"
  },
  {
    value: "extra-large",
    label: "Очень крупный",
    description:
      "Максимальный размер для комфортного чтения"
  }
];

const seasonOptions = [
  {
    value: "auto",
    label: "Определять автоматически",
    description:
      "Сезон определяется по текущему месяцу"
  },
  {
    value: "all",
    label: "Не учитывать сезон",
    description:
      "Показывать задания для любого времени года"
  },
  {
    value: "весна",
    label: "Весна"
  },
  {
    value: "лето",
    label: "Лето"
  },
  {
    value: "осень",
    label: "Осень"
  },
  {
    value: "зима",
    label: "Зима"
  }
];

const placeOptions = [
  {
    value: "все",
    label: "Любое место"
  },
  {
    value: "дом",
    label: "Дома"
  },
  {
    value: "улица",
    label: "На улице"
  },
  {
    value: "где угодно",
    label: "Где угодно"
  }
];

const periodOptions = [
  {
    value: "все",
    label: "Любое время"
  },
  {
    value: "утро",
    label: "Утром"
  },
  {
    value: "день",
    label: "Днём"
  },
  {
    value: "вечер",
    label: "Вечером"
  },
  {
    value: "ночь",
    label: "Ночью"
  }
];

const conditionOptions = [
  {
    value: "все",
    label: "Любые условия"
  },
  {
    value: "любая",
    label: "Без привязки к погоде"
  },
  {
    value: "солнце",
    label: "Солнечно"
  },
  {
    value: "пасмурно",
    label: "Пасмурно"
  },
  {
    value: "дождь",
    label: "Дождь"
  },
  {
    value: "снег",
    label: "Снег"
  },
  {
    value: "туман",
    label: "Туман"
  }
];

const taskLevelOptions = [
  {
    value: "все",
    label: "Любой уровень"
  },
  {
    value: "Начинающий",
    label: "Начинающий"
  },
  {
    value: "Продолжающий",
    label: "Продолжающий"
  },
  {
    value: "Эксперимент",
    label: "Эксперимент"
  },
  {
    value: "Любой",
    label: "Для всех"
  }
];

/*
 * ============================================================================
 * Загрузка и сохранение
 * ============================================================================
 */

function loadState() {
  const current = localStorage.getItem(STORAGE_KEY);

  if (current) {
    try {
      return normalizeState({
        ...defaultState,
        ...JSON.parse(current)
      });
    } catch {
      return { ...defaultState };
    }
  }

  /*
   * Миграция части настроек из прошлых версий.
   * Старую ежедневную логику не переносим.
   */
  const oldKeys = [
    "vne-kadra-state-v6",
    "vne-kadra-state-v5",
    "vne-kadra-state"
  ];

  for (const key of oldKeys) {
    const oldValue = localStorage.getItem(key);

    if (!oldValue) {
      continue;
    }

    try {
      const oldState = JSON.parse(oldValue);

      return normalizeState({
        ...defaultState,
        theme: oldState.theme || defaultState.theme,
        fontSize: oldState.fontSize || defaultState.fontSize,
        level: oldState.level || defaultState.level,
        season: oldState.season || defaultState.season,
        favorites: Array.isArray(oldState.favorites)
          ? oldState.favorites
          : [],
        completedTasks: Array.isArray(oldState.completedTasks)
          ? oldState.completedTasks
          : [],

        /*
         * В новой версии по умолчанию показываем пять карточек.
         */
        dailyCount: 5
      });
    } catch {
      continue;
    }
  }

  return { ...defaultState };
}

function normalizeState(input) {
  const normalized = {
    ...defaultState,
    ...input
  };

  if (!Array.isArray(normalized.favorites)) {
    normalized.favorites = [];
  }

  if (!Array.isArray(normalized.completedTasks)) {
    normalized.completedTasks = [];
  }

  if (!Array.isArray(normalized.recentTaskIds)) {
    normalized.recentTaskIds = [];
  }

  if (
    !normalized.dailyState ||
    typeof normalized.dailyState !== "object" ||
    Array.isArray(normalized.dailyState)
  ) {
    normalized.dailyState = {};
  }

  const count = Number(normalized.dailyCount);

  normalized.dailyCount = Number.isFinite(count)
    ? Math.min(5, Math.max(1, count))
    : 5;

  if (
    normalized.weekPlan &&
    typeof normalized.weekPlan !== "object"
  ) {
    normalized.weekPlan = null;
  }

  if (
    normalized.weekPlan &&
    !Array.isArray(normalized.weekPlan.days)
  ) {
    normalized.weekPlan = null;
  }

  return normalized;
}

let state = loadState();

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

/*
 * ============================================================================
 * Общие функции
 * ============================================================================
 */

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function unique(values) {
  return [...new Set(values)];
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2700);
}

function scrollToTop(behavior = "smooth") {
  requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior
    });
  });
}

function localDateKey() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function dateSeed() {
  return stringSeed(localDateKey());
}

function stringSeed(value) {
  return String(value)
    .split("")
    .reduce(
      (sum, character, index) =>
        sum + character.charCodeAt(0) * (index + 1),
      0
    );
}

function seededOrder(items, seed) {
  return [...items].sort((first, second) => {
    const firstScore = stringSeed(
      `${first.id}-${seed}`
    );

    const secondScore = stringSeed(
      `${second.id}-${seed}`
    );

    return firstScore - secondScore;
  });
}

function randomItem(items) {
  if (!items.length) {
    return null;
  }

  return items[
    Math.floor(Math.random() * items.length)
  ];
}

function formatDate() {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());
}

function currentSeason() {
  if (state.season && state.season !== "auto") {
    return state.season;
  }

  const month = new Date().getMonth() + 1;

  if ([12, 1, 2].includes(month)) {
    return "зима";
  }

  if ([3, 4, 5].includes(month)) {
    return "весна";
  }

  if ([6, 7, 8].includes(month)) {
    return "лето";
  }

  return "осень";
}

function seasonLabel() {
  if (state.season === "all") {
    return "Любой сезон";
  }

  const season = currentSeason();

  return (
    season.charAt(0).toUpperCase() +
    season.slice(1)
  );
}

function optionLabel(options, value) {
  return (
    options.find((item) => item.value === value)
      ?.label || value
  );
}

function isFavorite(id) {
  return state.favorites.includes(id);
}

function isCompleted(id) {
  return state.completedTasks.includes(id);
}

function taskById(id) {
  return tasks.find((task) => task.id === id);
}

function articleById(id) {
  return articles.find(
    (article) => article.id === id
  );
}

function applyPreferences() {
  document.documentElement.dataset.theme =
    state.theme;

  document.documentElement.dataset.font =
    state.fontSize;

  const themeColor = document.querySelector(
    'meta[name="theme-color"]'
  );

  if (themeColor) {
    themeColor.content =
      state.theme === "dark"
        ? "#11100f"
        : "#f4f0eb";
  }
}

function updateNavigation() {
  document
    .querySelectorAll(".nav-item")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.screen === state.screen
      );
    });
}

/*
 * ============================================================================
 * Персонализация заданий
 * ============================================================================
 */

function taskMatchesSeason(task) {
  const season = currentSeason();

  if (season === "all") {
    return true;
  }

  return (
    task.seasons.includes("все") ||
    task.seasons.includes(season)
  );
}

function taskMatchesProfile(task) {
  if (task.level === "Любой") {
    return true;
  }

  if (state.level === "Начинаю") {
    return task.level === "Начинающий";
  }

  if (state.level === "Снимаю уверенно") {
    return [
      "Начинающий",
      "Продолжающий"
    ].includes(task.level);
  }

  if (state.level === "Ищу новые идеи") {
    return [
      "Продолжающий",
      "Эксперимент",
      "Любой"
    ].includes(task.level);
  }

  if (state.level === "Возвращаю вдохновение") {
    return (
      task.category === "Творческий кризис" ||
      task.category === "Ограничение" ||
      task.level === "Любой" ||
      task.place === "дом"
    );
  }

  return true;
}

function availableRecommendedTasks() {
  const readyTasks = tasks.filter(
    (task) => task.status === "ready"
  );

  const exact = readyTasks.filter(
    (task) =>
      taskMatchesSeason(task) &&
      taskMatchesProfile(task)
  );

  if (exact.length >= state.dailyCount) {
    return exact;
  }

  const seasonal = readyTasks.filter(
    taskMatchesSeason
  );

  return uniqueById([
    ...exact,
    ...seasonal,
    ...readyTasks
  ]);
}

function uniqueById(items) {
  const found = new Map();

  items.forEach((item) => {
    if (item && !found.has(item.id)) {
      found.set(item.id, item);
    }
  });

  return [...found.values()];
}

/*
 * ============================================================================
 * Ежедневный пул
 * ============================================================================
 */

function emptyDailyRecord() {
  return {
    pool: [],
    viewed: [],
    skipped: [],
    completed: [],
    activeIndex: 0
  };
}

function getDailyRecord() {
  const key = localDateKey();

  if (!state.dailyState[key]) {
    state.dailyState[key] = emptyDailyRecord();
  }

  const record = state.dailyState[key];

  if (!Array.isArray(record.pool)) {
    record.pool = [];
  }

  if (!Array.isArray(record.viewed)) {
    record.viewed = [];
  }

  if (!Array.isArray(record.skipped)) {
    record.skipped = [];
  }

  if (!Array.isArray(record.completed)) {
    record.completed = [];
  }

  if (!Number.isFinite(record.activeIndex)) {
    record.activeIndex = 0;
  }

  cleanupOldDailyRecords();

  return record;
}

function cleanupOldDailyRecords() {
  const keys = Object.keys(state.dailyState)
    .sort();

  if (keys.length <= 14) {
    return;
  }

  keys
    .slice(0, keys.length - 14)
    .forEach((key) => {
      delete state.dailyState[key];
    });
}

function ensureDailyPool() {
  const record = getDailyRecord();

  record.pool = record.pool.filter(
    (id) => Boolean(taskById(id))
  );

  /*
   * Если пользователь уменьшил количество карточек,
   * лишние карточки остаются в истории, но не в пуле.
   */
  if (record.pool.length > state.dailyCount) {
    const removed = record.pool.slice(
      state.dailyCount
    );

    record.skipped = unique([
      ...record.skipped,
      ...removed
    ]);

    record.pool = record.pool.slice(
      0,
      state.dailyCount
    );
  }

  while (
    record.pool.length < state.dailyCount
  ) {
    const next = chooseReplacementTask({
      excludePool: record.pool,
      strict: true,
      seedOffset: record.pool.length
    });

    if (!next) {
      break;
    }

    record.pool.push(next.id);
  }

  record.activeIndex = Math.min(
    Math.max(0, record.activeIndex),
    Math.max(0, record.pool.length - 1)
  );

  if (record.pool.length) {
    markTaskViewed(
      record.pool[record.activeIndex],
      false
    );
  }

  saveState();

  return record;
}

function chooseReplacementTask({
  excludePool = [],
  strict = true,
  seedOffset = 0
} = {}) {
  const record = getDailyRecord();

  const globallyCompleted = new Set(
    state.completedTasks
  );

  const excludedPool = new Set(excludePool);
  const viewed = new Set(record.viewed);
  const skipped = new Set(record.skipped);
  const recent = new Set(state.recentTaskIds);

  const recommended = seededOrder(
    availableRecommendedTasks(),
    dateSeed() + seedOffset
  );

  /*
   * Первый проход:
   * не показываем ничего просмотренного, пропущенного,
   * выполненного или недавно встречавшегося.
   */
  let candidates = recommended.filter(
    (task) =>
      !globallyCompleted.has(task.id) &&
      !excludedPool.has(task.id) &&
      !viewed.has(task.id) &&
      !skipped.has(task.id) &&
      !recent.has(task.id)
  );

  if (candidates.length) {
    return candidates[0];
  }

  /*
   * Второй проход:
   * разрешаем недавно встречавшиеся задания,
   * но не просмотренные сегодня.
   */
  candidates = recommended.filter(
    (task) =>
      !globallyCompleted.has(task.id) &&
      !excludedPool.has(task.id) &&
      !viewed.has(task.id) &&
      !skipped.has(task.id)
  );

  if (candidates.length) {
    return candidates[0];
  }

  /*
   * Третий проход:
   * разрешаем просмотренные, если библиотека пока мала.
   */
  candidates = recommended.filter(
    (task) =>
      !globallyCompleted.has(task.id) &&
      !excludedPool.has(task.id) &&
      !skipped.has(task.id)
  );

  if (candidates.length) {
    return randomItem(candidates);
  }

  if (strict) {
    /*
     * Последний безопасный вариант:
     * выполненные всё ещё исключены.
     */
    candidates = tasks.filter(
      (task) =>
        task.status === "ready" &&
        !globallyCompleted.has(task.id) &&
        !excludedPool.has(task.id)
    );

    if (candidates.length) {
      return randomItem(candidates);
    }
  }

  /*
   * Если пользователь выполнил почти всю текущую библиотеку,
   * разрешаем повтор, иначе пул невозможно заполнить.
   */
  candidates = tasks.filter(
    (task) =>
      task.status === "ready" &&
      !excludedPool.has(task.id)
  );

  return randomItem(candidates);
}

function dailyTasks() {
  const record = ensureDailyPool();

  return record.pool
    .map(taskById)
    .filter(Boolean);
}

function activeDailyTask() {
  const record = ensureDailyPool();
  const taskId = record.pool[
    record.activeIndex
  ];

  return taskById(taskId) || dailyTasks()[0];
}

function markTaskViewed(
  taskId,
  shouldSave = true
) {
  if (!taskId) {
    return;
  }

  const record = getDailyRecord();

  record.viewed = unique([
    ...record.viewed,
    taskId
  ]);

  state.recentTaskIds = [
    taskId,
    ...state.recentTaskIds.filter(
      (id) => id !== taskId
    )
  ].slice(0, 20);

  if (shouldSave) {
    saveState();
  }
}

function setDailyIndex(index) {
  const record = ensureDailyPool();
  const count = record.pool.length;

  if (!count) {
    return;
  }

  const normalized =
    ((index % count) + count) % count;

  record.activeIndex = normalized;

  markTaskViewed(
    record.pool[normalized],
    false
  );

  saveState();
  updateCarouselPosition();
}

function nextDailyTask() {
  const record = ensureDailyPool();

  setDailyIndex(record.activeIndex + 1);
}

function previousDailyTask() {
  const record = ensureDailyPool();

  setDailyIndex(record.activeIndex - 1);
}

function replaceDailyTaskAt(index) {
  const record = ensureDailyPool();

  if (!record.pool[index]) {
    return;
  }

  const oldId = record.pool[index];

  record.skipped = unique([
    ...record.skipped,
    oldId
  ]);

  const replacement =
    chooseReplacementTask({
      excludePool: record.pool,
      strict: true,
      seedOffset:
        record.skipped.length +
        record.viewed.length
    });

  if (!replacement) {
    showToast(
      "Новых заданий пока не осталось"
    );

    return;
  }

  record.pool[index] = replacement.id;

  markTaskViewed(
    replacement.id,
    false
  );

  saveState();
  renderToday(true);

  showToast("Карточка обновлена");
}

function replaceAllDailyTasks() {
  const record = ensureDailyPool();

  record.skipped = unique([
    ...record.skipped,
    ...record.pool
  ]);

  const newPool = [];

  while (
    newPool.length < state.dailyCount
  ) {
    const replacement =
      chooseReplacementTask({
        excludePool: newPool,
        strict: true,
        seedOffset:
          record.skipped.length +
          newPool.length
      });

    if (!replacement) {
      break;
    }

    newPool.push(replacement.id);
  }

  if (!newPool.length) {
    showToast(
      "Новых заданий пока не осталось"
    );

    return;
  }

  record.pool = newPool;
  record.activeIndex = 0;

  markTaskViewed(
    record.pool[0],
    false
  );

  saveState();
  renderToday(true);

  showToast("Набор на сегодня обновлён");
}

function replaceCompletedInDailyPool(taskId) {
  const record = getDailyRecord();
  const index = record.pool.indexOf(taskId);

  if (index === -1) {
    return false;
  }

  record.completed = unique([
    ...record.completed,
    taskId
  ]);

  record.skipped = unique([
    ...record.skipped,
    taskId
  ]);

  const poolWithoutCompleted =
    record.pool.filter(
      (id) => id !== taskId
    );

  const replacement =
    chooseReplacementTask({
      excludePool: poolWithoutCompleted,
      strict: true,
      seedOffset:
        record.completed.length +
        record.skipped.length
    });

  if (replacement) {
    poolWithoutCompleted.splice(
      index,
      0,
      replacement.id
    );
  }

  record.pool = poolWithoutCompleted.slice(
    0,
    state.dailyCount
  );

  if (
    record.activeIndex >= record.pool.length
  ) {
    record.activeIndex = Math.max(
      0,
      record.pool.length - 1
    );
  }

  if (record.pool[record.activeIndex]) {
    markTaskViewed(
      record.pool[record.activeIndex],
      false
    );
  }

  saveState();

  return true;
}

/*
 * ============================================================================
 * Навигация
 * ============================================================================
 */

function setScreen(
  screen,
  shouldScroll = true
) {
  state.screen = screen;

  if (screen !== "learn") {
    state.learnMode = "catalog";
  }

  saveState();
  render();

  if (shouldScroll) {
    scrollToTop();
  }
}

function openTask(taskId) {
  const selected = taskById(taskId);

  if (!selected) {
    return;
  }

  state.selectedTaskId = taskId;
  state.screen = "shoot";

  markTaskViewed(taskId, false);

  saveState();
  render();
  scrollToTop("auto");
}

function currentTask() {
  return (
    taskById(state.selectedTaskId) ||
    activeDailyTask() ||
    tasks[0]
  );
}

function render() {
  applyPreferences();
  updateNavigation();

  if (state.screen === "today") {
    renderToday();
  }

  if (state.screen === "learn") {
    renderLearn();
  }

  if (state.screen === "shoot") {
    renderShoot();
  }

  if (state.screen === "collection") {
    renderCollection();
  }

  if (state.screen === "profile") {
    renderProfile();
  }
}

/*
 * ============================================================================
 * Главная и карусель
 * ============================================================================
 */

function renderToday(animate = false) {
  const dayTasks = dailyTasks();
  const record = ensureDailyPool();

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <span class="date-label">
          ${escapeHtml(formatDate())}
        </span>

        <h2>Смотри чуть дальше.</h2>

        <p>
          ${escapeHtml(seasonLabel())}.
          Листайте карточки и выбирайте то,
          что подходит именно сегодня.
        </p>
      </div>

      <div class="daily-carousel-shell">
        <div class="daily-carousel-toolbar">
          <span class="daily-counter">
            <strong id="dailyCurrentNumber">
              ${record.activeIndex + 1}
            </strong>
            из
            <span id="dailyTotalNumber">
              ${dayTasks.length}
            </span>
          </span>

          <button
            class="daily-refresh-all"
            type="button"
            data-action="refresh-daily-all"
          >
            ↻ Обновить все
          </button>
        </div>

        <div
          class="daily-carousel ${
            animate ? "is-changing" : ""
          }"
          id="dailyCarousel"
        >
          <div
            class="daily-carousel-track"
            id="dailyCarouselTrack"
          >
            ${dayTasks
              .map(
                (task, index) =>
                  dailyCarouselCard(
                    task,
                    index
                  )
              )
              .join("")}
          </div>
        </div>

        <div class="daily-carousel-navigation">
          <button
            class="carousel-arrow"
            type="button"
            data-action="daily-prev"
            aria-label="Предыдущее задание"
          >
            ←
          </button>

          <div
            class="carousel-dots"
            id="dailyDots"
            aria-label="Выбор задания"
          >
            ${dayTasks
              .map(
                (_, index) => `
                  <button
                    class="carousel-dot ${
                      index ===
                      record.activeIndex
                        ? "active"
                        : ""
                    }"
                    type="button"
                    data-daily-index="${index}"
                    aria-label="Задание ${
                      index + 1
                    }"
                  ></button>
                `
              )
              .join("")}
          </div>

          <button
            class="carousel-arrow"
            type="button"
            data-action="daily-next"
            aria-label="Следующее задание"
          >
            →
          </button>
        </div>

        ${
          dayTasks.length > 1
            ? `
              <p class="carousel-hint">
                Проведите по карточке влево или вправо
              </p>
            `
            : ""
        }
      </div>
      ${renderWeekPreview()}
      <div class="section-header">
        <h3>Быстрый выбор</h3>

        <button
          type="button"
          data-action="open-all-tasks"
        >
          Все задания
        </button>
      </div>

      <div class="quick-grid">
        <button
          class="quick-card"
          type="button"
          data-action="random-task"
        >
          <span class="quick-icon">⤨</span>
          <strong>Случайная идея</strong>
          <small>
            С учётом уровня и сезона
          </small>
        </button>

        <button
          class="quick-card"
          type="button"
          data-action="home-task"
        >
          <span class="quick-icon">⌂</span>
          <strong>Снять дома</strong>
          <small>
            Практика без выхода на улицу
          </small>
        </button>

        <button
          class="quick-card"
          type="button"
          data-action="open-inspiration"
        >
          <span class="quick-icon">↻</span>
          <strong>Вернуть вдохновение</strong>
          <small>
            Спокойные маршруты без давления
          </small>
        </button>

        <button
          class="quick-card"
          type="button"
          data-action="open-learn"
        >
          <span class="quick-icon">✦</span>
          <strong>Изучить приём</strong>
          <small>
            Открыть энциклопедию
          </small>
        </button>
      </div>

      <div class="section-header">
        <h3>Наблюдение</h3>
      </div>

      <div class="info-card">
        <div class="info-card-icon">◌</div>

        <div>
          <h3>Необязательно выполнить всё</h3>

          <p>
            Ежедневный набор нужен для выбора,
            а не для создания чувства долга.
            Одного внимательного задания достаточно.
          </p>
        </div>
      </div>
    </section>
  `;

  setupDailyCarousel();
  updateCarouselPosition(false);
}

function dailyCarouselCard(task, index) {
  const completed = isCompleted(task.id);

  return `
    <article
      class="daily-slide"
      data-daily-slide="${index}"
      data-task-id="${escapeHtml(task.id)}"
    >
      <div class="daily-hero-card">
        <div class="daily-card-topline">
          <span class="hero-kicker">
            Задание на сегодня
          </span>

          ${
            completed
              ? `
                <span class="daily-completed-badge">
                  ✓ Выполнено
                </span>
              `
              : ""
          }
        </div>

        <div class="daily-card-content">
          <div class="daily-card-copy">
            <h2>
              ${escapeHtml(task.title)}
            </h2>

            <p>
              ${escapeHtml(
                task.shortDescription
              )}
            </p>

            <div class="daily-card-tags">
              <span>
                ${escapeHtml(task.category)}
              </span>

              <span>
                ${escapeHtml(task.place)}
              </span>
            </div>
          </div>

          ${renderTaskVisual(
            task.visual,
            true
          )}
        </div>

        <div class="daily-card-footer">
          <button
            class="primary-button"
            type="button"
            data-open-daily-task="${escapeHtml(
              task.id
            )}"
          >
            ${
              completed
                ? "Открыть снова"
                : "Начать"
            }
          </button>

          <button
            class="daily-card-refresh"
            type="button"
            data-replace-daily-index="${index}"
            aria-label="Заменить это задание"
            title="Заменить задание"
          >
            ↻
          </button>
        </div>
      </div>
    </article>
  `;
}

function setupDailyCarousel() {
  const carousel =
    document.querySelector("#dailyCarousel");

  if (!carousel) {
    return;
  }

  let startX = 0;
  let startY = 0;
  let moving = false;

  carousel.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];

      startX = touch.clientX;
      startY = touch.clientY;
      moving = true;
    },
    {
      passive: true
    }
  );

  carousel.addEventListener(
    "touchend",
    (event) => {
      if (!moving) {
        return;
      }

      const touch = event.changedTouches[0];

      const deltaX =
        touch.clientX - startX;

      const deltaY =
        touch.clientY - startY;

      moving = false;

      /*
       * Не перехватываем вертикальную прокрутку.
       */
      if (
        Math.abs(deltaX) <
          Math.abs(deltaY) ||
        Math.abs(deltaX) < 45
      ) {
        return;
      }

      if (deltaX < 0) {
        nextDailyTask();
      } else {
        previousDailyTask();
      }
    },
    {
      passive: true
    }
  );
}

function updateCarouselPosition(
  animate = true
) {
  const record = ensureDailyPool();

  const track = document.querySelector(
    "#dailyCarouselTrack"
  );

  if (!track) {
    return;
  }

  if (!animate) {
    track.style.transition = "none";
  } else {
    track.style.transition = "";
  }

  track.style.transform =
    `translateX(-${record.activeIndex * 100}%)`;

  document
    .querySelectorAll(".carousel-dot")
    .forEach((dot, index) => {
      dot.classList.toggle(
        "active",
        index === record.activeIndex
      );
    });

  const currentNumber =
    document.querySelector(
      "#dailyCurrentNumber"
    );

  if (currentNumber) {
    currentNumber.textContent =
      String(record.activeIndex + 1);
  }

  if (!animate) {
    requestAnimationFrame(() => {
      track.style.transition = "";
    });
  }

  const taskId =
    record.pool[record.activeIndex];

  markTaskViewed(taskId);
}

/*
 * ============================================================================
 * Визуализации
 * ============================================================================
 */

function renderTaskVisual(
  type = "neutral",
  compact = false
) {
  const compactClass = compact
    ? "task-visual-compact"
    : "";

  if (type === "light") {
    return `
      <div class="task-visual visual-light ${compactClass}">
        <div class="visual-window"></div>
        <div class="visual-ray ray-one"></div>
        <div class="visual-ray ray-two"></div>
        <div class="visual-ray ray-three"></div>
        <div class="visual-subject"></div>
        ${
          compact
            ? ""
            : `
              <div class="visual-caption">
                Меняйте положение предмета относительно окна
              </div>
            `
        }
      </div>
    `;
  }

  if (type === "low-angle") {
    return `
      <div class="task-visual visual-low-angle ${compactClass}">
        <div class="visual-ground-line"></div>
        <div class="visual-low-phone"></div>
        <div class="visual-low-object"></div>
        <div class="visual-up-arrow">↑</div>
        ${
          compact
            ? ""
            : `
              <div class="visual-caption">
                Опустите объектив почти к поверхности
              </div>
            `
        }
      </div>
    `;
  }

  if (type === "shadow") {
    return `
      <div class="task-visual visual-shadow ${compactClass}">
        <div class="visual-sun"></div>
        <div class="visual-shadow-object"></div>
        <div class="visual-shadow-form"></div>
        ${
          compact
            ? ""
            : `
              <div class="visual-caption">
                Покажите тень вместо самого объекта
              </div>
            `
        }
      </div>
    `;
  }

  if (type === "reflection") {
    return `
      <div class="task-visual visual-reflection ${compactClass}">
        <div class="visual-reflection-object top"></div>
        <div class="visual-reflection-line"></div>
        <div class="visual-reflection-object bottom"></div>
        <div class="visual-ripple ripple-one"></div>
        <div class="visual-ripple ripple-two"></div>
        ${
          compact
            ? ""
            : `
              <div class="visual-caption">
                Меняйте угол, пока два пространства не соединятся
              </div>
            `
        }
      </div>
    `;
  }

  if (type === "motion") {
    return `
      <div class="task-visual visual-motion ${compactClass}">
        <div class="motion-line line-one"></div>
        <div class="motion-line line-two"></div>
        <div class="motion-line line-three"></div>
        <div class="motion-subject"></div>
        <div class="motion-phone"></div>
        ${
          compact
            ? ""
            : `
              <div class="visual-caption">
                Ведите смартфон вслед за объектом
              </div>
            `
        }
      </div>
    `;
  }

  if (type === "macro") {
    return `
      <div class="task-visual visual-macro ${compactClass}">
        <div class="macro-texture texture-one"></div>
        <div class="macro-texture texture-two"></div>
        <div class="macro-texture texture-three"></div>
        <div class="macro-focus">
          <span></span>
        </div>
        ${
          compact
            ? ""
            : `
              <div class="visual-caption">
                Найдите точную дистанцию фокусировки
              </div>
            `
        }
      </div>
    `;
  }

  if (type === "portrait") {
    return `
      <div class="task-visual visual-portrait ${compactClass}">
        <div class="portrait-head"></div>
        <div class="portrait-body"></div>
        <div class="portrait-hand"></div>
        <div class="portrait-object"></div>
        ${
          compact
            ? ""
            : `
              <div class="visual-caption">
                Расскажите о человеке через жест и предмет
              </div>
            `
        }
      </div>
    `;
  }

  if (type === "architecture") {
    return `
      <div class="task-visual visual-architecture ${compactClass}">
        <div class="architecture-line arch-one"></div>
        <div class="architecture-line arch-two"></div>
        <div class="architecture-line arch-three"></div>
        <div class="architecture-point"></div>
        ${
          compact
            ? ""
            : `
              <div class="visual-caption">
                Используйте линии и несколько планов
              </div>
            `
        }
      </div>
    `;
  }

  if (type === "series") {
    return `
      <div class="task-visual visual-series ${compactClass}">
        <div class="series-frame frame-one">1</div>
        <div class="series-frame frame-two">2</div>
        <div class="series-frame frame-three">3</div>
        <div class="series-frame frame-four">4</div>
        <div class="series-frame frame-five">5</div>
        ${
          compact
            ? ""
            : `
              <div class="visual-caption">
                Каждый следующий кадр должен отличаться
              </div>
            `
        }
      </div>
    `;
  }

  if (type === "minimalism") {
    return `
      <div class="task-visual visual-minimalism ${compactClass}">
        <div class="minimal-object"></div>
        <div class="minimal-space-line"></div>
        ${
          compact
            ? ""
            : `
              <div class="visual-caption">
                Оставьте вокруг объекта больше свободного пространства
              </div>
            `
        }
      </div>
    `;
  }

  return `
    <div class="task-visual visual-neutral ${compactClass}">
      <div class="neutral-frame"></div>
      <div class="neutral-focus-dot"></div>
      <div class="neutral-corner corner-one"></div>
      <div class="neutral-corner corner-two"></div>
      <div class="neutral-corner corner-three"></div>
      <div class="neutral-corner corner-four"></div>
      ${
        compact
          ? ""
          : `
            <div class="visual-caption">
              Измените один привычный способ смотреть
            </div>
          `
      }
    </div>
  `;
}
function renderWeekPreview() {
  const active = state.weekPlan;

  if (!active) {
    return `
      <section class="week-preview">
        <div class="week-preview-copy">
          <span class="week-preview-kicker">
            МОЯ НЕДЕЛЯ
          </span>

          <h3>Практика без гонки</h3>

          <p>
            Выберите спокойный семидневный план:
            свет, ракурсы, фактуры, истории
            или мягкое возвращение к фотографии.
          </p>
        </div>

        <button
          class="secondary-button"
          type="button"
          data-action="open-week"
        >
          Выбрать план
        </button>
      </section>
    `;
  }

  const plan = weekPlans.find(
    (item) => item.id === active.planId
  );

  const completed = active.days.filter(
    (day) => day.status === "completed"
  ).length;

  const currentDay = getActiveWeekDay();

  return `
    <section class="week-preview week-preview-active">
      <div class="week-preview-copy">
        <span class="week-preview-kicker">
          МОЯ НЕДЕЛЯ · ${completed} из 7
        </span>

        <h3>
          ${escapeHtml(
            plan?.title || "Активный план"
          )}
        </h3>

        <p>
          ${
            currentDay
              ? `Сейчас: ${escapeHtml(currentDay.title)}`
              : "План завершён. Можно посмотреть итоги."
          }
        </p>
      </div>

      <button
        class="secondary-button"
        type="button"
        data-action="open-week"
      >
        Открыть
      </button>
    </section>
  `;
}
/*
 * ============================================================================
 * Энциклопедия
 * ============================================================================
 */

function renderLearn() {
  if (state.learnMode === "inspiration") {
    renderInspiration();
    return;
  }

  if (state.learnMode === "home") {
    renderHomeAlternatives();
    return;
  }

  if (state.learnMode === "projects") {
    renderProjects();
    return;
  }

  const articleCategories = [
    "Все",
    ...unique(
      articles
        .filter(
          (article) =>
            article.status === "ready"
        )
        .map((article) => article.category)
    )
  ];

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Изучать</h2>

        <p>
          Энциклопедия приёмов, света,
          композиции и творческой практики.
        </p>
      </div>

      <div class="search-box">
        <span class="search-icon">⌕</span>

        <input
          id="articleSearch"
          type="search"
          autocomplete="off"
          inputmode="search"
          placeholder="Найти технику или идею"
          value="${escapeHtml(
            state.learnQuery
          )}"
        />
      </div>

      ${
        !state.learnQuery &&
        state.learnCategory === "Все"
          ? `
            <div class="catalog-grid">
              ${categories
                .map(catalogCard)
                .join("")}

              <button
                class="catalog-card"
                type="button"
                data-action="open-home-alternatives"
              >
                <span class="catalog-icon">⌂</span>
                <strong>Снять дома</strong>
                <small>
                  Альтернативы для плохой погоды
                </small>
              </button>

              <button
                class="catalog-card"
                type="button"
                data-action="open-projects"
              >
                <span class="catalog-icon">▦</span>
                <strong>Проекты</strong>
                <small>
                  Практика на неделю и месяц
                </small>
              </button>
            </div>
          `
          : ""
      }

      <div class="section-header">
        <h3>Материалы</h3>

        <span
          class="date-label"
          id="articleCount"
        ></span>
      </div>

      <div class="chips">
        ${articleCategories
          .map(
            (category) => `
              <button
                class="chip ${
                  state.learnCategory ===
                  category
                    ? "active"
                    : ""
                }"
                type="button"
                data-category="${escapeHtml(
                  category
                )}"
              >
                ${escapeHtml(category)}
              </button>
            `
          )
          .join("")}
      </div>

      <div
        id="articleResults"
        class="article-list"
      ></div>
    </section>
  `;

  updateArticleResults();

  document
    .querySelector("#articleSearch")
    ?.addEventListener(
      "input",
      (event) => {
        state.learnQuery =
          event.target.value;

        saveState();
        updateArticleResults();
      }
    );
}

function catalogCard(category) {
  if (category.id === "inspiration") {
    return `
      <button
        class="catalog-card"
        type="button"
        data-action="open-inspiration"
      >
        <span class="catalog-icon">
          ${escapeHtml(category.icon)}
        </span>

        <strong>
          ${escapeHtml(category.title)}
        </strong>

        <small>
          ${escapeHtml(
            category.description
          )}
        </small>
      </button>
    `;
  }

  return `
    <button
      class="catalog-card"
      type="button"
      data-catalog-title="${escapeHtml(
        category.title
      )}"
    >
      <span class="catalog-icon">
        ${escapeHtml(category.icon)}
      </span>

      <strong>
        ${escapeHtml(category.title)}
      </strong>

      <small>
        ${escapeHtml(category.description)}
      </small>
    </button>
  `;
}

function articleMatches(article) {
  if (article.status !== "ready") {
    return false;
  }

  const query = state.learnQuery
    .trim()
    .toLowerCase();

  const categoryMatch =
    state.learnCategory === "Все" ||
    article.category ===
      state.learnCategory;

  const searchable = [
    article.title,
    article.category,
    article.description,
    article.tags.join(" ")
  ]
    .join(" ")
    .toLowerCase();

  return (
    categoryMatch &&
    searchable.includes(query)
  );
}

function updateArticleResults() {
  const filtered = articles.filter(
    articleMatches
  );

  const container =
    document.querySelector(
      "#articleResults"
    );

  const counter =
    document.querySelector("#articleCount");

  if (counter) {
    counter.textContent = filtered.length;
  }

  if (!container) {
    return;
  }

  container.innerHTML = filtered.length
    ? filtered.map(articleCard).join("")
    : `
      <div class="empty-state">
        Ничего не найдено.<br />
        Попробуйте изменить запрос или категорию.
      </div>
    `;
}

function articleCard(article) {
  return `
    <button
      class="article-card"
      type="button"
      data-article="${escapeHtml(
        article.id
      )}"
    >
      <div class="article-topline">
        <span class="article-category">
          ${escapeHtml(article.category)}
        </span>

        <span class="favorite ${
          isFavorite(article.id)
            ? "is-favorite"
            : ""
        }">
          ${
            isFavorite(article.id)
              ? "♥"
              : "♡"
          }
        </span>
      </div>

      <h3>${escapeHtml(article.title)}</h3>

      <p>
        ${escapeHtml(
          article.description
        )}
      </p>

      <div class="tag-row">
        ${article.tags
          .slice(0, 3)
          .map(
            (tag) => `
              <span class="tag">
                ${escapeHtml(tag)}
              </span>
            `
          )
          .join("")}
      </div>
    </button>
  `;
}

function renderArticle(articleId) {
  const article = articleById(articleId);

  if (!article) {
    setScreen("learn");
    return;
  }

  activeArticleId = articleId;

  app.innerHTML = `
    <article class="article-detail">
      <button
        class="back-button"
        type="button"
        data-action="back-to-learn"
      >
        ← Назад к энциклопедии
      </button>

      <div class="article-topline">
        <span class="article-category">
          ${escapeHtml(article.category)}
        </span>

        <button
          class="ghost-button"
          type="button"
          data-action="toggle-favorite"
          data-id="${escapeHtml(
            article.id
          )}"
        >
          ${
            isFavorite(article.id)
              ? "♥ В коллекции"
              : "♡ Сохранить"
          }
        </button>
      </div>

      <h2>${escapeHtml(article.title)}</h2>

      <p class="article-lead">
        ${escapeHtml(article.intro)}
      </p>

      <section class="detail-section">
        <h3>Как применять</h3>

        <ol>
          ${article.points
            .map(
              (item) => `
                <li>${escapeHtml(item)}</li>
              `
            )
            .join("")}
        </ol>
      </section>

      <section class="detail-section">
        <h3>Типичные ошибки</h3>

        <ul>
          ${article.mistakes
            .map(
              (item) => `
                <li>${escapeHtml(item)}</li>
              `
            )
            .join("")}
        </ul>
      </section>

      ${
        article.deviceDependency
          ? `
            <section class="detail-section">
              <h3>Зависит от устройства</h3>

              <div class="notice">
                ${escapeHtml(
                  article.deviceDependency
                )}
              </div>
            </section>
          `
          : ""
      }

      <section class="detail-section">
        <h3>Практика</h3>

        <div class="notice">
          ${escapeHtml(article.exercise)}
        </div>
      </section>
    </article>
  `;

  scrollToTop("auto");
}

/*
 * ============================================================================
 * Творческий кризис
 * ============================================================================
 */

function renderInspiration() {
  const selected = crisisRoutes.find(
    (route) =>
      route.id === state.selectedCrisisId
  );

  if (selected) {
    app.innerHTML = `
      <section class="screen">
        <button
          class="back-button"
          type="button"
          data-action="back-to-crisis-list"
        >
          ← Все состояния
        </button>

        <div class="screen-heading">
          <h2>
            ${escapeHtml(selected.title)}
          </h2>

          <p>
            ${escapeHtml(
              selected.description
            )}
          </p>
        </div>

        <div class="crisis-barrier">
          <span>Что мешает</span>
          <strong>
            ${escapeHtml(selected.barrier)}
          </strong>
        </div>

        <div class="profile-card crisis-route-card">
          ${selected.steps
            .map(
              (step, index) => `
                <div class="route-step">
                  <span class="route-number">
                    ${index + 1}
                  </span>

                  <p>
                    ${escapeHtml(step)}
                  </p>
                </div>
              `
            )
            .join("")}
        </div>

        <div class="motivation-card">
          ✦ ${escapeHtml(
            selected.reminder
          )}
        </div>

        <button
          class="primary-button"
          type="button"
          data-action="crisis-random-task"
        >
          Подобрать практическое задание
        </button>
      </section>
    `;

    scrollToTop("auto");
    return;
  }

  app.innerHTML = `
    <section class="screen">
      <button
        class="back-button"
        type="button"
        data-action="back-to-learn"
      >
        ← Назад к энциклопедии
      </button>

      <div class="screen-heading">
        <h2>Вернуть вдохновение</h2>

        <p>
          Выберите состояние, которое сейчас
          ближе всего. Здесь нет наказания
          за пропуски и требования получить
          хороший кадр.
        </p>
      </div>

      <div class="article-list">
        ${crisisRoutes
          .map(
            (route) => `
              <button
                class="article-card crisis-card"
                type="button"
                data-crisis="${escapeHtml(
                  route.id
                )}"
              >
                <h3>
                  ${escapeHtml(route.title)}
                </h3>

                <p>
                  ${escapeHtml(
                    route.description
                  )}
                </p>
              </button>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

/*
 * ============================================================================
 * Домашние альтернативы
 * ============================================================================
 */

function renderHomeAlternatives() {
  app.innerHTML = `
    <section class="screen">
      <button
        class="back-button"
        type="button"
        data-action="back-to-learn"
      >
        ← Назад к энциклопедии
      </button>

      <div class="screen-heading">
        <h2>Снять дома</h2>

        <p>
          Домашние варианты уличных сюжетов
          для плохой погоды, усталости
          или короткого свободного времени.
        </p>
      </div>

      <div class="article-list">
        ${homeAlternatives
          .map(homeAlternativeCard)
          .join("")}
      </div>
    </section>
  `;
}

function homeAlternativeCard(item) {
  return `
    <article class="article-card home-alternative-card">
      <div class="article-topline">
        <span class="article-category">
          Вместо: ${escapeHtml(
            item.outdoorIdea
          )}
        </span>
      </div>

      <h3>${escapeHtml(item.title)}</h3>

      <div class="tag-row">
        ${item.equipment
          .map(
            (piece) => `
              <span class="tag">
                ${escapeHtml(piece)}
              </span>
            `
          )
          .join("")}
      </div>

      <ol class="compact-list">
        ${item.steps
          .map(
            (step) => `
              <li>${escapeHtml(step)}</li>
            `
          )
          .join("")}
      </ol>

      <div class="notice">
        <strong>Что получится:</strong>
        ${escapeHtml(item.result)}
      </div>
    </article>
  `;
}

/*
 * ============================================================================
 * Проекты
 * ============================================================================
 */

function renderProjects() {
  app.innerHTML = `
    <section class="screen">
      <button
        class="back-button"
        type="button"
        data-action="back-to-learn"
      >
        ← Назад к энциклопедии
      </button>

      <div class="screen-heading">
        <h2>Фотопроекты</h2>

        <p>
          Повторяющаяся практика помогает
          увидеть изменения и собрать серию,
          а не только отдельный удачный кадр.
        </p>
      </div>

      <div class="section-header">
        <h3>На неделю</h3>

        <span class="date-label">
          ${weeklyProjects.length}
        </span>
      </div>

      <div class="article-list">
        ${weeklyProjects
          .map(projectCard)
          .join("")}
      </div>

      <div class="section-header">
        <h3>На месяц</h3>

        <span class="date-label">
          ${monthlyProjects.length}
        </span>
      </div>

      <div class="article-list">
        ${monthlyProjects
          .map(projectCard)
          .join("")}
      </div>
    </section>
  `;
}

function projectCard(project) {
  return `
    <article class="article-card project-card">
      <div class="article-topline">
        <span class="article-category">
          ${escapeHtml(project.duration)}
        </span>

        <span class="tag">
          ${escapeHtml(project.place)}
        </span>
      </div>

      <h3>${escapeHtml(project.title)}</h3>

      <p>
        ${escapeHtml(project.description)}
      </p>

      <div class="detail-section project-rules">
        <h4>Правила</h4>

        <ul>
          ${project.rules
            .map(
              (rule) => `
                <li>${escapeHtml(rule)}</li>
              `
            )
            .join("")}
        </ul>
      </div>

      <div class="notice">
        <strong>Результат:</strong>
        ${escapeHtml(project.result)}
      </div>
    </article>
  `;
}

/*
 * ============================================================================
 * Экран заданий
 * ============================================================================
 */

function filteredTasks() {
  return tasks.filter((task) => {
    if (task.status !== "ready") {
      return false;
    }

    const placeMatch =
      state.filterPlace === "все" ||
      task.place === state.filterPlace ||
      task.place === "где угодно";

    const periodMatch =
      state.filterPeriod === "все" ||
      task.period.includes(
        state.filterPeriod
      ) ||
      task.period === "любое время";

    const conditionMatch =
      state.filterCondition === "все" ||
      task.conditions.includes(
        state.filterCondition
      ) ||
      task.conditions.includes("любая");

    const levelMatch =
      state.filterLevel === "все" ||
      task.level === state.filterLevel ||
      task.level === "Любой";

    return (
      placeMatch &&
      periodMatch &&
      conditionMatch &&
      levelMatch &&
      taskMatchesSeason(task)
    );
  });
}

function renderShoot() {
  const task = currentTask();
  const filtered = filteredTasks();

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Снять</h2>

        <p>
          Используйте инструкцию как отправную
          точку, а не как обязательный экзамен.
        </p>
      </div>

      ${detailedTaskCard(task)}

      <div class="section-header">
        <h3>Фильтры</h3>
      </div>

      <div class="filter-grid">
        ${filterButton(
          "choose-place",
          optionLabel(
            placeOptions,
            state.filterPlace
          )
        )}

        ${filterButton(
          "choose-period",
          optionLabel(
            periodOptions,
            state.filterPeriod
          )
        )}

        ${filterButton(
          "choose-condition",
          optionLabel(
            conditionOptions,
            state.filterCondition
          )
        )}

        ${filterButton(
          "choose-task-level",
          optionLabel(
            taskLevelOptions,
            state.filterLevel
          )
        )}
      </div>

      <div class="section-header">
        <h3>Подходящие задания</h3>

        <span class="date-label">
          ${filtered.length}
        </span>
      </div>

      <div class="article-list">
        ${
          filtered.length
            ? filtered
                .map(taskListCard)
                .join("")
            : `
              <div class="empty-state">
                Для выбранных условий пока
                нет задания.<br />
                Измените один из фильтров.
              </div>
            `
        }
      </div>
    </section>
  `;
}

function filterButton(action, label) {
  return `
    <button
      class="filter-button"
      type="button"
      data-action="${escapeHtml(action)}"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

function detailedTaskCard(task) {
  const completed = isCompleted(task.id);

  return `
    <article class="task-card">
      <div class="task-topline">
        <span class="task-category">
          ${escapeHtml(task.category)}
        </span>

        ${
          completed
            ? `
              <span class="completed-label">
                ✓ Выполнено
              </span>
            `
            : ""
        }
      </div>

      <h2>${escapeHtml(task.title)}</h2>

      <p class="task-description">
        ${escapeHtml(
          task.shortDescription
        )}
      </p>

      <div class="task-compact-meta">
        <span>
          ${escapeHtml(task.place)}
        </span>

        <span>
          ${escapeHtml(task.level)}
        </span>

        <span>
          ${escapeHtml(
            task.seasons.includes("все")
              ? "любой сезон"
              : task.seasons.join(", ")
          )}
        </span>
      </div>

      ${renderTaskVisual(task.visual)}

      <div class="motivation-card">
        ✦ ${escapeHtml(task.motivation)}
      </div>

      <section class="detail-section">
        <h3>Цель</h3>

        <div class="notice">
          ${escapeHtml(task.goal)}
        </div>
      </section>

      <section class="detail-section">
        <h3>Что подготовить</h3>

        <ul>
          ${task.preparation
            .map(
              (item) => `
                <li>${escapeHtml(item)}</li>
              `
            )
            .join("")}
        </ul>
      </section>

      <section class="detail-section">
        <h3>Пошагово</h3>

        <ol>
          ${task.steps
            .map(
              (step) => `
                <li>${escapeHtml(step)}</li>
              `
            )
            .join("")}
        </ol>
      </section>

      ${
        task.versions.length
          ? `
            <section class="detail-section">
              <h3>Варианты</h3>

              ${task.versions
                .map(
                  (version) => `
                    <div class="version-card">
                      <h4>
                        ${escapeHtml(
                          version.title
                        )}
                      </h4>

                      <p>
                        ${escapeHtml(
                          version.instruction
                        )}
                      </p>

                      <p class="version-result">
                        <strong>
                          Что получится:
                        </strong>

                        ${escapeHtml(
                          version.expectedResult
                        )}
                      </p>
                    </div>
                  `
                )
                .join("")}
            </section>
          `
          : ""
      }

      <section class="detail-section">
        <h3>Типичные ошибки</h3>

        <ul>
          ${task.mistakes
            .map(
              (mistake) => `
                <li>
                  ${escapeHtml(mistake)}
                </li>
              `
            )
            .join("")}
        </ul>
      </section>

      <section class="detail-section">
        <h3>Если условия не подходят</h3>

        <div class="notice">
          ${escapeHtml(task.alternative)}
        </div>
      </section>

      <section class="detail-section">
        <h3>Безопасность и этика</h3>

        <p>${escapeHtml(task.safety)}</p>
      </section>

      <section class="detail-section">
        <h3>Усложнение</h3>

        <p>${escapeHtml(task.challenge)}</p>
      </section>

      <div class="task-actions">
        <button
          class="primary-button"
          type="button"
          data-action="random-task"
        >
          Другое задание
        </button>

        <button
          class="secondary-button"
          type="button"
          data-action="toggle-complete"
        >
          ${
            completed
              ? "Убрать отметку"
              : "Отметить выполненным"
          }
        </button>
      </div>
    </article>
  `;
}

function taskListCard(task) {
  return `
    <button
      class="article-card"
      type="button"
      data-task="${escapeHtml(task.id)}"
    >
      <div class="article-topline">
        <span class="article-category">
          ${escapeHtml(task.category)}
        </span>

        ${
          isCompleted(task.id)
            ? `
              <span class="completed-label">
                ✓ Выполнено
              </span>
            `
            : ""
        }
      </div>

      <h3>${escapeHtml(task.title)}</h3>

      <p>
        ${escapeHtml(
          task.shortDescription
        )}
      </p>

      <div class="tag-row">
        <span class="tag">
          ${escapeHtml(task.place)}
        </span>

        <span class="tag">
          ${escapeHtml(task.level)}
        </span>
      </div>
    </button>
  `;
}

function randomTask(mode = "normal") {
  let candidates = tasks.filter(
    (task) =>
      task.status === "ready" &&
      !isCompleted(task.id)
  );

  if (mode === "home") {
    candidates = candidates.filter(
      (task) =>
        task.place === "дом" ||
        task.place === "где угодно"
    );
  }

  if (mode === "crisis") {
    candidates = candidates.filter(
      (task) =>
        task.category ===
          "Творческий кризис" ||
        task.category === "Ограничение" ||
        task.level === "Любой"
    );
  }

  candidates = candidates.filter(
    (task) =>
      task.id !== currentTask()?.id
  );

  const record = getDailyRecord();

  let fresh = candidates.filter(
    (task) =>
      !record.viewed.includes(task.id) &&
      !record.skipped.includes(task.id)
  );

  if (!fresh.length) {
    fresh = candidates;
  }

  const selected = randomItem(fresh);

  if (!selected) {
    showToast(
      "Доступных заданий пока не осталось"
    );

    return;
  }

  openTask(selected.id);
}

function toggleTaskCompleted(taskId) {
  if (isCompleted(taskId)) {
    state.completedTasks =
      state.completedTasks.filter(
        (id) => id !== taskId
      );

    const record = getDailyRecord();

    record.completed =
      record.completed.filter(
        (id) => id !== taskId
      );

    saveState();
    renderShoot();

    showToast("Отметка удалена");
    return;
  }

  state.completedTasks = unique([
    ...state.completedTasks,
    taskId
  ]);

  const completedWeekDay =
    completeWeekDayForTask(taskId);

  const replaced =
    replaceCompletedInDailyPool(taskId);

  saveState();
  renderShoot();

  if (completedWeekDay && replaced) {
    showToast(
      "Задание выполнено. Неделя продолжится со следующим днём"
    );
  } else if (completedWeekDay) {
    showToast(
      "Задание отмечено в недельном плане"
    );
  } else if (replaced) {
    showToast(
      "Выполнено. На главной появилось новое задание"
    );
  } else {
    showToast(
      "Практика отмечена выполненной"
    );
  }
}
/*
 * ============================================================================
 * Моя неделя
 * ============================================================================
 */

function getWeekCompletedCount() {
  if (!state.weekPlan) {
    return 0;
  }

  return state.weekPlan.days.filter(
    (day) => day.status === "completed"
  ).length;
}

function getActiveWeekDay() {
  if (!state.weekPlan) {
    return null;
  }

  return (
    state.weekPlan.days.find(
      (day) => day.status === "active"
    ) ||
    state.weekPlan.days.find(
      (day) => day.status === "planned"
    ) ||
    null
  );
}

function getWeekDayIndex(dayId) {
  if (!state.weekPlan) {
    return -1;
  }

  return state.weekPlan.days.findIndex(
    (day) => day.id === dayId
  );
}

function taskForWeekDay(day) {
  if (!day) {
    return null;
  }

  return taskById(day.taskId);
}

function startWeekPlan(planId) {
  const plan = weekPlans.find(
    (item) => item.id === planId
  );

  if (!plan) {
    return;
  }

  const usedTaskIds = [];

  const days = plan.days.map(
    (day, index) => {
      let taskId = day.taskId;
      const preferred = taskById(taskId);

      /*
       * Если исходного задания нет, оно выполнено
       * или уже встречалось в этом плане —
       * подбираем подходящую замену.
       */
      if (
        !preferred ||
        isCompleted(taskId) ||
        usedTaskIds.includes(taskId)
      ) {
        const replacement = chooseWeekReplacement(
          day,
          usedTaskIds
        );

        if (replacement) {
          taskId = replacement.id;
        }
      }

      usedTaskIds.push(taskId);

      return {
        id: `week-day-${index + 1}`,
        title: day.title,
        taskId,
        fallbackCategory:
          day.fallbackCategory || "",
        colorHint: day.colorHint || "",
        status:
          index === 0
            ? "active"
            : "planned",
        originalTaskId: day.taskId,
        replacedAt: null
      };
    }
  );

  state.weekPlan = {
    planId: plan.id,
    startedAt: localDateKey(),
    startedTimestamp: Date.now(),
    days
  };

  saveState();
  renderWeek();

  showToast("План начат. Можно идти в своём темпе");
}

function chooseWeekReplacement(
  day,
  excludedIds = []
) {
  const excluded = new Set([
    ...excludedIds,
    ...state.completedTasks
  ]);

  let candidates = tasks.filter(
    (task) =>
      task.status === "ready" &&
      !excluded.has(task.id) &&
      taskMatchesSeason(task)
  );

  if (day.fallbackCategory) {
    const categoryCandidates = candidates.filter(
      (task) =>
        task.category === day.fallbackCategory
    );

    if (categoryCandidates.length) {
      candidates = categoryCandidates;
    }
  }

  const profileCandidates = candidates.filter(
    (task) => taskMatchesProfile(task)
  );

  if (profileCandidates.length) {
    candidates = profileCandidates;
  }

  const unseenCandidates = candidates.filter(
    (task) =>
      !state.recentTaskIds.includes(task.id)
  );

  if (unseenCandidates.length) {
    candidates = unseenCandidates;
  }

  return randomItem(candidates);
}

function replaceWeekDay(dayId) {
  if (!state.weekPlan) {
    return;
  }

  const index = getWeekDayIndex(dayId);

  if (index === -1) {
    return;
  }

  const day = state.weekPlan.days[index];

  if (day.status === "completed") {
    showToast(
      "Выполненное задание лучше оставить в истории недели"
    );
    return;
  }

  const otherTaskIds = state.weekPlan.days
    .filter((item) => item.id !== dayId)
    .map((item) => item.taskId);

  const replacement = chooseWeekReplacement(
    day,
    otherTaskIds
  );

  if (!replacement) {
    showToast(
      "Подходящей замены пока не найдено"
    );
    return;
  }

  day.taskId = replacement.id;
  day.status =
    index === getCurrentWeekIndex()
      ? "active"
      : "planned";
  day.replacedAt = Date.now();

  saveState();
  renderWeek();

  showToast("Задание недели заменено");
}

function getCurrentWeekIndex() {
  if (!state.weekPlan) {
    return -1;
  }

  const activeIndex = state.weekPlan.days.findIndex(
    (day) => day.status === "active"
  );

  if (activeIndex !== -1) {
    return activeIndex;
  }

  return state.weekPlan.days.findIndex(
    (day) => day.status === "planned"
  );
}

function skipWeekDay(dayId) {
  if (!state.weekPlan) {
    return;
  }

  const index = getWeekDayIndex(dayId);

  if (index === -1) {
    return;
  }

  const day = state.weekPlan.days[index];

  if (day.status === "completed") {
    showToast(
      "Выполненное задание нельзя пропустить"
    );
    return;
  }

  day.status = "skipped";

  activateNextWeekDay();

  saveState();
  renderWeek();

  showToast("День пропущен без штрафа");
}

function completeWeekDayForTask(taskId) {
  if (!state.weekPlan) {
    return false;
  }

  const day = state.weekPlan.days.find(
    (item) =>
      item.taskId === taskId &&
      ["active", "planned"].includes(item.status)
  );

  if (!day) {
    return false;
  }

  day.status = "completed";

  activateNextWeekDay();

  saveState();

  return true;
}

function activateNextWeekDay() {
  if (!state.weekPlan) {
    return;
  }

  const activeDays = state.weekPlan.days.filter(
    (day) => day.status === "active"
  );

  activeDays.forEach((day) => {
    day.status = "planned";
  });

  const next = state.weekPlan.days.find(
    (day) => day.status === "planned"
  );

  if (next) {
    next.status = "active";
  }
}

function reopenWeekDay(dayId) {
  if (!state.weekPlan) {
    return;
  }

  const day = state.weekPlan.days.find(
    (item) => item.id === dayId
  );

  if (!day) {
    return;
  }

  const selectedTask = taskForWeekDay(day);

  if (!selectedTask) {
    showToast("Задание не найдено");
    return;
  }

  openTask(selectedTask.id);
}

function finishWeekPlan() {
  if (!state.weekPlan) {
    return;
  }

  const completed = getWeekCompletedCount();

  const confirmed = window.confirm(
    `Завершить план? Выполнено: ${completed} из 7.`
  );

  if (!confirmed) {
    return;
  }

  state.weekPlan = null;
  saveState();
  renderWeek();

  showToast("План завершён. Практика остаётся с вами");
}

function renderWeek() {
  state.screen = "week";
  saveState();
  updateNavigation();

  const activePlan = state.weekPlan;

  if (!activePlan) {
    renderWeekPlanLibrary();
    scrollToTop("auto");
    return;
  }

  const plan = weekPlans.find(
    (item) => item.id === activePlan.planId
  );

  const completedCount = getWeekCompletedCount();
  const skippedCount = activePlan.days.filter(
    (day) => day.status === "skipped"
  ).length;
  const activeDay = getActiveWeekDay();

  app.innerHTML = `
    <section class="screen week-screen">
      <button
        class="back-button"
        type="button"
        data-action="back-from-week"
      >
        ← Назад
      </button>

      <div class="week-heading">
        <span class="week-plan-icon">
          ${escapeHtml(plan?.icon || "◌")}
        </span>

        <div>
          <span class="date-label">
            МОЯ НЕДЕЛЯ
          </span>

          <h2>
            ${escapeHtml(
              plan?.title || "План практики"
            )}
          </h2>

          <p>
            ${escapeHtml(
              plan?.subtitle || ""
            )}
          </p>
        </div>
      </div>

      <div class="week-progress-card">
        <div class="week-progress-topline">
          <strong>
            ${completedCount} из 7 выполнено
          </strong>

          <span>
            ${
              skippedCount
                ? `${skippedCount} без отметки`
                : "без обязательной серии"
            }
          </span>
        </div>

        <div
          class="week-progress-bar"
          aria-label="Прогресс недели"
        >
          <span
            style="width: ${
              (completedCount / 7) * 100
            }%"
          ></span>
        </div>
      </div>

      ${
        activeDay
          ? renderCurrentWeekCard(activeDay)
          : `
            <section class="week-finished-card">
              <span class="week-finished-icon">✓</span>

              <h3>План завершён</h3>

              <p>
                Вы прошли ${completedCount} из 7 заданий.
                Этого достаточно, чтобы увидеть неделю
                как небольшую личную серию.
              </p>

              <button
                class="primary-button"
                type="button"
                data-action="finish-week-plan"
              >
                Завершить и выбрать новый
              </button>
            </section>
          `
      }

      <div class="section-header">
        <h3>Все дни</h3>

        <span class="date-label">
          7 дней
        </span>
      </div>

      <div class="week-days-list">
        ${activePlan.days
          .map(
            (day, index) =>
              renderWeekDayRow(day, index)
          )
          .join("")}
      </div>

      <button
        class="week-finish-button"
        type="button"
        data-action="finish-week-plan"
      >
        Завершить этот план
      </button>
    </section>
  `;

  scrollToTop("auto");
}

function renderWeekPlanLibrary() {
  app.innerHTML = `
    <section class="screen week-screen">
      <button
        class="back-button"
        type="button"
        data-action="back-from-week"
      >
        ← Назад
      </button>

      <div class="screen-heading">
        <span class="date-label">
          МОЯ НЕДЕЛЯ
        </span>

        <h2>Выберите свой темп</h2>

        <p>
          План — это не обязательная серия.
          Можно пропустить день, заменить задание
          или завершить неделю частично.
        </p>
      </div>

      <div class="week-plan-list">
        ${weekPlans
          .map(
            (plan) => `
              <article class="week-plan-card">
                <div class="week-plan-card-top">
                  <span class="week-plan-icon">
                    ${escapeHtml(plan.icon)}
                  </span>

                  <span class="tag">
                    ${escapeHtml(plan.level)}
                  </span>
                </div>

                <h3>
                  ${escapeHtml(plan.title)}
                </h3>

                <p>
                  ${escapeHtml(plan.subtitle)}
                </p>

                <small>
                  ${escapeHtml(plan.description)}
                </small>

                <button
                  class="primary-button"
                  type="button"
                  data-start-week-plan="${escapeHtml(
                    plan.id
                  )}"
                >
                  Начать план
                </button>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderCurrentWeekCard(day) {
  const task = taskForWeekDay(day);

  if (!task) {
    return `
      <div class="empty-state">
        Это задание недоступно.<br />
        Замените его в списке недели.
      </div>
    `;
  }

  const index = getWeekDayIndex(day.id);

  return `
    <section class="week-current-card">
      <div class="week-current-topline">
        <span>
          День ${index + 1} из 7
        </span>

        ${
          day.colorHint
            ? `
              <span class="week-color-hint">
                Ищите: ${escapeHtml(
                  day.colorHint
                )}
              </span>
            `
            : ""
        }
      </div>

      <h3>${escapeHtml(day.title)}</h3>

      <h2>${escapeHtml(task.title)}</h2>

      <p>
        ${escapeHtml(task.shortDescription)}
      </p>

      <div class="week-current-meta">
        <span>${escapeHtml(task.category)}</span>
        <span>${escapeHtml(task.place)}</span>
      </div>

      <div class="week-current-actions">
        <button
          class="primary-button"
          type="button"
          data-week-open="${escapeHtml(day.id)}"
        >
          Открыть задание
        </button>

        <button
          class="secondary-button"
          type="button"
          data-week-replace="${escapeHtml(day.id)}"
        >
          Заменить
        </button>

        <button
          class="ghost-button"
          type="button"
          data-week-skip="${escapeHtml(day.id)}"
        >
          Пропустить
        </button>
      </div>
    </section>
  `;
}

function renderWeekDayRow(day, index) {
  const task = taskForWeekDay(day);

  const statusLabels = {
    active: "Сейчас",
    planned: "Запланировано",
    completed: "Выполнено",
    skipped: "Без отметки"
  };

  return `
    <article
      class="week-day-row week-day-${escapeHtml(
        day.status
      )}"
    >
      <div class="week-day-number">
        ${index + 1}
      </div>

      <div class="week-day-copy">
        <span class="week-day-status">
          ${escapeHtml(
            statusLabels[day.status] ||
              "Запланировано"
          )}
        </span>

        <strong>
          ${escapeHtml(day.title)}
        </strong>

        <small>
          ${
            task
              ? escapeHtml(task.title)
              : "Задание недоступно"
          }
        </small>
      </div>

      <div class="week-day-actions">
        ${
          day.status !== "skipped"
            ? `
              <button
                class="week-day-open"
                type="button"
                data-week-open="${escapeHtml(
                  day.id
                )}"
                aria-label="Открыть задание"
              >
                →
              </button>
            `
            : ""
        }

        ${
          ["active", "planned"].includes(
            day.status
          )
            ? `
              <button
                class="week-day-more"
                type="button"
                data-week-menu="${escapeHtml(
                  day.id
                )}"
                aria-label="Действия с заданием"
              >
                ⋯
              </button>
            `
            : ""
        }
      </div>
    </article>
  `;
}
/*
 * ============================================================================
 * Коллекция
 * ============================================================================
 */

function toggleFavorite(articleId) {
  if (isFavorite(articleId)) {
    state.favorites =
      state.favorites.filter(
        (id) => id !== articleId
      );

    showToast(
      "Удалено из коллекции"
    );
  } else {
    state.favorites = unique([
      ...state.favorites,
      articleId
    ]);

    showToast("Материал сохранён");
  }

  saveState();
  renderArticle(articleId);
}

function renderCollection() {
  const favoriteArticles =
    articles.filter((article) =>
      state.favorites.includes(
        article.id
      )
    );

  const completed = tasks.filter(
    (task) =>
      state.completedTasks.includes(
        task.id
      )
  );

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Коллекция</h2>

        <p>
          Сохранённые знания и выполненные
          практические задания.
        </p>
      </div>

      <div class="section-header">
        <h3>Материалы</h3>

        <span class="date-label">
          ${favoriteArticles.length}
        </span>
      </div>

      ${
        favoriteArticles.length
          ? `
            <div class="article-list">
              ${favoriteArticles
                .map(articleCard)
                .join("")}
            </div>
          `
          : `
            <div class="empty-state">
              Сохранённые материалы
              появятся здесь.
            </div>
          `
      }

      <div class="section-header">
        <h3>Выполненные задания</h3>

        <span class="date-label">
          ${completed.length}
        </span>
      </div>

      ${
        completed.length
          ? `
            <div class="article-list">
              ${completed
                .map(taskListCard)
                .join("")}
            </div>
          `
          : `
            <div class="empty-state">
              Выполненные практики
              появятся здесь.
            </div>
          `
      }

      <div class="section-header">
        <h3>Управление коллекцией</h3>
      </div>

      <div class="danger-zone">
        <button
          class="danger-button"
          type="button"
          data-action="clear-completed"
          ${
            completed.length
              ? ""
              : "disabled"
          }
        >
          Очистить выполненные задания
        </button>

        <button
          class="danger-button"
          type="button"
          data-action="clear-favorites"
          ${
            favoriteArticles.length
              ? ""
              : "disabled"
          }
        >
          Очистить сохранённые материалы
        </button>
      </div>
    </section>
  `;
}

/*
 * ============================================================================
 * Профиль
 * ============================================================================
 */

function renderProfile() {
  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Профиль</h2>

        <p>
          Настройте ежедневную подборку
          и внешний вид приложения.
        </p>
      </div>

      <div class="profile-card">
        ${profileChoiceRow(
          "Уровень и цель",
          "Влияет на ежедневные рекомендации",
          "choose-profile-level",
          state.level
        )}

        ${profileChoiceRow(
          "Размер текста",
          "Размер инструкций и описаний",
          "choose-font-size",
          optionLabel(
            fontSizes,
            state.fontSize
          )
        )}

        ${profileChoiceRow(
          "Сезон",
          "Влияет на подборку заданий",
          "choose-season",
          state.season === "auto"
            ? `Авто: ${seasonLabel()}`
            : seasonLabel()
        )}

        <div class="profile-row">
          <div class="profile-copy">
            <strong>
              Заданий на сегодня
            </strong>

            <small>
              Количество карточек в карусели
            </small>
          </div>

          <div class="count-selector">
            ${[1, 2, 3, 4, 5]
              .map(
                (count) => `
                  <button
                    class="count-button ${
                      state.dailyCount ===
                      count
                        ? "active"
                        : ""
                    }"
                    type="button"
                    data-daily-count="${count}"
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

            <small>
              Тёплый интерфейс для вечера
            </small>
          </div>

          <button
            class="toggle ${
              state.theme === "dark"
                ? "active"
                : ""
            }"
            type="button"
            data-action="toggle-theme"
            aria-label="Переключить тему"
          ></button>
        </div>

        <div class="profile-row">
          <div class="profile-copy">
            <strong>
              Выполнено заданий
            </strong>

            <small>
              Без обязательной непрерывной серии
            </small>
          </div>

          <strong>
            ${state.completedTasks.length}
          </strong>
        </div>

        <div class="profile-row">
          <div class="profile-copy">
            <strong>
              Просмотрено сегодня
            </strong>

            <small>
              Используется для защиты от повторов
            </small>
          </div>

          <strong>
            ${getDailyRecord().viewed.length}
          </strong>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-icon">i</div>

        <div>
          <h3>Как работает карусель</h3>

          <p>
            Заменённые, просмотренные
            и выполненные задания не должны
            сразу появляться снова.
            Когда библиотека заканчивается,
            старые задания постепенно
            возвращаются в подборку.
          </p>
        </div>
      </div>
      <div class="section-header">
        <h3>Моя неделя</h3>
      </div>

      <div class="profile-card week-profile-card">
        <div class="profile-row">
          <div class="profile-copy">
            <strong>
              ${
                state.weekPlan
                  ? "Активный план"
                  : "Готовые планы"
              }
            </strong>

            <small>
              ${
                state.weekPlan
                  ? `${getWeekCompletedCount()} из 7 дней выполнено`
                  : "Свет, композиция, фактуры, ракурсы и вдохновение"
              }
            </small>
          </div>

          <button
            class="setting-button"
            type="button"
            data-action="open-week"
          >
            ${
              state.weekPlan
                ? "Открыть"
                : "Выбрать"
            }
          </button>
        </div>
      </div>
      <div class="section-header">
        <h3>Данные приложения</h3>
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
          data-action="reset-today"
        >
          Сбросить сегодняшнюю подборку
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

function profileChoiceRow(
  title,
  subtitle,
  action,
  value
) {
  return `
    <div class="profile-row">
      <div class="profile-copy">
        <strong>
          ${escapeHtml(title)}
        </strong>

        <small>
          ${escapeHtml(subtitle)}
        </small>
      </div>

      <button
        class="setting-button"
        type="button"
        data-action="${escapeHtml(action)}"
      >
        ${escapeHtml(value)}
      </button>
    </div>
  `;
}

/*
 * ============================================================================
 * Нижнее окно выбора
 * ============================================================================
 */

function openChoiceSheet({
  title,
  options,
  currentValue,
  onSelect
}) {
  sheetTitle.textContent = title;

  sheetContent.innerHTML = options
    .map(
      (option) => `
        <button
          class="sheet-option ${
            option.value === currentValue
              ? "active"
              : ""
          }"
          type="button"
          data-sheet-value="${escapeHtml(
            option.value
          )}"
        >
          <span>
            <strong>
              ${escapeHtml(option.label)}
            </strong>

            ${
              option.description
                ? `
                  <small>
                    ${escapeHtml(
                      option.description
                    )}
                  </small>
                `
                : ""
            }
          </span>

          <span class="sheet-check">
            ✓
          </span>
        </button>
      `
    )
    .join("");

  sheetBackdrop.classList.remove("hidden");
  sheetBackdrop.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "sheet-open"
  );

  sheetContent.onclick = (event) => {
    const option = event.target.closest(
      "[data-sheet-value]"
    );

    if (!option) {
      return;
    }

    onSelect(option.dataset.sheetValue);
    closeChoiceSheet();
  };
}

function closeChoiceSheet() {
  sheetBackdrop.classList.add("hidden");

  sheetBackdrop.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "sheet-open"
  );

  sheetContent.onclick = null;
}

sheetClose?.addEventListener(
  "click",
  closeChoiceSheet
);

sheetBackdrop?.addEventListener(
  "click",
  (event) => {
    if (event.target === sheetBackdrop) {
      closeChoiceSheet();
    }
  }
);

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      !sheetBackdrop.classList.contains(
        "hidden"
      )
    ) {
      closeChoiceSheet();
    }
  }
);

/*
 * ============================================================================
 * Очистка данных
 * ============================================================================
 */

function clearCompletedTasks() {
  if (!state.completedTasks.length) {
    showToast(
      "Список выполненных заданий уже пуст"
    );

    return;
  }

  const confirmed = window.confirm(
    "Удалить все отметки о выполненных заданиях?"
  );

  if (!confirmed) {
    return;
  }

  state.completedTasks = [];

  Object.values(state.dailyState).forEach(
    (record) => {
      if (record && Array.isArray(record.completed)) {
        record.completed = [];
      }
    }
  );

  saveState();
  render();

  showToast(
    "Отметки о выполнении удалены"
  );
}

function clearFavorites() {
  if (!state.favorites.length) {
    showToast(
      "Сохранённых материалов пока нет"
    );

    return;
  }

  const confirmed = window.confirm(
    "Удалить все сохранённые материалы?"
  );

  if (!confirmed) {
    return;
  }

  state.favorites = [];

  saveState();
  render();

  showToast(
    "Сохранённые материалы очищены"
  );
}

function resetToday() {
  const confirmed = window.confirm(
    "Создать новый набор заданий на сегодня?"
  );

  if (!confirmed) {
    return;
  }

  delete state.dailyState[localDateKey()];
  saveState();

  ensureDailyPool();
  render();

  showToast(
    "Сегодняшняя подборка создана заново"
  );
}

/*
 * ============================================================================
 * Обработчики
 * ============================================================================
 */

document.addEventListener(
  "click",
  (event) => {
    const navigationButton =
      event.target.closest("[data-screen]");

    if (navigationButton) {
      setScreen(
        navigationButton.dataset.screen
      );
      return;
    }

    const openDailyButton =
      event.target.closest(
        "[data-open-daily-task]"
      );

    if (openDailyButton) {
      openTask(
        openDailyButton.dataset
          .openDailyTask
      );
      return;
    }

    const replaceDailyButton =
      event.target.closest(
        "[data-replace-daily-index]"
      );

    if (replaceDailyButton) {
      replaceDailyTaskAt(
        Number(
          replaceDailyButton.dataset
            .replaceDailyIndex
        )
      );
      return;
    }

    const dailyDot = event.target.closest(
      "[data-daily-index]"
    );

    if (dailyDot) {
      setDailyIndex(
        Number(
          dailyDot.dataset.dailyIndex
        )
      );
      return;
    }

    const taskButton =
      event.target.closest("[data-task]");

    if (taskButton) {
      openTask(taskButton.dataset.task);
      return;
    }

    const articleButton =
      event.target.closest(
        "[data-article]"
      );

    if (articleButton) {
      renderArticle(
        articleButton.dataset.article
      );
      return;
    }

    const crisisButton =
      event.target.closest(
        "[data-crisis]"
      );

    if (crisisButton) {
      state.selectedCrisisId =
        crisisButton.dataset.crisis;

      saveState();
      renderInspiration();
      return;
    }

    const categoryButton =
      event.target.closest(
        "[data-category]"
      );

    if (categoryButton) {
      state.learnCategory =
        categoryButton.dataset.category;

      saveState();
      renderLearn();
      return;
    }

    const catalogButton =
      event.target.closest(
        "[data-catalog-title]"
      );

    if (catalogButton) {
      const title =
        catalogButton.dataset.catalogTitle;

      /*
       * Каталожные группы не всегда совпадают
       * с точным названием категории.
       */
      if (title === "Основы") {
        state.learnCategory = "Основы";
      } else if (title === "Композиция") {
        state.learnCategory =
          "Композиция";
      } else if (title === "Свет") {
        state.learnCategory = "Свет";
      } else if (title === "Жанры") {
        state.learnCategory = "Все";
        state.learnQuery =
          "портрет макро";
      } else if (
        title === "Снимать иначе"
      ) {
        state.learnCategory =
          "Снимать иначе";
      }

      saveState();
      renderLearn();
      return;
    }

    const countButton =
      event.target.closest(
        "[data-daily-count]"
      );

    if (countButton) {
      state.dailyCount = Math.min(
        5,
        Math.max(
          1,
          Number(
            countButton.dataset.dailyCount
          )
        )
      );

      ensureDailyPool();
      saveState();
      renderProfile();

      showToast(
        "Количество карточек изменено"
      );

      return;
    }
    const weekPlanButton = event.target.closest(
      "[data-start-week-plan]"
    );

    if (weekPlanButton) {
      startWeekPlan(
        weekPlanButton.dataset.startWeekPlan
      );
      return;
    }

    const weekOpenButton = event.target.closest(
      "[data-week-open]"
    );

    if (weekOpenButton) {
      reopenWeekDay(
        weekOpenButton.dataset.weekOpen
      );
      return;
    }

    const weekReplaceButton = event.target.closest(
      "[data-week-replace]"
    );

    if (weekReplaceButton) {
      replaceWeekDay(
        weekReplaceButton.dataset.weekReplace
      );
      return;
    }

    const weekSkipButton = event.target.closest(
      "[data-week-skip]"
    );

    if (weekSkipButton) {
      skipWeekDay(
        weekSkipButton.dataset.weekSkip
      );
      return;
    }

    const weekMenuButton = event.target.closest(
      "[data-week-menu]"
    );

    if (weekMenuButton) {
      const dayId =
        weekMenuButton.dataset.weekMenu;

      openChoiceSheet({
        title: "Действия с заданием",
        currentValue: "",
        options: [
          {
            value: "open",
            label: "Открыть задание",
            description:
              "Посмотреть полную инструкцию"
          },
          {
            value: "replace",
            label: "Заменить",
            description:
              "Подобрать другую практику"
          },
          {
            value: "skip",
            label: "Пропустить",
            description:
              "Оставить день без отметки"
          }
        ],
        onSelect(value) {
          if (value === "open") {
            reopenWeekDay(dayId);
          }

          if (value === "replace") {
            replaceWeekDay(dayId);
          }

          if (value === "skip") {
            skipWeekDay(dayId);
          }
        }
      });

      return;
    }
    const actionButton =
      event.target.closest(
        "[data-action]"
      );

    if (!actionButton) {
      return;
    }

    const action =
      actionButton.dataset.action;

    if (action === "daily-prev") {
      previousDailyTask();
    }

    if (action === "daily-next") {
      nextDailyTask();
    }

    if (action === "refresh-daily-all") {
      replaceAllDailyTasks();
    }
    if (action === "open-week") {
      renderWeek();
    }

    if (action === "back-from-week") {
      state.screen = "today";
      saveState();
      render();
      scrollToTop();
    }

    if (action === "finish-week-plan") {
      finishWeekPlan();
    }
    if (action === "open-all-tasks") {
      setScreen("shoot");
    }

    if (action === "random-task") {
      randomTask("normal");
    }

    if (action === "home-task") {
      randomTask("home");
    }

    if (action === "crisis-random-task") {
      randomTask("crisis");
    }

    if (action === "open-learn") {
      state.screen = "learn";
      state.learnMode = "catalog";
      state.learnCategory = "Все";
      state.learnQuery = "";

      saveState();
      render();
      scrollToTop();
    }

    if (action === "open-inspiration") {
      state.screen = "learn";
      state.learnMode = "inspiration";
      state.selectedCrisisId = null;

      saveState();
      render();
      scrollToTop();
    }

    if (
      action ===
      "open-home-alternatives"
    ) {
      state.screen = "learn";
      state.learnMode = "home";

      saveState();
      render();
      scrollToTop();
    }

    if (action === "open-projects") {
      state.screen = "learn";
      state.learnMode = "projects";

      saveState();
      render();
      scrollToTop();
    }

    if (action === "back-to-learn") {
      state.screen = "learn";
      state.learnMode = "catalog";
      state.selectedCrisisId = null;

      saveState();
      render();
      scrollToTop();
    }

    if (
      action === "back-to-crisis-list"
    ) {
      state.selectedCrisisId = null;

      saveState();
      renderInspiration();
      scrollToTop();
    }

    if (action === "toggle-favorite") {
      toggleFavorite(
        actionButton.dataset.id
      );
    }

    if (action === "toggle-complete") {
      toggleTaskCompleted(
        currentTask().id
      );
    }

    if (action === "clear-completed") {
      clearCompletedTasks();
    }

    if (action === "clear-favorites") {
      clearFavorites();
    }

    if (action === "reset-today") {
      resetToday();
    }

    if (action === "toggle-theme") {
      state.theme =
        state.theme === "dark"
          ? "light"
          : "dark";

      saveState();
      applyPreferences();
      renderProfile();
    }

    if (
      action === "choose-profile-level"
    ) {
      openChoiceSheet({
        title: "Уровень и цель",
        options: levels,
        currentValue: state.level,
        onSelect(value) {
          state.level = value;

          /*
           * Новый профиль должен сразу
           * изменить ежедневную подборку.
           */
          delete state.dailyState[
            localDateKey()
          ];

          saveState();
          ensureDailyPool();
          renderProfile();

          showToast(
            "Рекомендации обновлены"
          );
        }
      });
    }

    if (action === "choose-font-size") {
      openChoiceSheet({
        title: "Размер текста",
        options: fontSizes,
        currentValue: state.fontSize,
        onSelect(value) {
          state.fontSize = value;

          saveState();
          applyPreferences();
          renderProfile();

          showToast(
            "Размер текста изменён"
          );
        }
      });
    }

    if (action === "choose-season") {
      openChoiceSheet({
        title: "Сезон",
        options: seasonOptions,
        currentValue: state.season,
        onSelect(value) {
          state.season = value;

          delete state.dailyState[
            localDateKey()
          ];

          saveState();
          ensureDailyPool();
          renderProfile();

          showToast(
            "Сезонные рекомендации обновлены"
          );
        }
      });
    }

    if (action === "choose-place") {
      openChoiceSheet({
        title: "Где снимать",
        options: placeOptions,
        currentValue:
          state.filterPlace,
        onSelect(value) {
          state.filterPlace = value;

          saveState();
          renderShoot();
        }
      });
    }

    if (action === "choose-period") {
      openChoiceSheet({
        title: "Время суток",
        options: periodOptions,
        currentValue:
          state.filterPeriod,
        onSelect(value) {
          state.filterPeriod = value;

          saveState();
          renderShoot();
        }
      });
    }

    if (
      action === "choose-condition"
    ) {
      openChoiceSheet({
        title: "Условия",
        options: conditionOptions,
        currentValue:
          state.filterCondition,
        onSelect(value) {
          state.filterCondition = value;

          saveState();
          renderShoot();
        }
      });
    }

    if (
      action === "choose-task-level"
    ) {
      openChoiceSheet({
        title: "Сложность",
        options: taskLevelOptions,
        currentValue:
          state.filterLevel,
        onSelect(value) {
          state.filterLevel = value;

          saveState();
          renderShoot();
        }
      });
    }
  }
);

themeToggle?.addEventListener(
  "click",
  () => {
    state.theme =
      state.theme === "dark"
        ? "light"
        : "dark";

    saveState();
    applyPreferences();
    render();
  }
);

/*
 * ============================================================================
 * Установка PWA
 * ============================================================================
 */

window.addEventListener(
  "beforeinstallprompt",
  (event) => {
    event.preventDefault();

    deferredInstallPrompt = event;

    installButton?.classList.remove(
      "hidden"
    );
  }
);

installButton?.addEventListener(
  "click",
  async () => {
    if (!deferredInstallPrompt) {
      showToast(
        "Откройте меню браузера и выберите установку приложения"
      );

      return;
    }

    deferredInstallPrompt.prompt();

    const result =
      await deferredInstallPrompt.userChoice;

    if (
      result.outcome === "accepted"
    ) {
      showToast(
        "Приложение устанавливается"
      );
    }

    deferredInstallPrompt = null;

    installButton.classList.add(
      "hidden"
    );
  }
);

window.addEventListener(
  "appinstalled",
  () => {
    deferredInstallPrompt = null;

    installButton?.classList.add(
      "hidden"
    );

    showToast(
      "«Вне кадра» установлено"
    );
  }
);

/*
 * ============================================================================
 * Service Worker
 * ============================================================================
 */

if ("serviceWorker" in navigator) {
  window.addEventListener(
    "load",
    async () => {
      try {
        const registration =
          await navigator.serviceWorker.register(
            "./sw.js"
          );

        registration.update();
      } catch (error) {
        console.warn(
          "Не удалось зарегистрировать Service Worker:",
          error
        );
      }
    }
  );
}

/*
 * ============================================================================
 * Запуск
 * ============================================================================
 */

applyPreferences();
ensureDailyPool();
render();
