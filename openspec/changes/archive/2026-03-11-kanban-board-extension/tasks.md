## 1. Исследование API смены decision

- [x] 1.1 Открыть оригинальный интерфейс conf.ontico.ru/lectures/review, открыть DevTools Network
- [x] 1.2 Вручную сменить decision любой заявки и зафиксировать URL, метод и тело запроса
- [x] 1.3 Добавить найденный эндпоинт в спецификацию api-client и design.md

> **Результат:** `POST /api/lectures/moderate2.json` с телом `{"set":{"id":<lectureId>,"decision":"<variant>"}}`

## 2. Инициализация проекта

- [x] 2.1 Создать проект: `npm create vite@latest . -- --template react-ts`
- [x] 2.2 Установить зависимости: `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities tailwindcss @tailwindcss/vite`
- [x] 2.3 Настроить Tailwind CSS (tailwind.config.ts, подключить в main.css)
- [x] 2.4 Настроить Vite для multi-page build (kanban.html + popup.html как отдельные entry points)
- [x] 2.5 Настроить TypeScript strict mode

## 3. Структура расширения (extension-shell)

- [x] 3.1 Создать `manifest.json` (MV3): name, version, permissions, host_permissions, background service worker, action
- [x] 3.2 Создать `popup.html` + `src/popup.ts` — открывает `kanban.html` в новой вкладке через `chrome.tabs.create`
- [x] 3.3 Создать `src/background.ts` — service worker с обработчиком `chrome.runtime.onMessage`
- [x] 3.4 Реализовать FETCH handler в background: принимает `{type, url, method, body}`, делает fetch с `credentials: include`, возвращает JSON
- [x] 3.5 Обработать 401/redirect в background worker, возвращать `{error: "UNAUTHORIZED"}`
- [x] 3.6 Проверить сборку: `npm run build`, убедиться что `dist/` содержит все нужные файлы
- [ ] 3.7 Загрузить через chrome://extensions → Load unpacked, убедиться что расширение работает без ошибок

## 4. TypeScript типы из API данных

- [x] 4.1 Создать `src/types/api.ts` с интерфейсами на основе `/data/get_info.json`: `GetInfoResponse`, `Decision`, `Curator`, `ConferenceSection`
- [x] 4.2 Создать интерфейсы из `/data/moderate2.json`: `LecturesResponse`, `Lecture`, `LectureField`, `Speaker`

## 5. API клиент (api-client)

- [x] 5.1 Создать `src/api/client.ts` — функция `sendMessage(msg)` обертка над `chrome.runtime.sendMessage` с типами
- [x] 5.2 Реализовать `fetchGetInfo(): Promise<GetInfoResult>` — GET get_info.json, кеш в памяти
- [x] 5.3 Реализовать `fetchLecturesPage(page, filters)` — POST moderate2.json для одной страницы
- [x] 5.4 Реализовать `fetchAllTechLeadLectures()` — итерация страниц пока `lectures.length === per_page`, фильтр `sections: [10634778]`
- [x] 5.5 Реализовать `setDecision(lectureId, decisionVariant)` — API вызов смены decision (эндпоинт из задачи 1.2)
- [x] 5.6 Обернуть все функции в try/catch с типизированными ошибками

## 6. Канбан-доска (kanban-board)

- [x] 6.1 Создать `src/KanbanBoard.tsx` — корневой компонент, хранит state: метаданные + заявки
- [x] 6.2 Реализовать загрузку данных в `useEffect`: сначала getInfo, потом все заявки
- [x] 6.3 Создать `src/components/LoadingScreen.tsx` — полноэкранный spinner
- [x] 6.4 Создать `src/components/ErrorScreen.tsx` — ошибка с кнопкой Повторить и инструкцией авторизации
- [x] 6.5 Создать `src/components/KanbanColumn.tsx` — колонка с заголовком (название decision + счётчик карточек), scroll внутри
- [x] 6.6 Настроить `DndContext` из @dnd-kit/core на уровне KanbanBoard
- [x] 6.7 Реализовать обработчик `onDragEnd`: определить исходную и целевую колонку, вызвать setDecision, optimistic update state
- [x] 6.8 Реализовать rollback state при ошибке API в onDragEnd
- [x] 6.9 Добавить визуальный highlight целевой колонки при drag over (useDroppable)
- [x] 6.10 Убедиться что горизонтальный скролл работает, колонки занимают всю высоту viewport

## 7. Карточка заявки (lecture-card)

- [x] 7.1 Создать `src/components/LectureCard.tsx` — принимает `lecture` и `curators` (из метаданных)
- [x] 7.2 Отобразить название (`title.value`) с CSS line-clamp-3 и title-атрибутом для tooltip
- [x] 7.3 Отобразить имя основного спикера (is_main: true или первый)
- [x] 7.4 Реализовать avatar stack: круглые аватары 32x32 с перекрытием, по ID из `curator.value`
- [x] 7.5 Реализовать fallback аватара: если `avatar` пустой — круг с инициалами куратора
- [x] 7.6 Добавить title-атрибут на каждый аватар с именем куратора
- [x] 7.7 Обернуть карточку в `useDraggable` из @dnd-kit/core
- [x] 7.8 Добавить hover стиль (box-shadow или border) через Tailwind

## 8. Интеграционная проверка

- [x] 8.1 Собрать расширение (`npm run build`), загрузить в Chrome
- [ ] 8.2 Авторизоваться на conf.ontico.ru, открыть расширение
- [ ] 8.3 Убедиться что заявки TechLead загружаются и распределены по колонкам
- [ ] 8.4 Перетащить карточку в другую колонку, убедиться что decision меняется через API
- [ ] 8.5 Проверить rollback при ошибке (временно сломать URL в background worker)
- [ ] 8.6 Проверить отображение кураторов на карточках
