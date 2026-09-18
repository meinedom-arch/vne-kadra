const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("#themeToggle");

const STORAGE_KEY = "vne-kadra-state";

const articles = [
  {
    id: "ground-angle",
    title: "Съёмка от самой земли",
    category: "Ракурсы",
    description:
      "Низкая точка съёмки превращает обычный объект в масштабную сцену и добавляет кадру напряжение.",
    tags: ["улица", "архитектура", "любой сезон"],
    level: "Начинающий",
    full: {
      intro:
        "Попробуйте опустить камеру значительно ниже уровня глаз. Даже знакомое место после этого начинает выглядеть иначе.",
      when:
        "Приём особенно хорошо работает с дорогами, травой, лужами, лестницами, зданиями и людьми в движении.",
      steps: [
        "Протрите объектив и выберите основной или широкоугольный модуль.",
        "Опустите смартфон почти к земле или переверните его камерой вниз.",
        "Найдите выразительный объект на переднем плане.",
        "Сделайте один кадр с обычной экспозицией и несколько с немного затемнённой.",
        "Проверьте, не попал ли в кадр случайный мусор или край корпуса."
      ],
      mistakes: [
        "Слишком много пустого неба.",
        "Отсутствие объекта на переднем плане.",
        "Случайный наклон горизонта.",
        "Попытка сделать один кадр вместо небольшой серии."
      ],
      exercise:
        "Снимите одно и то же место с высоты глаз, с уровня груди и почти от земли. Сравните не качество, а ощущение масштаба."
    }
  },
  {
    id: "light-in-shadow",
    title: "Свет внутри тени",
    category: "Свет",
    description:
      "Ищите не прямой солнечный свет, а небольшой участок, куда он попадает отражённым от стены, снега или окна.",
    tags: ["свет", "дом", "улица"],
    level: "Начинающий",
    full: {
      intro:
        "Тень не всегда означает отсутствие света. В ней часто есть мягкое отражённое освещение, которое выглядит спокойнее и объёмнее прямого солнца.",
      when:
        "Используйте этот приём для портретов, предметной съёмки, растений и деталей архитектуры.",
      steps: [
        "Найдите яркую стену, окно, снег или другую отражающую поверхность.",
        "Поместите объект в тень рядом с этой поверхностью.",
        "Наведите фокус на объект и немного уменьшите экспозицию.",
        "Сделайте кадр без вспышки.",
        "Затем измените положение объекта относительно отражателя."
      ],
      mistakes: [
        "Фронтальная вспышка.",
        "Смешение нескольких цветовых источников.",
        "Съёмка только одного положения.",
        "Слишком яркий фон."
      ],
      exercise:
        "Найдите дома три разных источника отражённого света и снимите один предмет в каждом из них."
    }
  },
  {
    id: "black-white",
    title: "Чёрно-белое мышление",
    category: "Цвет",
    description:
      "Используйте монохром не как фильтр, а как способ увидеть свет, форму, ритм и контраст.",
    tags: ["монохром", "улица", "архив"],
    level: "Начинающий",
    full: {
      intro:
        "Чёрно-белый кадр убирает цветовую информацию и оставляет отношения между светом, тенью, фактурой и формой.",
      when:
        "Приём особенно полезен в пасмурную погоду, при жёстком боковом свете, в архитектуре и уличной фотографии.",
      steps: [
        "Включите монохромный предпросмотр, если смартфон это позволяет.",
        "Ищите не цвет, а разницу между светлым и тёмным.",
        "Проверяйте фон: он должен поддерживать форму объекта.",
        "Снимите несколько вариантов с разной экспозицией.",
        "Не добавляйте чрезмерный контраст во время обработки."
      ],
      mistakes: [
        "Превращение любого кадра в чёрно-белый без причины.",
        "Слишком тёмные тени.",
        "Отсутствие главного светового акцента.",
        "Оценка только по эффектности фильтра."
      ],
      exercise:
        "Снимите пять кадров, где цвет не нужен для понимания сюжета."
    }
  },
  {
    id: "reflection",
    title: "Отражение, которого не ждали",
    category: "Необычные приёмы",
    description:
      "Ищите отражения не только в воде: витрины, металлические поверхности, экраны, стекло и даже тёмная одежда.",
    tags: ["отражения", "город", "эксперимент"],
    level: "Продолжающий",
    full: {
      intro:
        "Отражение может стать вторым пространством в кадре. Оно добавляет слои, неоднозначность и визуальную игру.",
      when:
        "Работает в городе, дома, в транспорте, возле витрин и после дождя.",
      steps: [
        "Найдите отражающую поверхность.",
        "Подойдите к ней под разными углами.",
        "Попробуйте совместить отражение с реальным объектом.",
        "Сделайте отдельный кадр только отражения.",
        "Затем намеренно нарушьте симметрию."
      ],
      mistakes: [
        "Съёмка строго перпендикулярно поверхности.",
        "Слишком много деталей в отражении.",
        "Случайное отражение самого фотографа.",
        "Отсутствие точки внимания."
      ],
      exercise:
        "Создайте серию из трёх кадров, в которых невозможно сразу понять, где заканчивается реальность."
    }
  },
  {
    id: "motion-blur",
    title: "Контролируемый смаз",
    category: "Движение",
    description:
      "Сделайте размытие не ошибкой, а способом показать направление, скорость или состояние.",
    tags: ["движение", "ночь", "эксперимент"],
    level: "Продолжающий",
    full: {
      intro:
        "Размытие может передавать движение лучше, чем идеально резкий кадр. Важно контролировать его направление и масштаб.",
      when:
        "Попробуйте технику с транспортом, водой, людьми, огнями и деревьями на ветру.",
      steps: [
        "Выберите движущийся объект или сюжет с яркими линиями.",
        "Если есть ручной режим, увеличьте выдержку.",
        "Зафиксируйте смартфон или, наоборот, плавно проведите им вслед за объектом.",
        "Сделайте серию из нескольких кадров.",
        "Оставьте только те варианты, где размытие поддерживает композицию."
      ],
      mistakes: [
        "Случайное дрожание во всех направлениях.",
        "Отсутствие резкого элемента.",
        "Слишком длинная выдержка без выразительного движения.",
        "Оценка кадра до просмотра всей серии."
      ],
      exercise:
        "Сделайте десять кадров движущегося объекта, не пытаясь получить резкость во всех вариантах."
    }
  },
  {
    id: "one-place",
    title: "Одно место — семь взглядов",
    category: "Творческий кризис",
    description:
      "Знакомое место не становится скучным, если менять способ наблюдения.",
    tags: ["кризис", "серия", "практика"],
    level: "Любой",
    full: {
      intro:
        "Ощущение, что всё уже снято, часто означает, что мы повторяем не место, а собственный способ смотреть на него.",
      when:
        "Используйте практику, когда не хочется выходить далеко или кажется, что вокруг нет интересных сюжетов.",
      steps: [
        "Выберите место, которое кажется совершенно обычным.",
        "Снимите его с высоты глаз.",
        "Найдите один фрагмент вместо общего вида.",
        "Снимите только тени.",
        "Используйте отражение.",
        "Снимите место с самой низкой точки.",
        "Создайте кадр без главного объекта."
      ],
      mistakes: [
        "Попытка найти семь красивых кадров.",
        "Оценка результата во время съёмки.",
        "Смена места вместо смены подхода.",
        "Удаление кадров сразу."
      ],
      exercise:
        "Сделайте семь разных фотографий одного места за 20 минут. Оцените их только на следующий день."
    }
  }
];

const tasks = [
  {
    id: "task-ground",
    title: "На уровне земли",
    description:
      "Найдите обычный объект и снимите его с высоты не более 20 сантиметров от земли. Сделайте передний план главным героем.",
    place: "улица",
    time: "день",
    duration: "10 минут",
    season: "любой сезон",
    technique: "низкий ракурс"
  },
  {
    id: "task-shadow",
    title: "Только тени",
    description:
      "Снимите три фотографии, в которых сам объект почти не виден. Историю должны рассказать его тень, след или отражение.",
    place: "улица",
    time: "день",
    duration: "15 минут",
    season: "любой сезон",
    technique: "свет и тень"
  },
  {
    id: "task-home-color",
    title: "Один цвет дома",
    description:
      "Выберите один цвет и найдите дома пять объектов этого оттенка. Не меняйте цвет во время обработки.",
    place: "дом",
    time: "любое время",
    duration: "10 минут",
    season: "любой сезон",
    technique: "цветовая серия"
  },
  {
    id: "task-reflection",
    title: "Второй мир",
    description:
      "Найдите отражающую поверхность и совместите в одном кадре реальный объект с его отражением.",
    place: "улица",
    time: "день или вечер",
    duration: "20 минут",
    season: "любой сезон",
    technique: "отражение"
  },
  {
    id: "task-five",
    title: "Только пять кадров",
    description:
      "Выберите один сюжет и разрешите себе сделать только пять фотографий. Каждый кадр должен отличаться ракурсом.",
    place: "где угодно",
    time: "любое время",
    duration: "5 минут",
    season: "любой сезон",
    technique: "ограничение"
  },
  {
    id: "task-winter",
    title: "Холодная фактура",
    description:
      "Найдите зимой фактуру, которую обычно не замечаете: иней, лёд, кору, следы или пар. Снимите её как абстрактный пейзаж.",
    place: "улица",
    time: "утро или день",
    duration: "15 минут",
    season: "зима",
    technique: "макро и фактура"
  },
  {
    id: "task-window",
    title: "Свет из окна",
    description:
      "Поставьте один предмет возле окна. Не используйте вспышку. Сделайте три версии: мягкую, контрастную и почти силуэтную.",
    place: "дом",
    time: "день",
    duration: "15 минут",
    season: "любой сезон",
    technique: "естественный свет"
  },
  {
    id: "task-mono",
    title: "Мир без цвета",
    description:
      "Сделайте серию из трёх кадров, где цвет не нужен для понимания сюжета. Ищите форму, ритм и контраст.",
    place: "где угодно",
    time: "любое время",
    duration: "20 минут",
    season: "любой сезон",
    technique: "монохром"
  }
];

const defaultState = {
  screen: "today",
  theme: "dark",
  favorites: [],
  completedTasks: [],
  selectedTaskId: null,
  filterPlace: "все",
  filterTime: "все",
  level: "Ищу новые идеи"
};

let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return { ...defaultState };
    }

    return {
      ...defaultState,
      ...JSON.parse(saved)
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayNumber() {
  const date = new Date();
  return Number(
    `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`
  );
}

function dailyTask() {
  return tasks[todayNumber() % tasks.length];
}

function getCurrentTask() {
  return tasks.find((task) => task.id === state.selectedTaskId) || dailyTask();
}

function formatDate() {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isFavorite(id) {
  return state.favorites.includes(id);
}

function isCompleted(id) {
  return state.completedTasks.includes(id);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function setScreen(screen) {
  state.screen = screen;
  saveState();
  render();
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  saveState();
}

function toggleFavorite(id) {
  if (isFavorite(id)) {
    state.favorites = state.favorites.filter((item) => item !== id);
    showToast("Убрано из избранного");
  } else {
    state.favorites.push(id);
    showToast("Сохранено в коллекцию");
  }

  saveState();
  render();
}

function completeTask(id) {
  if (!isCompleted(id)) {
    state.completedTasks.push(id);
    saveState();
    showToast("Задание отмечено выполненным");
    render();
  } else {
    showToast("Это задание уже выполнено");
  }
}

function render() {
  document.documentElement.dataset.theme = state.theme;

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.screen === state.screen
    );
  });

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

function renderToday() {
  const task = dailyTask();
  const completed = isCompleted(task.id);

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <span class="date-label">${escapeHtml(formatDate())}</span>
        <h2>Смотри чуть дальше.</h2>
        <p>Идеи для тех случаев, когда привычного взгляда уже недостаточно.</p>
      </div>

      <article class="hero-card">
        <div class="hero-content">
          <p class="hero-kicker">Задание дня</p>
          <h2>${escapeHtml(task.title)}</h2>
          <p>${escapeHtml(task.description)}</p>
        </div>

        <div class="hero-footer">
          <span class="hero-meta">${escapeHtml(task.duration)} · ${escapeHtml(task.technique)}</span>
          <button class="primary-button" data-action="open-task">
            ${completed ? "Открыть снова" : "Начать"}
          </button>
        </div>
      </article>

      <div class="section-header">
        <h3>Быстрый выбор</h3>
        <button data-action="open-shoot">Все задания</button>
      </div>

      <div class="quick-grid">
        <button class="quick-card" data-action="quick" data-value="random">
          <span class="quick-icon">⤨</span>
          <strong>Случайная идея</strong>
          <small>Выбрать задание без долгих раздумий</small>
        </button>

        <button class="quick-card" data-action="quick" data-value="home">
          <span class="quick-icon">⌂</span>
          <strong>Снять дома</strong>
          <small>Практика без выхода на улицу</small>
        </button>

        <button class="quick-card" data-action="quick" data-value="crisis">
          <span class="quick-icon">↻</span>
          <strong>Нет вдохновения</strong>
          <small>Мягкое задание для возвращения</small>
        </button>

        <button class="quick-card" data-action="open-learn">
          <span class="quick-icon">✦</span>
          <strong>Новая техника</strong>
          <small>Узнать один необычный приём</small>
        </button>
      </div>

      <div class="section-header">
        <h3>Маленькое наблюдение</h3>
      </div>

      <div class="info-card">
        <div class="info-card-icon">◌</div>
        <div>
          <h3>Не ищите новый мир</h3>
          <p>
            Попробуйте изменить расстояние, высоту камеры, время или способ
            кадрирования уже знакомого места.
          </p>
        </div>
      </div>
    </section>
  `;
}

function renderLearn() {
  const query = state.learnQuery || "";
  const category = state.learnCategory || "Все";

  const categories = [
    "Все",
    "Свет",
    "Ракурсы",
    "Цвет",
    "Движение",
    "Необычные приёмы",
    "Творческий кризис"
  ];

  const filtered = articles.filter((article) => {
    const matchesCategory =
      category === "Все" || article.category === category;

    const searchable = [
      article.title,
      article.category,
      article.description,
      article.tags.join(" ")
    ]
      .join(" ")
      .toLowerCase();

    return matchesCategory && searchable.includes(query.toLowerCase());
  });

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Изучать</h2>
        <p>Приёмы, которые помогают смотреть на обычное иначе.</p>
      </div>

      <div class="search-box">
        <span class="search-icon">⌕</span>
        <input
          id="articleSearch"
          type="search"
          placeholder="Найти технику или идею"
          value="${escapeHtml(query)}"
        />
      </div>

      <div class="chips">
        ${categories
          .map(
            (item) => `
              <button
                class="chip ${category === item ? "active" : ""}"
                data-category="${escapeHtml(item)}"
              >
                ${escapeHtml(item)}
              </button>
            `
          )
          .join("")}
      </div>

      <div class="article-list">
        ${
          filtered.length
            ? filtered.map(articleCard).join("")
            : `
              <div class="empty-state">
                Ничего не найдено. Попробуйте изменить запрос или категорию.
              </div>
            `
        }
      </div>
    </section>
  `;

  document.querySelector("#articleSearch")?.addEventListener("input", (event) => {
    state.learnQuery = event.target.value;
    renderLearn();
  });
}

function articleCard(article) {
  return `
    <button class="article-card" data-article="${escapeHtml(article.id)}">
      <div class="article-topline">
        <span class="article-category">${escapeHtml(article.category)}</span>
        <span class="favorite ${isFavorite(article.id) ? "is-favorite" : ""}">
          ${isFavorite(article.id) ? "♥" : "♡"}
        </span>
      </div>

      <h3>${escapeHtml(article.title)}</h3>
      <p>${escapeHtml(article.description)}</p>

      <div class="tag-row">
        ${article.tags
          .slice(0, 3)
          .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
          .join("")}
      </div>
    </button>
  `;
}

function renderArticle(articleId) {
  const article = articles.find((item) => item.id === articleId);

  if (!article) {
    setScreen("learn");
    return;
  }

  const details = article.full;

  app.innerHTML = `
    <article class="article-detail">
      <button class="back-button" data-action="back-learn">← Назад к материалам</button>

      <div class="article-topline">
        <span class="article-category">${escapeHtml(article.category)}</span>
        <button class="ghost-button" data-action="favorite-article">
          ${isFavorite(article.id) ? "♥ В коллекции" : "♡ Сохранить"}
        </button>
      </div>

      <h2>${escapeHtml(article.title)}</h2>
      <p class="article-lead">${escapeHtml(details.intro)}</p>

      <section class="detail-section">
        <h3>Когда это работает</h3>
        <p>${escapeHtml(details.when)}</p>
      </section>

      <section class="detail-section">
        <h3>Пошагово</h3>
        <ol>
          ${details.steps
            .map((step) => `<li>${escapeHtml(step)}</li>`)
            .join("")}
        </ol>
      </section>

      <section class="detail-section">
        <h3>Типичные ошибки</h3>
        <ul>
          ${details.mistakes
            .map((mistake) => `<li>${escapeHtml(mistake)}</li>`)
            .join("")}
        </ul>
      </section>

      <section class="detail-section">
        <h3>Практика</h3>
        <div class="notice">${escapeHtml(details.exercise)}</div>
      </section>
    </article>
  `;

  document
    .querySelector('[data-action="favorite-article"]')
    ?.addEventListener("click", () => toggleFavorite(article.id));
}

function renderShoot() {
  const task = getCurrentTask();
  const completed = isCompleted(task.id);

  const filteredTasks = tasks.filter((item) => {
    const matchesPlace =
      state.filterPlace === "все" || item.place === state.filterPlace;

    const matchesTime =
      state.filterTime === "все" || item.time.includes(state.filterTime);

    return matchesPlace && matchesTime;
  });

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Снять</h2>
        <p>Не ждите идеального сюжета. Выберите ограничение и начните.</p>
      </div>

      <article class="task-card">
        <div class="task-topline">
          <span class="task-category">Текущее задание</span>
          ${completed ? '<span class="tag">Выполнено</span>' : ""}
        </div>

        <h2>${escapeHtml(task.title)}</h2>
        <p class="task-description">${escapeHtml(task.description)}</p>

        <div class="task-details">
          <div class="detail-item">
            <small>Где</small>
            <strong>${escapeHtml(task.place)}</strong>
          </div>

          <div class="detail-item">
            <small>Когда</small>
            <strong>${escapeHtml(task.time)}</strong>
          </div>

          <div class="detail-item">
            <small>Время</small>
            <strong>${escapeHtml(task.duration)}</strong>
          </div>

          <div class="detail-item">
            <small>Приём</small>
            <strong>${escapeHtml(task.technique)}</strong>
          </div>
        </div>

        <div class="task-actions">
          <button class="primary-button" data-action="random-task">
            Другое задание
          </button>

          <button class="secondary-button" data-action="complete-task">
            ${completed ? "Уже выполнено" : "Отметить выполненным"}
          </button>
        </div>
      </article>

      <div class="section-header">
        <h3>Настроить поиск</h3>
      </div>

      <div class="filter-row">
        <select class="select" id="placeFilter">
          <option value="все">Любое место</option>
          <option value="дом">Дома</option>
          <option value="улица">На улице</option>
          <option value="где угодно">Где угодно</option>
        </select>

        <select class="select" id="timeFilter">
          <option value="все">Любое время</option>
          <option value="день">Днём</option>
          <option value="вечер">Вечером</option>
          <option value="ночь">Ночью</option>
        </select>
      </div>

      <div class="section-header">
        <h3>Все задания</h3>
        <span class="date-label">${filteredTasks.length}</span>
      </div>

      <div class="article-list">
        ${filteredTasks.map(taskCard).join("")}
      </div>
    </section>
  `;

  const placeFilter = document.querySelector("#placeFilter");
  const timeFilter = document.querySelector("#timeFilter");

  placeFilter.value = state.filterPlace;
  timeFilter.value = state.filterTime;

  placeFilter.addEventListener("change", (event) => {
    state.filterPlace = event.target.value;
    saveState();
    renderShoot();
  });

  timeFilter.addEventListener("change", (event) => {
    state.filterTime = event.target.value;
    saveState();
    renderShoot();
  });
}

function taskCard(task) {
  return `
    <button class="article-card" data-task="${escapeHtml(task.id)}">
      <div class="article-topline">
        <span class="article-category">${escapeHtml(task.technique)}</span>
        ${isCompleted(task.id) ? '<span class="tag">Выполнено</span>' : ""}
      </div>

      <h3>${escapeHtml(task.title)}</h3>
      <p>${escapeHtml(task.description)}</p>

      <div class="tag-row">
        <span class="tag">${escapeHtml(task.place)}</span>
        <span class="tag">${escapeHtml(task.duration)}</span>
      </div>
    </button>
  `;
}

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
        <p>Материалы, к которым можно вернуться, когда появится время.</p>
      </div>

      <div class="section-header">
        <h3>Сохранённые материалы</h3>
        <span class="date-label">${favoriteArticles.length}</span>
      </div>

      ${
        favoriteArticles.length
          ? `<div class="article-list">${favoriteArticles
              .map(articleCard)
              .join("")}</div>`
          : `
            <div class="empty-state">
              Здесь пока пусто.<br />
              Сохраняйте техники, которые хочется попробовать.
            </div>
          `
      }

      <div class="section-header">
        <h3>Выполненные задания</h3>
        <span class="date-label">${completed.length}</span>
      </div>

      ${
        completed.length
          ? `<div class="article-list">${completed
              .map(taskCard)
              .join("")}</div>`
          : `
            <div class="empty-state">
              Выполненные практики появятся здесь.
            </div>
          `
      }
    </section>
  `;
}

function renderProfile() {
  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Профиль</h2>
        <p>Настройте приложение под свой способ снимать и наблюдать.</p>
      </div>

      <div class="profile-card">
        <div class="profile-row">
          <div>
            <strong>Уровень</strong>
            <small>${escapeHtml(state.level)}</small>
          </div>
          <select class="select" id="levelSelect" style="width: auto;">
            <option>Начинаю</option>
            <option>Снимаю уверенно</option>
            <option>Ищу новые идеи</option>
            <option>Возвращаю вдохновение</option>
          </select>
        </div>

        <div class="profile-row">
          <div>
            <strong>Тёмная тема</strong>
            <small>Тёплый интерфейс для вечерней съёмки</small>
          </div>
          <button
            class="toggle ${state.theme === "dark" ? "active" : ""}"
            id="profileThemeToggle"
            aria-label="Переключить тему"
          ></button>
        </div>

        <div class="profile-row">
          <div>
            <strong>Выполнено заданий</strong>
            <small>Личная практика без рейтингов</small>
          </div>
          <strong>${state.completedTasks.length}</strong>
        </div>

        <div class="profile-row">
          <div>
            <strong>Сохранено материалов</strong>
            <small>Техники для повторного изучения</small>
          </div>
          <strong>${state.favorites.length}</strong>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-icon">i</div>
        <div>
          <h3>Принцип «Вне кадра»</h3>
          <p>
            Здесь не нужно быть продуктивным каждый день. Возвращение к
            наблюдению уже является частью практики.
          </p>
        </div>
      </div>
    </section>
  `;

  const levelSelect = document.querySelector("#levelSelect");
  levelSelect.value = state.level;

  levelSelect.addEventListener("change", (event) => {
    state.level = event.target.value;
    saveState();
    showToast("Профиль обновлён");
    renderProfile();
  });

  document
    .querySelector("#profileThemeToggle")
    ?.addEventListener("click", () => {
      setTheme(state.theme === "dark" ? "light" : "dark");
      renderProfile();
    });
}

function randomTask(filter = null) {
  let available = tasks;

  if (filter === "home") {
    available = tasks.filter((task) => task.place === "дом");
  }

  if (filter === "crisis") {
    available = tasks.filter(
      (task) =>
        task.technique === "ограничение" ||
        task.technique === "цветовая серия"
    );
  }

  if (state.filterPlace !== "все") {
    available = available.filter(
      (task) =>
        task.place === state.filterPlace ||
        task.place === "где угодно"
    );
  }

  if (state.filterTime !== "все") {
    available = available.filter((task) =>
      task.time.includes(state.filterTime)
    );
  }

  if (!available.length) {
    available = tasks;
  }

  const current = getCurrentTask();
  const alternatives = available.filter((task) => task.id !== current.id);
  const pool = alternatives.length ? alternatives : available;

  state.selectedTaskId = pool[Math.floor(Math.random() * pool.length)].id;
  saveState();
  setScreen("shoot");
}

function openCurrentTask() {
  state.selectedTaskId = dailyTask().id;
  saveState();
  setScreen("shoot");
}

document.addEventListener("click", (event) => {
  const navButton = event.target.closest("[data-screen]");

  if (navButton) {
    setScreen(navButton.dataset.screen);
    return;
  }

  const articleButton = event.target.closest("[data-article]");

  if (articleButton) {
    renderArticle(articleButton.dataset.article);
    return;
  }

  const taskButton = event.target.closest("[data-task]");

  if (taskButton) {
    state.selectedTaskId = taskButton.dataset.task;
    saveState();
    renderShoot();
    return;
  }

  const categoryButton = event.target.closest("[data-category]");

  if (categoryButton) {
    state.learnCategory = categoryButton.dataset.category;
    renderLearn();
    return;
  }

  const action = event.target.closest("[data-action]");

  if (!action) {
    return;
  }

  if (action.dataset.action === "open-task") {
    openCurrentTask();
  }

  if (action.dataset.action === "open-shoot") {
    setScreen("shoot");
  }

  if (action.dataset.action === "open-learn") {
    setScreen("learn");
  }

  if (action.dataset.action === "back-learn") {
    setScreen("learn");
  }

  if (action.dataset.action === "random-task") {
    randomTask();
  }

  if (action.dataset.action === "complete-task") {
    completeTask(getCurrentTask().id);
  }

  if (action.dataset.action === "favorite-article") {
    toggleFavorite(action.dataset.id);
  }

  if (action.dataset.action === "quick") {
    const value = action.dataset.value;

    if (value === "random") {
      randomTask();
    }

    if (value === "home") {
      randomTask("home");
    }

    if (value === "crisis") {
      randomTask("crisis");
    }
  }
});

themeToggle.addEventListener("click", () => {
  setTheme(state.theme === "dark" ? "light" : "dark");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

render();
