const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector("#themeToggle");
const installButton = document.querySelector("#installButton");

const sheetBackdrop = document.querySelector("#sheetBackdrop");
const sheetTitle = document.querySelector("#sheetTitle");
const sheetContent = document.querySelector("#sheetContent");
const sheetClose = document.querySelector("#sheetClose");

const STORAGE_KEY = "vne-kadra-state-v5";

let deferredInstallPrompt = null;

/* -------------------------------------------------------------------------- */
/* Материалы энциклопедии                                                     */
/* -------------------------------------------------------------------------- */

const articles = [
  {
    id: "camera-controls",
    title: "Фокус и экспозиция на смартфоне",
    category: "Основы",
    description:
      "Как выбрать точку фокусировки и управлять яркостью до нажатия на кнопку.",
    tags: ["основы", "камера", "новичкам"],
    audiences: ["Начинаю", "Снимаю уверенно"],
    full: {
      intro:
        "Большинство упражнений требуют двух действий: выбрать главный объект касанием и изменить яркость кадра.",
      sections: [
        {
          title: "Как сфокусироваться",
          text:
            "Наведите камеру на главный объект и коснитесь его на экране. Смартфон попробует навести резкость именно в выбранной области."
        },
        {
          title: "Как изменить яркость",
          text:
            "После касания обычно появляется значок солнца или ползунок. Проведите вниз, чтобы сделать кадр темнее, и вверх, чтобы сделать его светлее."
        },
        {
          title: "Как зафиксировать настройки",
          text:
            "На многих смартфонах нужно удерживать палец на объекте. Может появиться надпись AE/AF Lock. Название зависит от модели телефона."
        }
      ],
      steps: [
        "Поставьте предмет возле окна.",
        "Коснитесь предмета на экране.",
        "Сделайте один кадр с автоматической яркостью.",
        "Потяните регулятор яркости вниз и сделайте второй кадр.",
        "Потяните его вверх и сделайте третий кадр."
      ],
      mistakes: [
        "Фокусироваться на фоне вместо главного объекта.",
        "Делать светлые участки полностью белыми.",
        "Забывать протирать объектив перед съёмкой."
      ],
      exercise:
        "Сравните три версии. Выберите не самую яркую, а ту, где лучше сохраняются форма, фактура и настроение."
    }
  },
  {
    id: "ground-angle",
    title: "Съёмка от самой земли",
    category: "Ракурсы",
    description:
      "Низкая точка съёмки превращает обычный объект в масштабную сцену.",
    tags: ["улица", "архитектура", "любой сезон"],
    audiences: ["Начинаю", "Ищу новые идеи"],
    full: {
      intro:
        "Попробуйте опустить камеру значительно ниже уровня глаз. Даже знакомое место после этого выглядит иначе.",
      sections: [
        {
          title: "Когда это работает",
          text:
            "Приём подходит для дорог, травы, луж, лестниц, зданий и людей в движении."
        },
        {
          title: "Что искать",
          text:
            "Найдите выразительный передний план: травинку, край лужи, камень, плитку или линию дороги."
        }
      ],
      steps: [
        "Сделайте обычный кадр с высоты глаз.",
        "Присядьте и повторите фотографию.",
        "Опустите смартфон почти к земле.",
        "Если объектив расположен сверху, переверните телефон камерой вниз.",
        "Сравните, как изменилась глубина пространства."
      ],
      mistakes: [
        "Слишком много пустого неба.",
        "Передний план не связан с сюжетом.",
        "Случайно заваленный горизонт.",
        "Попытка ограничиться одним кадром."
      ],
      exercise:
        "Снимите одно место с трёх высот. Сравните не качество, а ощущение масштаба."
    }
  },
  {
    id: "window-light",
    title: "Свет из окна: три варианта",
    category: "Свет",
    description:
      "Снимите один предмет мягким, контрастным и силуэтным способом.",
    tags: ["дом", "свет", "новичкам"],
    audiences: ["Начинаю", "Снимаю уверенно"],
    full: {
      intro:
        "Одно окно может дать три совершенно разные фотографии. Положение предмета и плотность света меняют объём и настроение.",
      sections: [
        {
          title: "Мягкий свет",
          text:
            "Закройте окно тонкой занавеской или отодвиньте предмет дальше. Границы теней станут плавными."
        },
        {
          title: "Контрастный свет",
          text:
            "Уберите занавеску и поставьте предмет боком к окну. Одна сторона станет яркой, другая уйдёт в тень."
        },
        {
          title: "Силуэт",
          text:
            "Поставьте предмет между смартфоном и окном. Коснитесь светлого окна и уменьшите экспозицию."
        }
      ],
      steps: [
        "Отключите верхний свет и вспышку.",
        "Поставьте предмет возле окна.",
        "Коснитесь предмета для фокусировки.",
        "Сделайте мягкую версию через занавеску.",
        "Уберите занавеску и сделайте контрастную версию.",
        "Поставьте предмет перед окном и снимите силуэт."
      ],
      mistakes: [
        "Использовать вспышку.",
        "Не менять положение предмета.",
        "Оценивать результат только по общей яркости."
      ],
      exercise:
        "Повторите три варианта с растением, человеком или прозрачной бутылкой."
    }
  },
  {
    id: "black-white",
    title: "Чёрно-белое мышление",
    category: "Цвет",
    description:
      "Используйте монохром как способ увидеть свет, форму, ритм и контраст.",
    tags: ["монохром", "улица", "форма"],
    audiences: ["Снимаю уверенно", "Ищу новые идеи"],
    full: {
      intro:
        "Чёрно-белый кадр убирает цветовую информацию и оставляет отношения между светом, тенью, фактурой и формой.",
      sections: [
        {
          title: "Что искать",
          text:
            "Ищите разницу между светлым и тёмным, повторяющиеся формы, силуэты, фактуры и выразительные тени."
        },
        {
          title: "Как использовать фильтр",
          text:
            "Если смартфон позволяет, включите монохромный предпросмотр. Желательно сохранить и цветной оригинал для последующего сравнения."
        }
      ],
      steps: [
        "Выберите сцену с заметной разницей света и тени.",
        "Мысленно уберите цвет.",
        "Проверьте, остаётся ли понятным главный объект.",
        "Сделайте обычный и немного затемнённый варианты.",
        "Сравните форму, а не эффектность фильтра."
      ],
      mistakes: [
        "Переводить в монохром любой неудачный цветной кадр.",
        "Полностью терять детали в тенях.",
        "Добавлять чрезмерный контраст."
      ],
      exercise:
        "Снимите пять сюжетов, в которых цвет не нужен для понимания фотографии."
    }
  },
  {
    id: "reflection",
    title: "Отражение, которого не ждали",
    category: "Необычные приёмы",
    description:
      "Ищите отражения не только в воде: используйте стекло, металл и экраны.",
    tags: ["отражения", "город", "эксперимент"],
    audiences: ["Снимаю уверенно", "Ищу новые идеи"],
    full: {
      intro:
        "Отражение может стать вторым пространством в кадре. Оно добавляет слои и визуальную неоднозначность.",
      sections: [
        {
          title: "Где искать",
          text:
            "Подойдут лужи, витрины, окна транспорта, полированный металл, зеркала и выключенный экран другого смартфона."
        },
        {
          title: "Как снимать",
          text:
            "Подойдите к поверхности под разными углами. Совместите отражение с реальным объектом, а затем снимите только отражение."
        }
      ],
      steps: [
        "Найдите отражающую поверхность.",
        "Посмотрите на неё сверху, сбоку и почти на одном уровне.",
        "Найдите один главный объект в отражении.",
        "Уберите из кадра лишние яркие детали.",
        "Сделайте симметричный и намеренно несимметричный варианты."
      ],
      mistakes: [
        "Всегда снимать строго перпендикулярно поверхности.",
        "Оставлять слишком много деталей.",
        "Случайно отражать самого фотографа.",
        "Не иметь главной точки внимания."
      ],
      exercise:
        "Создайте три кадра, в которых не сразу понятно, где заканчивается реальность."
    }
  },
  {
    id: "motion-blur",
    title: "Контролируемый смаз",
    category: "Движение",
    description:
      "Сделайте размытие способом показать направление, энергию или скорость.",
    tags: ["движение", "ночь", "эксперимент"],
    audiences: ["Снимаю уверенно", "Ищу новые идеи"],
    full: {
      intro:
        "Размытие может передавать движение лучше идеальной резкости. Главное — контролировать его направление.",
      sections: [
        {
          title: "Без ручного режима",
          text:
            "Попробуйте ночной режим, съёмку в помещении или вечером. Плавно ведите смартфон вслед за движущимся объектом."
        },
        {
          title: "С ручным режимом",
          text:
            "Используйте более длинную выдержку и сделайте серию. Конкретное значение зависит от скорости объекта и освещения."
        }
      ],
      steps: [
        "Выберите движущийся объект.",
        "Сделайте один обычный кадр.",
        "Плавно проведите смартфоном вслед за объектом.",
        "Повторите движение несколько раз.",
        "Оцените серию только после завершения."
      ],
      mistakes: [
        "Дрожание камеры во всех направлениях.",
        "Отсутствие хотя бы одного узнаваемого элемента.",
        "Удаление вариантов сразу после съёмки."
      ],
      exercise:
        "Сделайте десять кадров движения и выберите тот, где смаз лучше всего передаёт направление."
    }
  },
  {
    id: "one-place",
    title: "Одно место — семь взглядов",
    category: "Творческий кризис",
    description:
      "Знакомое место не становится скучным, если менять способ наблюдения.",
    tags: ["кризис", "серия", "практика"],
    audiences: ["Возвращаю вдохновение", "Ищу новые идеи"],
    full: {
      intro:
        "Ощущение, что всё уже снято, часто означает, что повторяется не место, а привычный способ смотреть.",
      sections: [
        {
          title: "Главный принцип",
          text:
            "Не ищите семь красивых фотографий. Проверьте семь разных способов увидеть одно пространство."
        }
      ],
      steps: [
        "Снимите общий вид.",
        "Выберите одну небольшую деталь.",
        "Снимите только тени.",
        "Найдите отражение.",
        "Опустите смартфон к земле.",
        "Сделайте кадр без очевидного главного объекта.",
        "Повторите один сюжет в монохроме."
      ],
      mistakes: [
        "Оценивать результат во время съёмки.",
        "Менять место вместо способа наблюдения.",
        "Удалять фотографии сразу.",
        "Требовать от каждого варианта публикационного качества."
      ],
      exercise:
        "Оставьте серию до следующего дня. Затем выберите не самый красивый, а самый неожиданный кадр."
    }
  }
];

/* -------------------------------------------------------------------------- */
/* Задания                                                                    */
/* -------------------------------------------------------------------------- */

const tasks = [
  {
    id: "task-window",
    title: "Свет из окна",
    description:
      "Снимите один предмет мягким, контрастным и силуэтным способом.",
    place: "дом",
    period: "день",
    season: "любой сезон",
    technique: "естественный свет",
    level: "Начинающий",
    audiences: ["Начинаю", "Снимаю уверенно"],
    visual: "light",
    motivation:
      "Не меняйте предмет — меняйте свет. Так разница станет заметнее.",
    goal:
      "Понять, как направление и жёсткость света меняют объём и настроение.",
    preparation: [
      "Выберите чашку, растение, книгу или стеклянную бутылку.",
      "Поставьте предмет на стол рядом с окном.",
      "Отключите верхний свет и вспышку.",
      "Протрите объектив смартфона."
    ],
    steps: [
      "Поставьте предмет так, чтобы свет падал сбоку.",
      "Коснитесь предмета на экране для фокусировки.",
      "Закройте окно тонкой занавеской и сделайте мягкую версию.",
      "Уберите занавеску и сделайте контрастную версию.",
      "Поставьте предмет перед окном.",
      "Коснитесь светлого окна и потяните значок солнца вниз для силуэта."
    ],
    versions: [
      {
        title: "Мягкий",
        text:
          "Закройте окно тонкой занавеской или отодвиньте предмет. Тени должны стать плавными."
      },
      {
        title: "Контрастный",
        text:
          "Поставьте предмет боком к открытому окну. Не подсвечивайте тёмную сторону."
      },
      {
        title: "Силуэтный",
        text:
          "Поместите предмет перед окном. Экспозицию настройте по светлому фону."
      }
    ],
    mistakes: [
      "Использовать вспышку.",
      "Оставлять включённым яркий верхний свет.",
      "Не менять положение предмета между вариантами."
    ],
    alternatives:
      "Если нет окна, используйте настольную лампу или фонарик второго телефона. Направляйте свет сбоку.",
    challenge:
      "Повторите упражнение с прозрачным предметом или человеком."
  },
  {
    id: "task-ground",
    title: "На уровне земли",
    description:
      "Снимите знакомое место с высоты не более двадцати сантиметров.",
    place: "улица",
    period: "день",
    season: "любой сезон",
    technique: "низкий ракурс",
    level: "Начинающий",
    audiences: ["Начинаю", "Ищу новые идеи"],
    visual: "low",
    motivation:
      "Иногда новый сюжет находится не дальше, а ниже.",
    goal:
      "Понять, как высота камеры меняет масштаб и глубину пространства.",
    preparation: [
      "Выберите безопасное место: двор, парк, дорожку или подъезд.",
      "Найдите передний план: травинку, камень, лужу или плитку.",
      "Проверьте, что смартфон не окажется в воде или грязи."
    ],
    steps: [
      "Сделайте обычный кадр с высоты глаз.",
      "Присядьте и снимите тот же объект ниже.",
      "Опустите смартфон почти к земле.",
      "При необходимости переверните телефон камерой вниз.",
      "Сделайте несколько кадров с разным наклоном.",
      "Сравните ощущение масштаба."
    ],
    versions: [
      {
        title: "Обычный",
        text:
          "Снимите стоя. Этот кадр станет точкой сравнения."
      },
      {
        title: "Низкий",
        text:
          "Опустите камеру ниже колена и добавьте передний план."
      },
      {
        title: "Почти от земли",
        text:
          "Расположите объектив максимально близко к поверхности."
      }
    ],
    mistakes: [
      "Оставлять слишком много пустого неба.",
      "Заваливать горизонт без художественной причины.",
      "Использовать передний план, не связанный с сюжетом."
    ],
    alternatives:
      "Дома используйте пол, стол или лестницу. Снимите предмет с уровня поверхности.",
    challenge:
      "Сделайте три фотографии одного объекта: сверху, на уровне глаз и снизу."
  },
  {
    id: "task-shadow",
    title: "Только тени",
    description:
      "Расскажите небольшую историю, почти не показывая сам объект.",
    place: "улица",
    period: "день",
    season: "любой сезон",
    technique: "свет и тень",
    level: "Начинающий",
    audiences: [
      "Начинаю",
      "Снимаю уверенно",
      "Возвращаю вдохновение"
    ],
    visual: "shadow",
    motivation:
      "Необязательно показывать героя, чтобы зритель почувствовал его присутствие.",
    goal:
      "Научиться видеть сюжет в тенях и следах присутствия.",
    preparation: [
      "Ищите заметный направленный свет.",
      "Подойдут деревья, лестницы, люди, велосипеды и перила.",
      "Выберите простой фон без большого количества деталей."
    ],
    steps: [
      "Найдите выразительную тень.",
      "Сначала снимите только её.",
      "Добавьте в следующий кадр небольшой фрагмент объекта.",
      "Измените высоту камеры.",
      "Сделайте вертикальный и горизонтальный варианты."
    ],
    versions: [
      {
        title: "Тень как герой",
        text:
          "Настоящий объект почти полностью остаётся за границей кадра."
      },
      {
        title: "Объект и тень",
        text:
          "Покажите небольшой фрагмент объекта и его тень."
      },
      {
        title: "Абстракция",
        text:
          "Подойдите ближе, чтобы происхождение тени было неочевидным."
      }
    ],
    mistakes: [
      "Слишком много случайного фона.",
      "Тень сливается с другими пятнами.",
      "Главная форма обрезана случайно."
    ],
    alternatives:
      "Дома используйте настольную лампу, свет окна или фонарик.",
    challenge:
      "Создайте серию, где тени выглядят как самостоятельные персонажи."
  },
  {
    id: "task-five",
    title: "Только пять кадров",
    description:
      "Выберите один сюжет и разрешите себе сделать ровно пять фотографий.",
    place: "где угодно",
    period: "любое время",
    season: "любой сезон",
    technique: "осознанное ограничение",
    level: "Любой",
    audiences: [
      "Начинаю",
      "Снимаю уверенно",
      "Ищу новые идеи",
      "Возвращаю вдохновение"
    ],
    visual: "frames",
    motivation:
      "Ограничение уменьшает количество решений и освобождает внимание.",
    goal:
      "Перестать снимать случайно и начать осознанно менять подход.",
    preparation: [
      "Выберите один предмет, человека или небольшую сцену.",
      "Решите, что каждый кадр должен отличаться.",
      "Не удаляйте фотографии во время упражнения."
    ],
    steps: [
      "Кадр 1 — общий вид.",
      "Кадр 2 — подойдите ближе.",
      "Кадр 3 — измените высоту камеры.",
      "Кадр 4 — найдите тень или отражение.",
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
          "Заполните кадр только частью объекта."
      },
      {
        title: "Иной взгляд",
        text:
          "Измените ракурс, свет или способ кадрирования."
      }
    ],
    mistakes: [
      "Сделать пять почти одинаковых фотографий.",
      "Удалять варианты сразу.",
      "Считать упражнение неудачным без идеального кадра."
    ],
    alternatives:
      "Задание можно выполнить дома, по дороге или во время ожидания.",
    challenge:
      "Повторите упражнение завтра с тем же объектом, но при другом освещении."
  },
  {
    id: "task-orbit",
    title: "Обойдите предмет",
    description:
      "Оставьте предмет на месте и найдите несколько фотографий, двигаясь вокруг него.",
    place: "где угодно",
    period: "любое время",
    season: "любой сезон",
    technique: "смена точки съёмки",
    level: "Продолжающий",
    audiences: ["Снимаю уверенно", "Ищу новые идеи"],
    visual: "orbit",
    motivation:
      "Первый ракурс сообщает, что перед вами. Следующие показывают, как вы это увидели.",
    goal:
      "Научиться искать точку съёмки до использования фильтров и обработки.",
    preparation: [
      "Выберите предмет, который можно обойти.",
      "Оставьте его на одном месте.",
      "Используйте один объектив без цифрового зума."
    ],
    steps: [
      "Сделайте первый кадр прямо перед предметом.",
      "Сместитесь немного влево и повторите.",
      "Снимите предмет сбоку.",
      "Опустите смартфон ниже предмета.",
      "Поднимите смартфон выше.",
      "Выберите ракурс, где фон меньше всего мешает."
    ],
    versions: [
      {
        title: "Фронтально",
        text:
          "Покажите предмет максимально понятно."
      },
      {
        title: "Сбоку",
        text:
          "Используйте боковой свет и изменившийся фон."
      },
      {
        title: "Неожиданно",
        text:
          "Снимите сверху, снизу или через другой объект."
      }
    ],
    mistakes: [
      "Оставаться на одном месте и использовать только зум.",
      "Не обращать внимания на фон.",
      "Менять сразу и ракурс, и обработку."
    ],
    alternatives:
      "Используйте чашку, растение, стул, дерево или припаркованный велосипед.",
    challenge:
      "Соберите три кадра, которые выглядят как части одной истории."
  },
  {
    id: "task-reflection",
    title: "Второй мир",
    description:
      "Совместите настоящий объект и его отражение в одном кадре.",
    place: "улица",
    period: "день или вечер",
    season: "любой сезон",
    technique: "отражение",
    level: "Продолжающий",
    audiences: ["Снимаю уверенно", "Ищу новые идеи"],
    visual: "orbit",
    motivation:
      "Отражение не обязано повторять реальность — оно может спорить с ней.",
    goal:
      "Создать многослойную фотографию с двумя пространствами.",
    preparation: [
      "Найдите витрину, лужу, стекло или металлическую поверхность.",
      "Проверьте фон отражения.",
      "Протрите объектив."
    ],
    steps: [
      "Подойдите к поверхности под прямым углом.",
      "Затем медленно смещайтесь в сторону.",
      "Найдите момент, когда реальный объект и отражение соединяются.",
      "Коснитесь главного элемента для фокусировки.",
      "Сделайте симметричный и несимметричный варианты."
    ],
    versions: [
      {
        title: "Симметрия",
        text:
          "Разместите границу отражения по центру."
      },
      {
        title: "Слои",
        text:
          "Совместите то, что находится за стеклом, с отражением улицы."
      },
      {
        title: "Только отражение",
        text:
          "Исключите реальный объект и оставьте визуальную загадку."
      }
    ],
    mistakes: [
      "Не замечать собственное отражение.",
      "Оставлять слишком много деталей.",
      "Всегда размещать границу отражения по центру."
    ],
    alternatives:
      "Дома используйте зеркало, ложку, тёмный экран или стеклянную дверцу.",
    challenge:
      "Сделайте кадр, где зритель не сразу поймёт, что является отражением."
  }
];

/* -------------------------------------------------------------------------- */
/* Настройки и состояние                                                      */
/* -------------------------------------------------------------------------- */

const levels = [
  {
    value: "Начинаю",
    description: "Больше объяснений и базовых упражнений"
  },
  {
    value: "Снимаю уверенно",
    description: "Серии, свет, отражения и осознанная композиция"
  },
  {
    value: "Ищу новые идеи",
    description: "Эксперименты, ограничения и необычные приёмы"
  },
  {
    value: "Возвращаю вдохновение",
    description: "Мягкие задания без требования получить шедевр"
  }
];

const fontSizes = [
  {
    value: "compact",
    label: "Компактный",
    description: "Больше информации помещается на экране"
  },
  {
    value: "normal",
    label: "Обычный",
    description: "Основной размер для большинства экранов"
  },
  {
    value: "large",
    label: "Крупный",
    description: "Увеличенные инструкции и описания"
  },
  {
    value: "extra-large",
    label: "Очень крупный",
    description: "Максимально комфортное чтение"
  }
];

const placeOptions = [
  { value: "все", label: "Любое место" },
  { value: "дом", label: "Дома" },
  { value: "улица", label: "На улице" },
  { value: "где угодно", label: "Где угодно" }
];

const periodOptions = [
  { value: "все", label: "Любое время" },
  { value: "день", label: "Днём" },
  { value: "вечер", label: "Вечером" },
  { value: "ночь", label: "Ночью" }
];

const defaultState = {
  screen: "today",
  theme: "dark",
  fontSize: "normal",
  level: "Ищу новые идеи",
  dailyCount: 3,

  favorites: [],
  completedTasks: [],

  selectedTaskId: null,

  filterPlace: "все",
  filterPeriod: "все",

  learnQuery: "",
  learnCategory: "Все",

  dailyOverrides: {}
};

let state = loadState();

function loadState() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem("vne-kadra-state");

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
  return localDateKey()
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);
}

function formatDate() {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());
}

function formatLevel(level) {
  if (level === "Начинающий") return "Начинающий";
  if (level === "Продолжающий") return "Продолжающий";
  return "Любой уровень";
}

function fontLabel(value) {
  return (
    fontSizes.find((item) => item.value === value)?.label ||
    "Обычный"
  );
}

function optionLabel(options, value) {
  return (
    options.find((item) => item.value === value)?.label ||
    options[0].label
  );
}

function isFavorite(id) {
  return state.favorites.includes(id);
}

function isCompleted(id) {
  return state.completedTasks.includes(id);
}

function applyPreferences() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.font = state.fontSize;

  const themeColor = document.querySelector(
    'meta[name="theme-color"]'
  );

  if (themeColor) {
    themeColor.content =
      state.theme === "dark" ? "#11100f" : "#f4f0eb";
  }
}

function updateNavigation() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.screen === state.screen
    );
  });
}

/* -------------------------------------------------------------------------- */
/* Персонализация рекомендаций                                                */
/* -------------------------------------------------------------------------- */

function recommendedTasks() {
  const matched = tasks.filter((task) =>
    task.audiences.includes(state.level)
  );

  if (matched.length >= 3) {
    return matched;
  }

  return [
    ...matched,
    ...tasks.filter((task) => !matched.includes(task))
  ];
}

function seededOrder(items, seed) {
  return [...items].sort((first, second) => {
    const firstValue = stringSeed(`${first.id}-${seed}`);
    const secondValue = stringSeed(`${second.id}-${seed}`);

    return firstValue - secondValue;
  });
}

function stringSeed(value) {
  return value
    .split("")
    .reduce(
      (sum, character, index) =>
        sum + character.charCodeAt(0) * (index + 1),
      0
    );
}

function generatedDailyIds() {
  const ordered = seededOrder(recommendedTasks(), dateSeed());
  const selected = [];

  for (const task of ordered) {
    if (!selected.includes(task.id)) {
      selected.push(task.id);
    }

    if (selected.length === 3) {
      break;
    }
  }

  for (const task of tasks) {
    if (!selected.includes(task.id)) {
      selected.push(task.id);
    }

    if (selected.length === 3) {
      break;
    }
  }

  return selected;
}

function getDailyIds() {
  const key = localDateKey();
  const saved = state.dailyOverrides[key];

  if (Array.isArray(saved) && saved.length) {
    return [...saved];
  }

  const generated = generatedDailyIds();
  state.dailyOverrides[key] = generated;
  cleanupOldDailyOverrides();
  saveState();

  return generated;
}

function cleanupOldDailyOverrides() {
  const keys = Object.keys(state.dailyOverrides);

  if (keys.length <= 14) {
    return;
  }

  keys
    .sort()
    .slice(0, keys.length - 14)
    .forEach((key) => {
      delete state.dailyOverrides[key];
    });
}

function getDailyTasks() {
  return getDailyIds()
    .map((id) => tasks.find((task) => task.id === id))
    .filter(Boolean)
    .slice(0, state.dailyCount);
}

function mainDailyTask() {
  return (
    tasks.find((task) => task.id === getDailyIds()[0]) ||
    tasks[0]
  );
}

function currentTask() {
  return (
    tasks.find((task) => task.id === state.selectedTaskId) ||
    mainDailyTask()
  );
}

function changeDailyTask(index = 0) {
  const key = localDateKey();
  const ids = getDailyIds();

  const excluded = new Set(ids);
  const recommended = recommendedTasks();

  let available = recommended.filter(
    (task) => !excluded.has(task.id)
  );

  if (!available.length) {
    available = tasks.filter(
      (task) => task.id !== ids[index]
    );
  }

  if (!available.length) {
    return;
  }

  const selected =
    available[Math.floor(Math.random() * available.length)];

  ids[index] = selected.id;
  state.dailyOverrides[key] = ids;
  saveState();

  renderToday(true);
  showToast("Задание на сегодня изменено");
}

/* -------------------------------------------------------------------------- */
/* Основная навигация                                                         */
/* -------------------------------------------------------------------------- */

function setScreen(screen, shouldScroll = true) {
  state.screen = screen;
  saveState();
  render();

  if (shouldScroll) {
    scrollToTop();
  }
}

function openTask(taskId) {
  state.selectedTaskId = taskId;
  state.screen = "shoot";
  saveState();
  render();
  scrollToTop("auto");
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

/* -------------------------------------------------------------------------- */
/* Главная                                                                    */
/* -------------------------------------------------------------------------- */

function renderToday(animateHero = false) {
  const dailyTasks = getDailyTasks();
  const mainTask = dailyTasks[0] || mainDailyTask();
  const additionalTasks = dailyTasks.slice(1);

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <span class="date-label">${escapeHtml(formatDate())}</span>
        <h2>Смотри чуть дальше.</h2>
        <p>
          Сегодня не нужно искать идеальный сюжет. Достаточно изменить
          один привычный способ смотреть.
        </p>
      </div>

      <article class="hero-card ${
        animateHero ? "is-changing" : ""
      }">
        <div class="hero-content">
          <p class="hero-kicker">Главное задание</p>
          <h2>${escapeHtml(mainTask.title)}</h2>
          <p class="hero-description">
            ${escapeHtml(mainTask.description)}
          </p>
        </div>

        <div class="hero-footer">
          <span class="hero-meta">
            ${escapeHtml(mainTask.technique)}
          </span>

          <div class="hero-actions">
            <button
              class="primary-button"
              type="button"
              data-action="open-main-daily"
            >
              Начать
            </button>

            <button
              class="hero-change-button"
              type="button"
              data-action="change-main-daily"
              aria-label="Сменить главное задание"
              title="Сменить задание"
            >
              ↻
            </button>
          </div>
        </div>
      </article>

      ${
        additionalTasks.length
          ? `
            <div class="section-header">
              <h3>Ещё на сегодня</h3>
              <span class="date-label">
                ${dailyTasks.length} задания
              </span>
            </div>

            <div class="daily-list">
              ${additionalTasks
                .map(
                  (task) => `
                    <button
                      class="daily-mini-card"
                      type="button"
                      data-task="${escapeHtml(task.id)}"
                    >
                      <span>
                        <strong>${escapeHtml(task.title)}</strong>
                        <small>
                          ${escapeHtml(task.technique)} ·
                          ${escapeHtml(task.place)}
                        </small>
                      </span>

                      <span class="arrow">→</span>
                    </button>
                  `
                )
                .join("")}
            </div>
          `
          : ""
      }

      <div class="section-header">
        <h3>Быстрый выбор</h3>
        <button type="button" data-action="open-shoot">
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
          <small>Выбрать рекомендацию без долгих раздумий</small>
        </button>

        <button
          class="quick-card"
          type="button"
          data-action="home-task"
        >
          <span class="quick-icon">⌂</span>
          <strong>Снять дома</strong>
          <small>Практика без выхода на улицу</small>
        </button>

        <button
          class="quick-card"
          type="button"
          data-action="crisis-task"
        >
          <span class="quick-icon">↻</span>
          <strong>Нет вдохновения</strong>
          <small>Мягкое задание без требования результата</small>
        </button>

        <button
          class="quick-card"
          type="button"
          data-action="open-learn"
        >
          <span class="quick-icon">✦</span>
          <strong>Новая техника</strong>
          <small>Узнать один новый способ снимать</small>
        </button>
      </div>

      <div class="section-header">
        <h3>Небольшое наблюдение</h3>
      </div>

      <div class="info-card">
        <div class="info-card-icon">◌</div>

        <div>
          <h3>Не ищите новый мир</h3>
          <p>
            Попробуйте изменить расстояние, высоту камеры, направление
            света или способ кадрирования уже знакомого места.
          </p>
        </div>
      </div>
    </section>
  `;
}

/* -------------------------------------------------------------------------- */
/* Энциклопедия                                                               */
/* -------------------------------------------------------------------------- */

function filteredArticles() {
  const query = state.learnQuery.trim().toLowerCase();
  const category = state.learnCategory;

  return articles.filter((article) => {
    const categoryMatches =
      category === "Все" || article.category === category;

    const searchText = [
      article.title,
      article.category,
      article.description,
      article.tags.join(" ")
    ]
      .join(" ")
      .toLowerCase();

    return categoryMatches && searchText.includes(query);
  });
}

function renderLearn() {
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

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Изучать</h2>
        <p>
          Техники, объяснения и упражнения для съёмки на смартфон.
        </p>
      </div>

      <div class="search-box">
        <span class="search-icon">⌕</span>

        <input
          id="articleSearch"
          type="search"
          inputmode="search"
          autocomplete="off"
          placeholder="Найти технику или идею"
          value="${escapeHtml(state.learnQuery)}"
        />
      </div>

      <div class="chips">
        ${categories
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

      <div id="articleResults" class="article-list">
        ${renderArticleResults()}
      </div>
    </section>
  `;

  const searchInput = document.querySelector("#articleSearch");

  searchInput?.addEventListener("input", (event) => {
    state.learnQuery = event.target.value;
    saveState();

    const results = document.querySelector("#articleResults");

    if (results) {
      results.innerHTML = renderArticleResults();
    }
  });
}

function renderArticleResults() {
  const filtered = filteredArticles();

  if (!filtered.length) {
    return `
      <div class="empty-state">
        Ничего не найдено.<br />
        Попробуйте изменить запрос или категорию.
      </div>
    `;
  }

  return filtered.map(articleCard).join("");
}

function articleCard(article) {
  return `
    <button
      class="article-card"
      type="button"
      data-article="${escapeHtml(article.id)}"
    >
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
          .map(
            (tag) => `
              <span class="tag">${escapeHtml(tag)}</span>
            `
          )
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
      <button
        class="back-button"
        type="button"
        data-action="back-learn"
      >
        ← Назад к материалам
      </button>

      <div class="article-topline">
        <span class="article-category">
          ${escapeHtml(article.category)}
        </span>

        <button
          class="ghost-button"
          type="button"
          data-action="toggle-article-favorite"
          data-id="${escapeHtml(article.id)}"
        >
          ${
            isFavorite(article.id)
              ? "♥ В коллекции"
              : "♡ Сохранить"
          }
        </button>
      </div>

      <h2>${escapeHtml(article.title)}</h2>
      <p class="article-lead">${escapeHtml(full.intro)}</p>

      ${full.sections
        .map(
          (section) => `
            <section class="detail-section">
              <h3>${escapeHtml(section.title)}</h3>
              <p>${escapeHtml(section.text)}</p>
            </section>
          `
        )
        .join("")}

      <section class="detail-section">
        <h3>Пошагово</h3>
        <ol>
          ${full.steps
            .map(
              (step) => `
                <li>${escapeHtml(step)}</li>
              `
            )
            .join("")}
        </ol>
      </section>

      <section class="detail-section">
        <h3>Типичные ошибки</h3>
        <ul>
          ${full.mistakes
            .map(
              (mistake) => `
                <li>${escapeHtml(mistake)}</li>
              `
            )
            .join("")}
        </ul>
      </section>

      <section class="detail-section">
        <h3>Практика</h3>
        <div class="notice">
          ${escapeHtml(full.exercise)}
        </div>
      </section>
    </article>
  `;

  scrollToTop("auto");
}

/* -------------------------------------------------------------------------- */
/* Задания                                                                    */
/* -------------------------------------------------------------------------- */

function renderShoot() {
  const task = currentTask();
  const filtered = filteredTasks();

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Снять</h2>
        <p>
          Прочитайте инструкцию, попробуйте несколько вариантов и
          оценивайте результат только после съёмки.
        </p>
      </div>

      ${taskCardDetailed(task)}

      <div class="section-header">
        <h3>Фильтры</h3>
      </div>

      <div class="filter-row">
        <button
          class="filter-button"
          type="button"
          data-action="choose-place"
        >
          ${escapeHtml(optionLabel(placeOptions, state.filterPlace))}
        </button>

        <button
          class="filter-button"
          type="button"
          data-action="choose-period"
        >
          ${escapeHtml(optionLabel(periodOptions, state.filterPeriod))}
        </button>
      </div>

      <div class="section-header">
        <h3>Все задания</h3>
        <span class="date-label">${filtered.length}</span>
      </div>

      <div class="article-list">
        ${
          filtered.length
            ? filtered.map(taskCard).join("")
            : `
              <div class="empty-state">
                Для этих условий пока нет задания.<br />
                Измените один из фильтров.
              </div>
            `
        }
      </div>
    </section>
  `;
}

function filteredTasks() {
  return tasks.filter((task) => {
    const placeMatches =
      state.filterPlace === "все" ||
      task.place === state.filterPlace ||
      task.place === "где угодно";

    const periodMatches =
      state.filterPeriod === "все" ||
      task.period.includes(state.filterPeriod) ||
      task.period === "любое время";

    return placeMatches && periodMatches;
  });
}

function taskCardDetailed(task) {
  return `
    <article class="task-card">
      <div class="task-topline">
        <span class="task-category">
          ${escapeHtml(task.technique)}
        </span>

        ${
          isCompleted(task.id)
            ? '<span class="tag">Выполнено</span>'
            : ""
        }
      </div>

      <h2>${escapeHtml(task.title)}</h2>

      <p class="task-description">
        ${escapeHtml(task.description)}
      </p>

      <div class="task-compact-meta">
        <span>${escapeHtml(task.place)}</span>
        <span>${escapeHtml(formatLevel(task.level))}</span>
        <span>${escapeHtml(task.season)}</span>
      </div>

      ${taskVisual(task.visual)}

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

      <section class="detail-section">
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
      </section>

      <section class="detail-section">
        <h3>Типичные ошибки</h3>
        <ul>
          ${task.mistakes
            .map(
              (mistake) => `
                <li>${escapeHtml(mistake)}</li>
              `
            )
            .join("")}
        </ul>
      </section>

      <section class="detail-section">
        <h3>Если условия не подходят</h3>
        <div class="notice">
          ${escapeHtml(task.alternatives)}
        </div>
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
          data-action="complete-task"
        >
          ${
            isCompleted(task.id)
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
    <button
      class="article-card"
      type="button"
      data-task="${escapeHtml(task.id)}"
    >
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
        <span class="tag">${escapeHtml(formatLevel(task.level))}</span>
      </div>
    </button>
  `;
}

function taskVisual(type) {
  if (type === "light") {
    return `
      <div
        class="task-visual visual-light"
        aria-label="Схема бокового света из окна"
      >
        <div class="visual-window"></div>
        <div class="visual-light-ray ray-one"></div>
        <div class="visual-light-ray ray-two"></div>
        <div class="visual-light-ray ray-three"></div>
        <div class="visual-object"></div>
        <div class="visual-pot"></div>

        <div class="visual-label">
          Меняйте положение предмета относительно окна
        </div>
      </div>
    `;
  }

  if (type === "low") {
    return `
      <div
        class="task-visual visual-low"
        aria-label="Смартфон расположен возле земли"
      >
        <div class="visual-ground"></div>
        <div class="visual-phone"></div>
        <div class="visual-low-object"></div>

        <div class="visual-label">
          Опустите объектив почти до уровня поверхности
        </div>
      </div>
    `;
  }

  if (type === "shadow") {
    return `
      <div
        class="task-visual visual-shadow"
        aria-label="Свет создаёт длинную тень"
      >
        <div class="visual-shadow-source"></div>
        <div class="visual-shadow-person"></div>
        <div class="visual-shadow-shape"></div>

        <div class="visual-label">
          Снимайте не предмет, а созданную им форму
        </div>
      </div>
    `;
  }

  if (type === "frames") {
    return `
      <div
        class="task-visual"
        aria-label="Пять разных кадров"
      >
        <div class="visual-frames">
          <div class="visual-frame">1</div>
          <div class="visual-frame">2</div>
          <div class="visual-frame">3</div>
          <div class="visual-frame">4</div>
          <div class="visual-frame">5</div>
        </div>

        <div class="visual-label">
          Каждый следующий кадр должен отличаться
        </div>
      </div>
    `;
  }

  return `
    <div
      class="task-visual visual-orbit"
      aria-label="Смартфон движется вокруг предмета"
    >
      <div class="visual-path"></div>
      <div class="visual-object"></div>
      <div class="visual-pot"></div>
      <div class="visual-phone"></div>

      <div class="visual-label">
        Двигайте смартфон вокруг неподвижного объекта
      </div>
    </div>
  `;
}

function randomTask(mode = "all") {
  let available = recommendedTasks();

  if (mode === "home") {
    available = tasks.filter(
      (task) =>
        task.place === "дом" ||
        task.place === "где угодно"
    );
  }

  if (mode === "crisis") {
    available = tasks.filter(
      (task) =>
        task.audiences.includes("Возвращаю вдохновение") ||
        task.id === "task-five"
    );
  }

  if (mode === "all" && state.filterPlace !== "все") {
    available = available.filter(
      (task) =>
        task.place === state.filterPlace ||
        task.place === "где угодно"
    );
  }

  if (mode === "all" && state.filterPeriod !== "все") {
    available = available.filter(
      (task) =>
        task.period.includes(state.filterPeriod) ||
        task.period === "любое время"
    );
  }

  if (!available.length) {
    available = tasks;
  }

  const current = currentTask();
  const alternatives = available.filter(
    (task) => task.id !== current.id
  );

  const pool = alternatives.length ? alternatives : available;

  const selected =
    pool[Math.floor(Math.random() * pool.length)];

  openTask(selected.id);
}

function completeTask(taskId) {
  if (isCompleted(taskId)) {
    state.completedTasks = state.completedTasks.filter(
      (id) => id !== taskId
    );

    saveState();
    renderShoot();
    showToast("Отметка о выполнении удалена");
    return;
  }

  state.completedTasks.push(taskId);
  saveState();
  renderShoot();
  showToast("Вы попробовали новый способ смотреть");
}

/* -------------------------------------------------------------------------- */
/* Коллекция                                                                  */
/* -------------------------------------------------------------------------- */

function toggleFavorite(articleId) {
  if (isFavorite(articleId)) {
    state.favorites = state.favorites.filter(
      (id) => id !== articleId
    );

    showToast("Материал удалён из коллекции");
  } else {
    state.favorites.push(articleId);
    showToast("Материал сохранён");
  }

  saveState();
  renderArticle(articleId);
}

function renderCollection() {
  const favorites = articles.filter((article) =>
    state.favorites.includes(article.id)
  );

  const completed = tasks.filter((task) =>
    state.completedTasks.includes(task.id)
  );

  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Коллекция</h2>
        <p>
          Сохранённые материалы и пройденные практики.
        </p>
      </div>

      <div class="section-header">
        <h3>Сохранённые материалы</h3>
        <span class="date-label">${favorites.length}</span>
      </div>

      ${
        favorites.length
          ? `
            <div class="article-list">
              ${favorites.map(articleCard).join("")}
            </div>
          `
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
          ? `
            <div class="article-list">
              ${completed.map(taskCard).join("")}
            </div>
          `
          : `
            <div class="empty-state">
              Выполненные практики появятся здесь.
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
          ${completed.length ? "" : "disabled"}
        >
          Очистить выполненные задания
        </button>

        <button
          class="danger-button"
          type="button"
          data-action="clear-favorites"
          ${favorites.length ? "" : "disabled"}
        >
          Очистить сохранённые материалы
        </button>
      </div>
    </section>
  `;
}

/* -------------------------------------------------------------------------- */
/* Профиль                                                                    */
/* -------------------------------------------------------------------------- */

function renderProfile() {
  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <h2>Профиль</h2>
        <p>
          Настройте рекомендации и внешний вид приложения.
        </p>
      </div>

      <div class="profile-card">
        <div class="profile-row">
          <div class="profile-copy">
            <strong>Уровень и цель</strong>
            <small>
              Влияет на задания дня и случайные рекомендации
            </small>
          </div>

          <button
            class="setting-button"
            type="button"
            data-action="choose-level"
          >
            ${escapeHtml(state.level)}
          </button>
        </div>

        <div class="profile-row">
          <div class="profile-copy">
            <strong>Размер текста</strong>
            <small>
              Отдельная настройка для чтения инструкций
            </small>
          </div>

          <button
            class="setting-button"
            type="button"
            data-action="choose-font"
          >
            ${escapeHtml(fontLabel(state.fontSize))}
          </button>
        </div>

        <div class="profile-row">
          <div class="profile-copy">
            <strong>Заданий на сегодня</strong>
            <small>
              Сколько рекомендаций показывать на главной
            </small>
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
                    data-daily-count="${count}"
                    aria-label="${count} заданий на сегодня"
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
              Тёплый интерфейс для вечернего использования
            </small>
          </div>

          <button
            class="toggle ${
              state.theme === "dark" ? "active" : ""
            }"
            id="profileThemeToggle"
            type="button"
            aria-label="Переключить тему"
          ></button>
        </div>

        <div class="profile-row">
          <div class="profile-copy">
            <strong>Выполнено заданий</strong>
            <small>Личная практика без рейтингов</small>
          </div>

          <strong>${state.completedTasks.length}</strong>
        </div>

        <div class="profile-row">
          <div class="profile-copy">
            <strong>Сохранено материалов</strong>
            <small>Статьи для повторного изучения</small>
          </div>

          <strong>${state.favorites.length}</strong>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-icon">i</div>

        <div>
          <h3>Как работает уровень</h3>
          <p>
            Уровень меняет задания дня и случайные рекомендации.
            Полная библиотека при этом остаётся доступной.
          </p>
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
          data-action="clear-favorites"
        >
          Очистить сохранённые материалы
        </button>
      </div>
    </section>
  `;

  document
    .querySelector("#profileThemeToggle")
    ?.addEventListener("click", () => {
      state.theme =
        state.theme === "dark" ? "light" : "dark";

      saveState();
      applyPreferences();
      renderProfile();
    });
}

/* -------------------------------------------------------------------------- */
/* Нижнее окно выбора                                                        */
/* -------------------------------------------------------------------------- */

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
            option.value === currentValue ? "active" : ""
          }"
          type="button"
          data-sheet-value="${escapeHtml(option.value)}"
        >
          <span>
            <strong>
              ${escapeHtml(option.label || option.value)}
            </strong>

            ${
              option.description
                ? `
                  <small>
                    ${escapeHtml(option.description)}
                  </small>
                `
                : ""
            }
          </span>

          <span class="sheet-check">✓</span>
        </button>
      `
    )
    .join("");

  sheetBackdrop.classList.remove("hidden");
  sheetBackdrop.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");

  sheetContent.onclick = (event) => {
    const option = event.target.closest("[data-sheet-value]");

    if (!option) {
      return;
    }

    onSelect(option.dataset.sheetValue);
    closeChoiceSheet();
  };
}

function closeChoiceSheet() {
  sheetBackdrop.classList.add("hidden");
  sheetBackdrop.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sheet-open");
  sheetContent.onclick = null;
}

sheetClose.addEventListener("click", closeChoiceSheet);

sheetBackdrop.addEventListener("click", (event) => {
  if (event.target === sheetBackdrop) {
    closeChoiceSheet();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    !sheetBackdrop.classList.contains("hidden")
  ) {
    closeChoiceSheet();
  }
});

/* -------------------------------------------------------------------------- */
/* Очистка данных                                                             */
/* -------------------------------------------------------------------------- */

function clearCompleted() {
  if (!state.completedTasks.length) {
    showToast("Список выполненных заданий уже пуст");
    return;
  }

  const confirmed = window.confirm(
    "Удалить все отметки о выполненных заданиях?"
  );

  if (!confirmed) {
    return;
  }

  state.completedTasks = [];
  saveState();
  render();
  showToast("Выполненные задания очищены");
}

function clearFavorites() {
  if (!state.favorites.length) {
    showToast("Сохранённых материалов пока нет");
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
  showToast("Сохранённые материалы очищены");
}

/* -------------------------------------------------------------------------- */
/* Обработчики                                                                */
/* -------------------------------------------------------------------------- */

document.addEventListener("click", (event) => {
  const navigationButton = event.target.closest("[data-screen]");

  if (navigationButton) {
    setScreen(navigationButton.dataset.screen);
    return;
  }

  const articleButton = event.target.closest("[data-article]");

  if (articleButton) {
    renderArticle(articleButton.dataset.article);
    return;
  }

  const taskButton = event.target.closest("[data-task]");

  if (taskButton) {
    openTask(taskButton.dataset.task);
    return;
  }

  const categoryButton = event.target.closest("[data-category]");

  if (categoryButton) {
    state.learnCategory = categoryButton.dataset.category;
    saveState();
    renderLearn();
    return;
  }

  const countButton = event.target.closest("[data-daily-count]");

  if (countButton) {
    state.dailyCount = Number(countButton.dataset.dailyCount);
    saveState();
    renderProfile();
    showToast("Количество заданий изменено");
    return;
  }

  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const action = actionButton.dataset.action;

  if (action === "open-main-daily") {
    openTask(mainDailyTask().id);
  }

  if (action === "change-main-daily") {
    changeDailyTask(0);
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

  if (action === "clear-completed") {
    clearCompleted();
  }

  if (action === "clear-favorites") {
    clearFavorites();
  }

  if (action === "choose-level") {
    openChoiceSheet({
      title: "Уровень и цель",
      options: levels.map((item) => ({
        value: item.value,
        label: item.value,
        description: item.description
      })),
      currentValue: state.level,
      onSelect(value) {
        state.level = value;

        /*
         * Сбрасываем набор текущего дня, чтобы влияние нового уровня
         * было заметно сразу.
         */
        delete state.dailyOverrides[localDateKey()];

        saveState();
        renderProfile();
        showToast("Рекомендации обновлены");
      }
    });
  }

  if (action === "choose-font") {
    openChoiceSheet({
      title: "Размер текста",
      options: fontSizes,
      currentValue: state.fontSize,
      onSelect(value) {
        state.fontSize = value;
        saveState();
        applyPreferences();
        renderProfile();
        showToast("Размер текста изменён");
      }
    });
  }

  if (action === "choose-place") {
    openChoiceSheet({
      title: "Где снимать",
      options: placeOptions,
      currentValue: state.filterPlace,
      onSelect(value) {
        state.filterPlace = value;
        saveState();
        renderShoot();
      }
    });
  }

  if (action === "choose-period") {
    openChoiceSheet({
      title: "Когда снимать",
      options: periodOptions,
      currentValue: state.filterPeriod,
      onSelect(value) {
        state.filterPeriod = value;
        saveState();
        renderShoot();
      }
    });
  }
});

themeToggle.addEventListener("click", () => {
  state.theme =
    state.theme === "dark" ? "light" : "dark";

  saveState();
  applyPreferences();
  render();
});

/* -------------------------------------------------------------------------- */
/* Установка PWA                                                              */
/* -------------------------------------------------------------------------- */

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.classList.remove("hidden");
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    showToast(
      "Откройте меню браузера и выберите установку приложения"
    );

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
  deferredInstallPrompt = null;
  installButton.classList.add("hidden");
  showToast("«Вне кадра» установлено");
});

/* -------------------------------------------------------------------------- */
/* Service Worker                                                             */
/* -------------------------------------------------------------------------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration =
        await navigator.serviceWorker.register("./sw.js");

      registration.update();
    } catch (error) {
      console.warn(
        "Не удалось зарегистрировать Service Worker:",
        error
      );
    }
  });

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => {
      if (sessionStorage.getItem("vne-kadra-reloaded")) {
        return;
      }

      sessionStorage.setItem("vne-kadra-reloaded", "true");
      window.location.reload();
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Запуск                                                                     */
/* -------------------------------------------------------------------------- */

applyPreferences();
render();
