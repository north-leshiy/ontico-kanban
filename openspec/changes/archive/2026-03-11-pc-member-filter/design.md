## Context

Канбан-доска (`KanbanBoard.tsx`) уже загружает метаданные через `get_info`, включая массив `curators` (id, name, avatar). Карточки (`LectureCard`) уже отображают аватары назначенных кураторов. Новых API-запросов не требуется — вся нужная информация уже есть в памяти.

Текущий рендер: `lectures` → фильтр по секции (TechLead, в `api/client.ts`) → группировка по `decision.variant` → колонки.

## Goals / Non-Goals

**Goals:**
- Панель фильтра по кураторам в хедере доски (список аватаров из реально присутствующих на карточках)
- Мультиселект: клик по аватару переключает его выбор, можно выбрать несколько (OR-логика)
- При активном фильтре скрываются карточки без ни одного из выбранных кураторов
- Сброс фильтра — клик по выбранному куратору или отдельная кнопка "Все"

**Non-Goals:**
- Персистентность фильтра между сессиями (localStorage/URL)
- Фильтрация по другим полям (секция, статус)
- Серверная фильтрация

## Decisions

### 1. Состояние фильтра — в `KanbanBoard`

Состояние `selectedCuratorIds: Set<number>` хранится в `KanbanBoard`. Пробрасывается в `CuratorFilter` и применяется при построении `lecturesByDecision`.

Альтернатива: Context/Zustand — избыточно для одного простого состояния.

### 2. Список кураторов для фильтра — только реально назначенные

Вместо всех кураторов из `meta.curators` показываем только тех, чьи ID встречаются хотя бы в одной заявке (`lecturer.curator.value`). Это убирает "мёртвые" кнопки.

```ts
const activeCuratorIds = new Set(lectures.flatMap(l => l.curator.value))
const filterCurators = meta.curators.filter(c => activeCuratorIds.has(c.id))
```

### 3. Компонент `CuratorFilter` — чистый presentational

Принимает `curators`, `selectedIds`, `onToggle`, `onClearAll`. Без внутреннего состояния — управляется родителем.

### 4. Фильтрация — перед группировкой по decision

```ts
const filtered = selectedCuratorIds.size === 0
  ? lectures
  : lectures.filter(l => l.curator.value.some(id => selectedCuratorIds.has(id)))
```

Затем `filtered` → `lecturesByDecision`. Drag & drop работает с `lectures` (оригинал), не с `filtered`, чтобы не ломать оптимистичные апдейты.

## Risks / Trade-offs

- **Curator.value пустой массив** → карточка скрывается при любом активном фильтре. Ожидаемое поведение.
- **Много кураторов** → панель фильтра может переполниться. Митигация: горизонтальный скролл в хедере или `max-w` с `overflow-x-auto`.
- **Drag & Drop + фильтр**: карточка перетащена в другую колонку, оптимистичный апдейт делается на `lectures`, а не `filtered` → корректно, карточка останется скрытой если фильтр активен.
