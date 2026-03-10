### Requirement: Manifest V3 структура расширения
Расширение SHALL использовать Chrome Extension Manifest V3 с минимально необходимыми разрешениями: `host_permissions: ["*://conf.ontico.ru/*"]` для доступа к API с куками пользователя. Манифест SHALL объявлять background service worker и action.

#### Scenario: Установка расширения в developer mode
- **WHEN** пользователь открывает chrome://extensions и загружает папку расширения через "Load unpacked"
- **THEN** расширение устанавливается без ошибок и иконка появляется в тулбаре

#### Scenario: Запуск через action кнопку
- **WHEN** пользователь нажимает иконку расширения в тулбаре Chrome
- **THEN** открывается новая вкладка с канбан-доской (`kanban.html`)

### Requirement: Background Service Worker как прокси
Background service worker SHALL перехватывать сообщения от страниц расширения и проксировать их как fetch-запросы к `conf.ontico.ru/api/*` с `credentials: "include"`, используя куки текущего пользователя.

#### Scenario: Проксирование GET запроса
- **WHEN** страница расширения отправляет сообщение `{type: "FETCH", url: "...", method: "GET"}`
- **THEN** service worker выполняет fetch с credentials и возвращает JSON-ответ обратно странице

#### Scenario: Проксирование POST запроса с телом
- **WHEN** страница расширения отправляет сообщение `{type: "FETCH", url: "...", method: "POST", body: {...}}`
- **THEN** service worker выполняет POST fetch с JSON body и credentials, возвращает ответ

#### Scenario: Пользователь не авторизован
- **WHEN** API возвращает статус 401 или редирект на страницу логина
- **THEN** service worker возвращает ошибку `{error: "UNAUTHORIZED"}` и страница показывает сообщение о необходимости авторизации на conf.ontico.ru

### Requirement: Сборка через Vite
Расширение SHALL собираться командой `npm run build` через Vite с поддержкой React 19 и TypeScript. Результат сборки SHALL быть готов к загрузке как unpacked extension (папка `dist/`).

#### Scenario: Успешная сборка
- **WHEN** выполняется `npm run build`
- **THEN** в `dist/` появляются `manifest.json`, `background.js`, `kanban.html`, `popup.html` и все ассеты

#### Scenario: Hot reload при разработке
- **WHEN** выполняется `npm run dev`
- **THEN** Vite запускает dev server, изменения в src/ отражаются после перезагрузки расширения
