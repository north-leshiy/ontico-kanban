## Context

Текущий интерфейс conf.ontico.ru/lectures/review — SPA на неизвестном фреймворке, показывает заявки в виде таблицы. API публично не задокументировано, но доступно через тот же origin и использует сессионные куки браузера. Два ключевых эндпоинта:
- `GET /api/lectures/get_info.json?archive=0` — метаданные (decisions, statuses, sections, curators, conferences)
- `POST /api/lectures/moderate2.json?page=1&per_page=20&archive=0` — постраничный список заявок с фильтрами

Члены ПК работают каждый со своим аккаунтом. Расширение должно работать «из коробки» без доп. конфигурации, используя уже залогиненную сессию.

## Goals / Non-Goals

**Goals:**
- Канбан-доска для заявок секции TechLead с drag & drop для смены decision
- Работает за счёт session cookies пользователя (нет необходимости хранить токены)
- Все страницы заявок загружаются автоматически (пагинация transparent для пользователя)
- Аватары кураторов на карточке
- Установка расширения через `chrome://extensions` в developer mode (без публикации в Chrome Web Store)

**Non-Goals:**
- Другие секции кроме TechLead
- Мобильные браузеры
- Другие браузеры кроме Chrome/Chromium
- Редактирование заявки, комментарии, голосование
- Оффлайн-режим
- Публикация в Chrome Web Store

## Decisions

### D1: Background Service Worker как прокси для API

**Решение:** Все запросы к `conf.ontico.ru/api/*` делаются из background service worker, а не из страницы расширения.

**Почему:** Страница расширения (`chrome-extension://…`) и `conf.ontico.ru` — разные origins. Без service worker CORS заблокирует запросы. Service worker с `host_permissions: ["*://conf.ontico.ru/*"]` имеет доступ к API с куками пользователя через `fetch` с `credentials: "include"`.

**Альтернатива:** Content script на странице conf.ontico.ru — более сложно, требует navigation на оригинальный сайт.

**Коммуникация:** Страница ↔ Service Worker через `chrome.runtime.sendMessage` / `chrome.runtime.onMessage`.

---

### D2: @dnd-kit для drag & drop

**Решение:** Используем `@dnd-kit/core` + `@dnd-kit/sortable`.

**Почему:** Активно поддерживается, работает с React 19, accessibility из коробки, не требует устаревших API (в отличие от react-beautiful-dnd, который несовместим с React 18+).

**Альтернатива:** `react-beautiful-dnd` — заброшен, несовместим с React 18 StrictMode.

---

### D3: Новая вкладка расширения (chrome_url_overrides или action popup)

**Решение:** Расширение открывает dedicated page через `chrome.action` (кнопка в тулбаре → открывает `index.html` в новой вкладке через `chrome.tabs.create`).

**Почему:** Канбан-доска требует полного экрана. Popup слишком мал. Override `new tab` было бы навязчиво.

**Реализация:** `manifest.json` → `action.default_popup: "popup.html"`, где `popup.html` — минимальный скрипт, открывающий `kanban.html` в новой вкладке.

---

### D4: Колонки канбана — поле `decision`, не `status`

**Решение:** Колонки определяются из `decisions` массива из `get_info.json` (8 значений: Подан, Созвон с куратором, Доработка, К обсуждению, К принятию, Приняли, К отклонению, Отклонили).

**Почему:** В данных заявки `decision` — редактируемое поле (`mode: "edit"`), тогда как `status` — вычисляемое (`mode: "show"`). Смена decision = действие пользователя ПК.

---

### D5: Смена decision — POST к тому же moderate2.json

**Решение:** При drop карточки в новую колонку отправляем `POST /api/lectures/moderate2.json` с телом `{"set":{"id":<lectureId>,"decision":"<variant>"}}`.

**Верифицировано:** эндпоинт подтверждён через DevTools при ручной смене decision в оригинальном интерфейсе.

**Откат:** Если запрос упал, карточка возвращается в исходную колонку (optimistic update с rollback).

---

### D6: Загрузка всех страниц

**Решение:** При инициализации загружаем все страницы `moderate2.json` последовательно (per_page=100, пока `lectures.length === per_page`), фильтруем по `section.value === 10634778` (TechLead).

**Почему:** API не поддерживает фильтр по секции на стороне сервера (фильтр sections в body принимает массив id, можно использовать). Передаём `sections: [10634778]` в фильтрах для оптимизации.

## Risks / Trade-offs

- **[Risk] Неизвестный URL смены decision** → Верифицировать через DevTools Network tab при ручной смене в оригинальном интерфейсе перед реализацией. Добавить в задачи как первый шаг.
- **[Risk] API может измениться** → Нет официальных гарантий стабильности API. Митигация: минимальная зависимость от структуры ответа, TypeScript типы из реальных данных.
- **[Risk] Service worker может быть выгружен браузером** → Используем `chrome.runtime.onMessage` корректно, не храним state в глобальных переменных service worker.
- **[Trade-off] Фильтр на клиенте vs сервере** → Передаём `sections: [10634778]` в теле запроса, сервер должен фильтровать. Если не поддерживается — фильтруем на клиенте (незначительная лишняя нагрузка).
- **[Trade-off] Нет публикации в Web Store** → Developer mode достаточен для внутреннего использования в ПК.

## Open Questions

1. Точный API endpoint для смены decision заявки — нужно выяснить через DevTools при работе с оригинальным интерфейсом.
2. Нужна ли авторизационная проверка в расширении (перенаправление на логин если кука истекла)?
3. Нужны ли уведомления об успешной смене статуса (toast/snackbar)?
