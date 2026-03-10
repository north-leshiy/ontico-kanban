## 1. Компонент CuratorFilter

- [x] 1.1 Создать `src/components/CuratorFilter.tsx` — принимает `curators`, `selectedIds: Set<number>`, `onToggle(id)`, `onClearAll`
- [x] 1.2 Отрендерить аватары кураторов (32px, круглые) с визуальным выделением при выборе (ring/border)
- [x] 1.3 Добавить tooltip с именем куратора (title-атрибут или CSS tooltip) при наведении
- [x] 1.4 Добавить кнопку "Все" — активна только при `selectedIds.size > 0`, кликом вызывает `onClearAll`
- [x] 1.5 Поддержать горизонтальный скролл панели если кураторов много (`overflow-x-auto`)

## 2. Интеграция в KanbanBoard

- [x] 2.1 Добавить состояние `selectedCuratorIds: Set<number>` в `KanbanBoard`
- [x] 2.2 Вычислить `filterCurators` — кураторы из `meta.curators`, чьи ID есть хотя бы в одной заявке
- [x] 2.3 Добавить `CuratorFilter` в хедер доски рядом со счётчиком заявок
- [x] 2.4 Реализовать `handleToggleCurator(id)` и `handleClearAll()` — обновляют `selectedCuratorIds`
- [x] 2.5 Применить фильтр перед группировкой: `filteredLectures = selectedCuratorIds.size === 0 ? lectures : lectures.filter(...)`
- [x] 2.6 Передавать `filteredLectures` в `lecturesByDecision`, оставить `lectures` для drag & drop оптимистичных апдейтов

## 3. Счётчики и UX

- [x] 3.1 Убедиться что счётчик в заголовке колонки отражает отфильтрованное количество карточек
- [x] 3.2 Обновить счётчик в хедере ("N заявок") — показывать отфильтрованное / общее (например "12 / 47 заявок") при активном фильтре
