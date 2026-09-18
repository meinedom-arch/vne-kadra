const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("#themeToggle");
const installButton = document.querySelector("#installButton");

const STORAGE_KEY = "vne-kadra-state";

let deferredInstallPrompt = null;

const articles = [
  {
    id: "camera-controls",
    title: "Фокус и экспозиция на смартфоне",
    category: "Основы",
    description:
      "Базовые действия, которые нужно знать перед любой практической съёмкой.",
    tags: ["основы", "камера", "новичкам"],
    full: {
      intro:
        "Большинство заданий в приложении используют два простых действия: фокусировку касанием и изменение яркости кадра.",
      sections: [
        {
          title: "Как сфокусироваться",
          text:
            "Наведите камеру на главный объект и коснитесь его на экране. Смартфон попробует навести резкость именно на выбранной области."
        },
        {
          title: "Как изменить яркость",
          text:
            "После касания на экране обычно появляется значок солнца или вертикальный ползунок. Проведите вниз, чтобы сделать кадр темнее, и вверх, чтобы сделать светлее."
        },
        {
          title: "Как зафиксировать настройки",
          text:
            "На многих смартфонах нужно удерживать палец на объекте. После этого может появиться надпись AE/AF Lock. Название зависит от модели телефона."
        }
      ],
      mistakes: [
        "Не наводите фокус на самый яркий участок, если главным объектом является человек или предмет.",
        "Не делайте кадр слишком светлым только потому, что экран кажется красивее.",
        "Перед съёмкой протрите объектив мягкой тканью."
      ],
      exercise:
        "Снимите один предмет с обычной экспозицией, затем сделайте кадр чуть светлее и чуть темнее. Сравните, где сохранилось больше деталей."
    }
  },

  {
    id: "ground-angle",
    title: "Съёмка от самой земли",
    category: "Ракурсы",
    description:
      "Низкая точка съёмки превращает обычный объект в масштабную сцену.",
    tags: ["улица", "архитектура", "любой сезон"],
    full: {
      intro:
        "Попробуйте опустить камеру значительно ниже уровня глаз. Даже знакомое место после этого начинает выглядеть иначе.",
      sections: [
        {
          title: "Когда это работает",
          text:
            "Приём хорошо подходит для дорог, травы, луж, лестниц, зданий и людей в движении."
        },
        {
          title: "Как снять",
          text:
            "Опустите смартфон почти к земле или переверните его камерой вниз. Найдите выразительный объект на переднем плане: травинку, камень, край лужи или плитку."
        },
        {
          title: "Что проверить",
          text:
            "На экране должно быть понятно, что находится ближе всего к камере. Если передний план пустой, низкий ракурс может не дать нужного эффекта."
        }
      ],
      mistakes: [
        "Слишком много пустого неба.",
        "Отсутствие объекта на переднем плане.",
        "Случайный наклон горизонта.",
        "Попытка сделать только один кадр."
      ],
      exercise:
        "Снимите одно место с высоты глаз, с уровня груди и почти от земли. Сравните не качество, а ощущение масштаба."
    }
  },

  {
    id: "window-light",
    title: "Свет из окна: три варианта",
    category: "Свет",
    description:
      "Снимите один предмет мягким, контрастным и силуэтным способом.",
    tags: ["дом", "свет", "новичкам"],
    full: {
      intro:
        "Одно окно может дать совершенно разные фотографии. Меняя направление и жёсткость света, вы меняете объём, настроение и читаемость предмета.",
      sections: [
        {
          title: "Цель",
          text:
            "Понять, как направление света меняет настроение и объём объекта."
        },
        {
          title: "Что подготовить",
          text:
            "Простой предмет: чашку, растение, книгу или стеклянную бутылку. Также понадобятся окно, смартфон и примерно 15 минут."
        }
      ],
      steps: [
        "Поставьте предмет на стол рядом с окном.",
        "Отключите верхний свет и вспышку смартфона.",
        "Протрите объектив.",
        "Коснитесь предмета на экране, чтобы сфокусироваться.",
        "Сделайте три серии, меняя только положение предмета и плотность света."
      ],
      versions: [
        {
          title: "Мягкий свет",
          text:
            "Закройте окно тонкой занавеской или отодвиньте предмет немного дальше от окна.",
          result:
            "Тени станут плавными, а поверхность предмета будет выглядеть спокойнее."
        },
        {
          title: "Контрастный свет",
          text:
            "Уберите занавеску и поставьте предмет боком к окну. Не подсвечивайте тёмную сторону.",
          result:
            "Одна сторона предмета будет яркой, а другая заметно уйдёт в тень."
        },
        {
          title: "Силуэт",
          text:
            "Поставьте предмет между смартфоном и окном. Коснитесь светлого окна на экране и потяните значок солнца вниз.",
          result:
            "Предмет станет почти чёрным, а фон останется светлым."
        }
      ],
      mistakes: [
        "Не используйте вспышку — она уничтожит различие между вариантами.",
        "Не ставьте предмет вплотную к стеклу.",
        "Не оценивайте результат только по яркости: смотрите на направление теней."
      ],
      alternatives:
        "Если нет окна, используйте настольную лампу или фонарик второго телефона. Свет направляйте сбоку, а не прямо в объектив.",
      exercise:
        "Повторите упражнение с человеком, растением или прозрачным предметом."
    }
  },

  {
    id: "black-white",
    title: "Чёрно-белое мышление",
    category: "Цвет",
    description:
      "Используйте монохром не как фильтр, а как способ увидеть свет, форму и ритм.",
    tags: ["монохром", "улица", "форма"],
    full: {
      intro:
        "Чёрно-белый кадр убирает цветовую информацию и оставляет отношения между светом, тенью, фактурой и формой.",
      sections: [
        {
          title: "Как начать",
          text:
            "Если смартфон позволяет, включите монохромный предпросмотр. Если нет — снимайте обычный цветной кадр, а чёрно-белую версию сделайте позже."
        },
        {
          title: "Что искать",
          text:
            "Ищите разницу между светлым и тёмным, повторяющиеся формы, силуэты, фактуры и выразительные тени."
        }
      ],
      steps: [
        "Выберите сцену с заметным светом и тенью.",
        "Уберите из кадра лишние яркие цветовые пятна.",
        "Сделайте обычный кадр.",
        "Сделайте второй кадр с немного уменьшенной экспозицией.",
        "Позже сравните, какая версия лучше сохраняет форму."
      ],
      mistakes: [
        "Превращать в чёрно-белое любой кадр без причины.",
        "Делать тени полностью без деталей.",
        "Увеличивать контраст до появления грубых провалов."
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
      "Ищите отражения не только в воде: витрины, металл, экраны, стекло и тёмная одежда.",
    tags: ["отражения", "город", "эксперимент"],
    full: {
      intro:
        "Отражение может стать вторым пространством в кадре. Оно добавляет слои и визуальную неоднозначность.",
      sections: [
        {
          title: "Где искать",
          text:
            "После дождя смотрите на лужи и мокрый асфальт. В городе используйте витрины, окна транспорта, полированный металл и тёмные экраны."
        },
        {
          title: "Как снимать",
          text:
            "Подойдите к поверхности под разными углами. Попробуйте совместить отражение с настоящим объектом, а затем снимите только отражение."
        }
      ],
      mistakes: [
        "Снимать строго перпендикулярно поверхности.",
        "Оставлять слишком много деталей в отражении.",
        "Случайно отражать самого фотографа.",
        "Не иметь точки внимания."
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
      "Сделайте размытие не ошибкой, а способом показать направление или скорость.",
    tags: ["движение", "ночь", "эксперимент"],
    full: {
      intro:
        "Размытие может передавать движение лучше, чем идеально резкий кадр. Важно контролировать направление.",
      sections: [
        {
          title: "Когда использовать",
          text:
            "Попробуйте технику с транспортом, водой, людьми, огнями и деревьями на ветру."
        },
        {
          title: "Как снимать",
          text:
            "Если в камере есть ручной режим, увеличьте выдержку. Если его нет, используйте ночной режим или специальное приложение с ручными настройками."
        }
      ],
      steps: [
        "Выберите движущийся объект.",
        "Зафиксируйте смартфон или плавно проведите им вслед за объектом.",
        "Сделайте серию из десяти кадров.",
        "Не удаляйте снимки сразу.",
        "Оставьте варианты, где размытие поддерживает композицию."
      ],
      mistakes: [
        "Случайное дрожание во всех направлениях.",
        "Отсутствие резкого элемента.",
        "Слишком длинная выдержка без выразительного движения."
      ],
      exercise:
        "Сделайте десять кадров движущегося объекта, не пытаясь получить идеальную резкость во всех вариантах."
    }
  },

  {
    id: "one-place",
    title: "Одно место — семь взглядов",
    category: "Творческий кризис",
    description:
      "Знакомое место не становится скучным, если менять способ наблюдения.",
    tags: ["кризис", "серия", "практика"],
    full: {
      intro:
        "Ощущение, что всё уже снято, часто означает, что мы повторяем не место, а собственный способ смотреть на него.",
      sections: [
        {
          title: "Цель",
          text:
            "Научиться менять не место, а способ наблюдения: высоту камеры, дистанцию, цвет, свет и кадрирование."
        }
      ],
      steps: [
        "Снимите место с высоты глаз.",
        "Найдите один фрагмент вместо общего вида.",
        "Снимите только тени.",
        "Используйте отражение.",
        "Снимите место с самой низкой точки.",
        "Сделайте кадр без очевидного главного объекта.",
        "Снимите тот же сюжет в чёрно-белом виде."
      ],
      mistakes: [
        "Попытка найти семь красивых кадров.",
        "Оценка результата во время съёмки.",
        "Удаление фотографий сразу.",
        "Смена места вместо смены подхода."
      ],
      exercise:
        "Сделайте семь разных фотографий одного места за 20 минут. Оцените их только на следующий день."
    }
  }
];

const tasks = [
  {
    id: "task-window",
    title: "Свет из окна",
    description:
      "Поставьте один предмет возле окна и снимите его мягким, контрастным и силуэтным способом.",
    place: "дом",
    time: "день",
    duration: "15 минут",
    season: "любой сезон",
    technique: "естественный свет",
    level: "Начинающий",
    goal:
      "Понять, как направление и жёсткость света меняют настроение и объём объекта.",
    preparation: [
      "Выберите чашку, растение, книгу или стеклянную бутылку.",
      "Поставьте предмет на стол рядом с окном.",
      "Отключите верхний свет и вспышку.",
      "Протрите объектив смартфона."
    ],
    steps: [
      "Сначала поставьте предмет так, чтобы свет падал сбоку.",
      "Коснитесь объекта на экране, чтобы сфокусироваться.",
      "Сделайте обычный кадр.",
      "Закройте окно тонкой занавеской и сделайте мягкую версию.",
      "Уберите занавеску и сделайте контрастную версию.",
      "Поставьте объект перед окном, коснитесь светлого фона и уменьшите экспозицию для силуэта."
    ],
    versions: [
      {
        title: "Мягкий",
        text:
          "Используйте занавеску или отодвиньте предмет от окна. Тени должны быть плавными и незаметными."
      },
      {
        title: "Контрастный",
        text:
          "Поставьте предмет боком к открытому окну. Не подсвечивайте тёмную сторону."
      },
      {
        title: "Силуэтный",
        text:
          "Поставьте предмет перед окном. Коснитесь светлого окна на экране и потяните значок солнца вниз."
      }
    ],
    mistakes: [
      "Использовать вспышку.",
      "Поставить предмет вплотную к стеклу.",
      "Не менять положение предмета между вариантами."
    ],
    alternatives:
      "Если нет окна, используйте настольную лампу или фонарик второго телефона. Направляйте свет сбоку.",
    challenge:
      "Повторите упражнение с человеком, растением и прозрачным предметом."
  },

  {
    id: "task-ground",
    title: "На уровне земли",
    description:
      "Найдите обычный объект и снимите его с высоты не более 20 сантиметров от земли.",
    place: "улица",
    time: "день",
    duration: "10 минут",
    season: "любой сезон",
    technique: "низкий ракурс",
    level: "Начинающий",
    goal:
      "Понять, как высота камеры меняет ощущение масштаба.",
    preparation: [
      "Выберите безопасное место: двор, парк, дорожку или подъезд.",
      "Найдите передний план: травинку, камень, лужу, плитку или лист.",
      "Проверьте, что смартфон не окажется в воде или грязи."
    ],
    steps: [
      "Сделайте обычный кадр с высоты глаз.",
      "Присядьте и снимите тот же объект с уровня груди.",
      "Опустите смартфон почти к земле.",
      "Переверните телефон камерой вниз, если объектив находится высоко.",
      "Сделайте несколько кадров с разным наклоном телефона."
    ],
    versions: [
      {
        title: "Обычный ракурс",
        text:
          "Снимайте стоя. Это будет точка сравнения."
      },
      {
        title: "Низкий ракурс",
        text:
          "Опустите камеру до 20 сантиметров от земли. Передний план должен занимать заметную часть кадра."
      },
      {
        title: "Экстремально низкий",
        text:
          "Положите смартфон почти на поверхность, но не допускайте попадания влаги и песка в объектив."
      }
    ],
    mistakes: [
      "Слишком много пустого неба.",
      "Горизонт завален без намерения.",
      "Передний план никак не связан с сюжетом."
    ],
    alternatives:
      "Дома используйте пол, стол или лестницу. Снимите предмет с уровня пола.",
    challenge:
      "Создайте серию из трёх кадров одного места: сверху, на уровне глаз и от земли."
  },

  {
    id: "task-shadow",
    title: "Только тени",
    description:
      "Снимите три фотографии, в которых сам объект почти не виден.",
    place: "улица",
    time: "день",
    duration: "15 минут",
    season: "любой сезон",
    technique: "свет и тень",
    level: "Начинающий",
    goal:
      "Научиться видеть сюжет не только в предметах, но и в следах их присутствия.",
    preparation: [
      "Ищите солнечный свет и хорошо заметные тени.",
      "Подойдут деревья, лестницы, люди, велосипеды и перила.",
      "Не фотографируйте людей близко без их согласия."
    ],
    steps: [
      "Найдите выразительную тень.",
      "Сделайте кадр только тени.",
      "Попробуйте включить в кадр небольшой фрагмент объекта.",
      "Измените высоту камеры.",
      "Сделайте один вертикальный и один горизонтальный вариант."
    ],
    versions: [
      {
        title: "Тень как главный объект",
        text:
          "Сам предмет должен почти полностью исчезнуть из кадра."
      },
      {
        title: "Объект и тень",
        text:
          "Покажите небольшой фрагмент настоящего объекта и его тень одновременно."
      },
      {
        title: "Абстракция",
        text:
          "Подойдите ближе, чтобы зритель не сразу понял происхождение тени."
      }
    ],
    mistakes: [
      "Слишком много случайного фона.",
      "Тень теряется среди других пятен.",
      "Съёмка против слишком яркого света без контроля экспозиции."
    ],
    alternatives:
      "Дома используйте тень от настольной лампы, окна или предмета возле стены.",
    challenge:
      "Создайте серию, в которой тени выглядят как самостоятельные персонажи."
  },

  {
    id: "task-five",
    title: "Только пять кадров",
    description:
      "Выберите один сюжет и разрешите себе сделать только пять фотографий.",
    place: "где угодно",
    time: "любое время",
    duration: "5 минут",
    season: "любой сезон",
    technique: "ограничение",
    level: "Начинающий",
    goal:
      "Уменьшить количество случайных снимков и начать осознанно менять ракурс.",
    preparation: [
      "Выберите один объект или сцену.",
      "Заранее решите, что каждый кадр будет отличаться.",
      "Не удаляйте фотографии во время упражнения."
    ],
    steps: [
      "Кадр 1 — обычный общий вид.",
      "Кадр 2 — подойдите ближе.",
      "Кадр 3 — измените высоту камеры.",
      "Кадр 4 — найдите отражение или тень.",
      "Кадр 5 — уберите очевидный главный объект."
    ],
    versions: [
      {
        title: "Общий вид",
        text:
          "Покажите объект вместе с окружающим пространством."
      },
      {
        title: "Деталь",
        text:
          "Подойдите ближе и заполните кадр частью объекта."
      },
      {
        title: "Иной взгляд",
        text:
          "Измените высоту, направление света или способ кадрирования."
      }
    ],
    mistakes: [
      "Сделать пять почти одинаковых кадров.",
      "Удалять варианты сразу.",
      "Оценивать упражнение только по одному красивому снимку."
    ],
    alternatives:
      "Можно выполнять дома, по дороге на работу или во время короткого ожидания.",
    challenge:
      "Повторите задание на следующий день с тем же объектом, но в другое время."
  },

  {
    id: "task-winter",
    title: "Холодная фактура",
    description:
      "Найдите зимой фактуру, которую обычно не замечаете: иней, лёд, кору, следы или пар.",
    place: "улица",
    time: "утро или день",
    duration: "15 минут",
    season: "зима",
    technique: "макро и фактура",
    level: "Начинающий",
    goal:
      "Увидеть зимний сюжет не только как пейзаж, но и как набор поверхностей.",
    preparation: [
      "Проверьте, что объектив сухой.",
      "Не заносите сразу холодный смартфон в тёплое помещение.",
      "Выберите один материал: лёд, снег, дерево, металл или ткань."
    ],
    steps: [
      "Сначала снимите фактуру целиком.",
      "Затем подойдите ближе.",
      "Измените угол так, чтобы боковой свет подчёркивал поверхность.",
      "Сделайте один цветной и один монохромный вариант.",
      "Не используйте цифровой зум без необходимости."
    ],
    versions: [
      {
        title: "Документальный кадр",
        text:
          "Покажите, где находится фактура и к какому объекту она относится."
      },
      {
        title: "Абстракция",
        text:
          "Подойдите близко и заполните кадр только поверхностью."
      },
      {
        title: "Графика",
        text:
          "Ищите линии, повторения, трещины и геометрические формы."
      }
    ],
    mistakes: [
      "Снимать только сверху без учёта света.",
      "Не протирать объектив.",
      "Резко заносить холодный смартфон в тёплое помещение."
    ],
    alternatives:
      "Зимой дома можно снимать лёд из морозилки, капли на стекле, ткань, металл и пар.",
    challenge:
      "Соберите серию из пяти фактур, которые зритель не сможет сразу определить."
  }
];

const defaultState = {
  screen: "today",
  theme: "dark",
  fontSize: "normal",
  favorites: [],
  completedTasks: [],
  selectedTaskId: null,
  selectedArticleId: null,
  filterPlace: "все",
  filterTime: "все",
  learnQuery: "",
  learnCategory: "Все",
  level: "Ищу новые идеи"
};

let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

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

function todayNumber() {
  const date = new Date();

  return Number(
    `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`
  );
}

function dailyTask() {
  return tasks[todayNumber() % tasks.length];
}

function currentTask() {
  return (
    tasks.find((task) => task.id === state.selectedTaskId) ||
    dailyTask()
  );
}

function formatDate() {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());
}

function isFavorite(id) {
  return state.favorites.includes(id);
}

function isCompleted(id) {
  return state.completedTasks.includes(id);
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

function setFontSize(size) {
  state.fontSize = size;
  document.documentElement.dataset.font = size;
  saveState();
}

function toggleFavorite(id) {
  if (isFavorite(id)) {
    state.favorites = state.favorites.filter((item) => item !== id);
    showToast("Убрано из коллекции");
  } else {
    state.favorites.push(id);
    showToast("Сохранено в коллекцию");
  }

  saveState();
  render();
}

function completeTask(id) {
  if (isCompleted(id)) {
    showToast("Это задание уже выполнено");
    return;
  }

  state.completedTasks.push(id);
  saveState();
  showToast("Задание отмечено выполненным");
  render();
}

function render() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.font = state.fontSize;

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.screen === state.screen
    );
  });

  if (state.screen === "today") renderToday();
  if (state.screen === "learn") renderLearn();
  if (state.screen === "shoot") renderShoot();
  if (state.screen === "collection") renderCollection();
  if (state.screen === "profile") renderProfile();
}

function renderToday() {
  const task = dailyTask();

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <span class="date-label">${escapeHtml(formatDate())}</span>
        <h2>Смотри чуть дальше.</h2>
        <p>
          Идеи для тех случаев, когда привычного взгляда уже недостаточно.
        </p>
      </div>

      <article class="hero-card">
        <div class="hero-content">
          <p class="hero-kicker">Задание дня</p>
          <h2>${escapeHtml(task.title)}</h2>
          <p>${escapeHtml(task.description)}</p>
        </div>

        <div class="hero-footer">
          <span class="hero-meta">
            ${escapeHtml(task.duration)} · ${escapeHtml(task.technique)}
          </span>

          <button class="primary-button" data-action="open-daily-task">
            Начать
          </button>
        </div>
      </article>

      <div class="section-header">
        <h3>Быстрый выбор</h3>
        <button data-action="open-shoot">Все задания</button>
      </div>

      <div class="quick-grid">
        <button class="quick-card" data-action="random-task">
          <span class="quick-icon">⤨</span>
          <strong>Случайная идея</strong>
          <small>Выбрать задание без долгих раздумий</small>
        </button>

        <button class="quick-card" data-action="home-task">
          <span class="quick-icon">⌂</span>
          <strong>Снять дома</strong>
          <small>Практика без выхода на улицу</small>
        </button>

        <button class="quick-card" data-action="crisis-task">
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
    "Основы",
    "Свет",
    "Ракурсы",
    "Цвет",
    "Движение",
    "Необычные приёмы",
    "Творческий кризис"
  ];

  const filtered = articles.filter((article) => {
    const categoryMatch =
      category === "Все" || article.category === category;

    const searchText = [
      article.title,
      article.category,
      article.description,
      article.tags.join(" ")
    ]
      .join(" ")
      .toLowerCase();

    return categoryMatch && searchText.includes(query.toLowerCase());
  });

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Изучать</h2>
        <p>
          Приёмы, которые помогают смотреть на обычные вещи иначе.
        </p>
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
                Ничего не найдено.<br />
                Попробуйте изменить запрос или категорию.
              </div>
            `
        }
      </div>
    </section>
  `;

  document
    .querySelector("#articleSearch")
    ?.addEventListener("input", (event) => {
      state.learnQuery = event.target.value;
      renderLearn();
    });
}

function articleCard(article) {
  return `
    <button class="article-card" data-article="${escapeHtml(article.id)}">
      <div class="article-topline">
        <span class="article-category">
          ${escapeHtml(article.category)}
        </span>

        <span class="favorite ${
          isFavorite(article.id) ? "is-favorite" : ""
        }">
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

  const full = article.full;

  app.innerHTML = `
    <article class="article-detail">
      <button class="back-button" data-action="back-learn">
        ← Назад к материалам
      </button>

      <div class="article-topline">
        <span class="article-category">
          ${escapeHtml(article.category)}
        </span>

        <button
          class="ghost-button"
          data-action="toggle-article-favorite"
          data-id="${escapeHtml(article.id)}"
        >
          ${isFavorite(article.id) ? "♥ В коллекции" : "♡ Сохранить"}
        </button>
      </div>

      <h2>${escapeHtml(article.title)}</h2>
      <p class="article-lead">${escapeHtml(full.intro)}</p>

      ${
        full.sections
          ? full.sections
              .map(
                (section) => `
                  <section class="detail-section">
                    <h3>${escapeHtml(section.title)}</h3>
                    <p>${escapeHtml(section.text)}</p>
                  </section>
                `
              )
              .join("")
          : ""
      }

      ${
        full.steps
          ? `
            <section class="detail-section">
              <h3>Пошагово</h3>
              <ol>
                ${full.steps
                  .map((step) => `<li>${escapeHtml(step)}</li>`)
                  .join("")}
              </ol>
            </section>
          `
          : ""
      }

      ${
        full.versions
          ? `
            <section class="detail-section">
              <h3>Варианты</h3>
              ${full.versions
                .map(
                  (version) => `
                    <div class="version-card">
                      <h4>${escapeHtml(version.title)}</h4>
                      <p>${escapeHtml(version.text)}</p>
                      ${
                        version.result
                          ? `<p class="version-result"><strong>Результат:</strong> ${escapeHtml(version.result)}</p>`
                          : ""
                      }
                    </div>
                  `
                )
                .join("")}
            </section>
          `
          : ""
      }

      ${
        full.mistakes
          ? `
            <section class="detail-section">
              <h3>Типичные ошибки</h3>
              <ul>
                ${full.mistakes
                  .map((mistake) => `<li>${escapeHtml(mistake)}</li>`)
                  .join("")}
              </ul>
            </section>
          `
          : ""
      }

      <section class="detail-section">
        <h3>Практика</h3>
        <div class="notice">${escapeHtml(full.exercise)}</div>
      </section>
    </article>
  `;
}

function renderShoot() {
  const task = currentTask();

  const filteredTasks = tasks.filter((item) => {
    const placeMatch =
      state.filterPlace === "все" ||
      item.place === state.filterPlace ||
      item.place === "где угодно";

    const timeMatch =
      state.filterTime === "все" ||
      item.time.includes(state.filterTime);

    return placeMatch && timeMatch;
  });

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Снять</h2>
        <p>
          Выберите задание, прочитайте инструкцию и начинайте снимать.
        </p>
      </div>

      ${taskCardDetailed(task)}

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

function taskCardDetailed(task) {
  const completed = isCompleted(task.id);

  return `
    <article class="task-card">
      <div class="task-topline">
        <span class="task-category">
          ${escapeHtml(task.technique)}
        </span>

        ${completed ? '<span class="tag">Выполнено</span>' : ""}
      </div>

      <h2>${escapeHtml(task.title)}</h2>

      <p class="task-description">
        ${escapeHtml(task.description)}
      </p>

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
          <small>Уровень</small>
          <strong>${escapeHtml(task.level)}</strong>
        </div>
      </div>

      <div class="detail-section">
        <h3>Цель</h3>
        <div class="notice">${escapeHtml(task.goal)}</div>
      </div>

      <div class="detail-section">
        <h3>Что подготовить</h3>
        <ul>
          ${task.preparation
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </div>

      <div class="detail-section">
        <h3>Пошагово</h3>
        <ol>
          ${task.steps
            .map((step) => `<li>${escapeHtml(step)}</li>`)
            .join("")}
        </ol>
      </div>

      <div class="detail-section">
        <h3>Варианты</h3>
        ${task.versions
          .map(
            (version) => `
              <div class="version-card">
                <h4>${escapeHtml(version.title)}</h4>
                <p>${escapeHtml(version.text)}</p>
              </div>
            `
          )
          .join("")}
      </div>

      <div class="detail-section">
        <h3>Типичные ошибки</h3>
        <ul>
          ${task.mistakes
            .map((mistake) => `<li>${escapeHtml(mistake)}</li>`)
            .join("")}
        </ul>
      </div>

      <div class="detail-section">
        <h3>Если условия не подходят</h3>
        <div class="notice">${escapeHtml(task.alternatives)}</div>
      </div>

      <div class="detail-section">
        <h3>Усложнение</h3>
        <p>${escapeHtml(task.challenge)}</p>
      </div>

      <div class="task-actions">
        <button class="primary-button" data-action="random-task">
          Другое задание
        </button>

        <button class="secondary-button" data-action="complete-task">
          ${
            completed
              ? "Уже выполнено"
              : "Отметить выполненным"
          }
        </button>
      </div>
    </article>
  `;
}

function taskCard(task) {
  return `
    <button class="article-card" data-task="${escapeHtml(task.id)}">
      <div class="article-topline">
        <span class="article-category">
          ${escapeHtml(task.technique)}
        </span>

        ${
          isCompleted(task.id)
            ? '<span class="tag">Выполнено</span>'
            : ""
        }
      </div>

      <h3>${escapeHtml(task.title)}</h3>
      <p>${escapeHtml(task.description)}</p>

      <div class="tag-row">
        <span class="tag">${escapeHtml(task.place)}</span>
        <span class="tag">${escapeHtml(task.duration)}</span>
        <span class="tag">${escapeHtml(task.level)}</span>
      </div>
    </button>
  `;
}

function renderCollection() {
  const favoriteArticles = articles.filter((article) =>
    state.favorites.includes(article.id)
  );

  const completedTasks = tasks.filter((task) =>
    state.completedTasks.includes(task.id)
  );

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Коллекция</h2>
        <p>
          Материалы, к которым можно вернуться, когда появится время.
        </p>
      </div>

      <div class="section-header">
        <h3>Сохранённые материалы</h3>
        <span class="date-label">${favoriteArticles.length}</span>
      </div>

      ${
        favoriteArticles.length
          ? `<div class="article-list">
              ${favoriteArticles.map(articleCard).join("")}
             </div>`
          : `
            <div class="empty-state">
              Здесь пока пусто.<br />
              Сохраняйте техники, которые хочется попробовать.
            </div>
          `
      }

      <div class="section-header">
        <h3>Выполненные задания</h3>
        <span class="date-label">${completedTasks.length}</span>
      </div>

      ${
        completedTasks.length
          ? `<div class="article-list">
              ${completedTasks.map(taskCard).join("")}
             </div>`
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
        <p>
          Настройте приложение под свой способ снимать и наблюдать.
        </p>
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
            <strong>Размер текста</strong>
            <small>Увеличить инструкции для чтения в поле</small>
          </div>

          <button
            class="toggle ${state.fontSize === "large" ? "active" : ""}"
            id="fontToggle"
            type="button"
            aria-label="Переключить размер текста"
          ></button>
        </div>

        <div class="profile-row">
          <div>
            <strong>Тёмная тема</strong>
            <small>Тёплый интерфейс для вечерней съёмки</small>
          </div>

          <button
            class="toggle ${state.theme === "dark" ? "active" : ""}"
            id="profileThemeToggle"
            type="button"
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
    .querySelector("#fontToggle")
    ?.addEventListener("click", () => {
      setFontSize(state.fontSize === "normal" ? "large" : "normal");
      renderProfile();
    });

  document
    .querySelector("#profileThemeToggle")
    ?.addEventListener("click", () => {
      setTheme(state.theme === "dark" ? "light" : "dark");
      renderProfile();
    });
}

function randomTask(mode = "all") {
  let available = [...tasks];

  if (mode === "home") {
    available = available.filter((task) => task.place === "дом");
  }

  if (mode === "crisis") {
    available = available.filter(
      (task) =>
        task.technique === "ограничение" ||
        task.technique === "свет и тень"
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

  const current = currentTask();
  const alternatives = available.filter((task) => task.id !== current.id);
  const pool = alternatives.length ? alternatives : available;

  const selected =
    pool[Math.floor(Math.random() * pool.length)];

  state.selectedTaskId = selected.id;
  state.screen = "shoot";

  saveState();
  render();
}

function openDailyTask() {
  state.selectedTaskId = dailyTask().id;
  state.screen = "shoot";
  saveState();
  render();
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
    state.screen = "shoot";
    saveState();
    render();
    return;
  }

  const categoryButton = event.target.closest("[data-category]");

  if (categoryButton) {
    state.learnCategory = categoryButton.dataset.category;
    renderLearn();
    return;
  }

  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const action = actionButton.dataset.action;

  if (action === "open-daily-task") {
    openDailyTask();
  }

  if (action === "open-shoot") {
    setScreen("shoot");
  }

  if (action === "open-learn") {
    setScreen("learn");
  }

  if (action === "back-learn") {
    setScreen("learn");
  }

  if (action === "random-task") {
    randomTask("all");
  }

  if (action === "home-task") {
    randomTask("home");
  }

  if (action === "crisis-task") {
    randomTask("crisis");
  }

  if (action === "complete-task") {
    completeTask(currentTask().id);
  }

  if (action === "toggle-article-favorite") {
    toggleFavorite(actionButton.dataset.id);
  }
});

themeToggle.addEventListener("click", () => {
  setTheme(state.theme === "dark" ? "light" : "dark");
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.classList.remove("hidden");
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    showToast("Добавьте приложение через меню браузера");
    return;
  }

  deferredInstallPrompt.prompt();

  const result = await deferredInstallPrompt.userChoice;

  if (result.outcome === "accepted") {
    showToast("Приложение устанавливается");
  }

  deferredInstallPrompt = null;
  installButton.classList.add("hidden");
});

window.addEventListener("appinstalled", () => {
  installButton.classList.add("hidden");
  showToast("«Вне кадра» установлено");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

render();
