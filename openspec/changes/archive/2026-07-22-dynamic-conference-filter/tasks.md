## 1. Хранение выбора

- [x] 1.1 Добавить разрешение `storage` в `public/manifest.json`
- [x] 1.2 Создать `src/storage/preferences.ts` с типом `BoardPreferences { conferenceId: number | null; sectionId: number | null }`
- [x] 1.3 Реализовать `loadPreferences(): Promise<BoardPreferences | null>` — возвращает `null`, если ключа нет или чтение бросило исключение
- [x] 1.4 Реализовать `savePreferences(prefs: BoardPreferences): Promise<void>` — глушит ошибки записи

## 2. API-клиент

- [x] 2.1 Изменить сигнатуру `fetchAllLectures` на `fetchAllLectures(filters: { conferenceIds: number[]; sectionIds: number[] })`
- [x] 2.2 Прокинуть `conferenceIds` в `filters.conferences` тела запроса `moderate2` в `fetchLecturesPage`

## 3. Выбор конференции и секции

- [x] 3.1 Создать `src/selection/resolveSelection.ts` — чистая функция валидации сохранённого выбора против `GetInfoResult`: возвращает восстановленный выбор либо дефолт (первая конференция, `sectionId: null`), сбрасывает секцию при несовпадении `conference_id`
- [x] 3.2 Обработать случай пустого `conferences` — вернуть `{ conferenceId: null, sectionId: null }`
- [x] 3.3 Создать `src/components/ConferenceFilter.tsx` — два `<select>` со стилями существующего селектора секции из `KanbanBoard.tsx`
- [x] 3.4 Реализовать в нём плоский список секций при выбранной конференции и `<optgroup>` по конференциям в режиме «Все конференции»

## 4. Интеграция в доску

- [x] 4.1 Удалить константу `TECHLEAD_SECTION_ID` и инлайновый `<select>` секций из `KanbanBoard.tsx`
- [x] 4.2 Ввести состояние `selectedConferenceId` и `selectedSectionId`, разделить инициализацию: `fetchGetInfo()` → `resolveSelection()` → `fetchAllLectures()`, оба шага под одним состоянием `loading`
- [x] 4.3 Реализовать `handleConferenceChange` — меняет конференцию, сбрасывает секцию и `selectedCuratorIds`, сохраняет выбор, перезагружает заявки
- [x] 4.4 Реализовать `handleSectionChange` — меняет секцию, сбрасывает `selectedCuratorIds`, сохраняет выбор, перезагружает заявки
- [x] 4.5 Передать текущий выбор в `onRetry` экрана ошибки

## 5. Проверка

- [x] 5.1 Прогнать `npm run build` и убедиться в отсутствии ошибок типов
- [x] 5.2 Проверить в браузере: первый запуск без сохранённого выбора, восстановление после перезагрузки доски, режим «Все конференции» с `<optgroup>`, откат при несуществующей конференции в storage
- [x] 5.3 Обновить `openspec/specs/api-client/spec.md` и `openspec/specs/kanban-board/spec.md`, убрав упоминания секции TechLead из разделов Purpose
