### Requirement: Загрузка метаданных (get_info)
API клиент SHALL загружать метаданные через `GET /api/lectures/get_info.json?archive=0`, возвращающий список decisions, statuses, sections, curators и conferences. Результат SHALL кешироваться на время сессии.

#### Scenario: Успешная загрузка метаданных
- **WHEN** канбан-доска инициализируется
- **THEN** загружаются и доступны в памяти: массив decisions (id, variant, name), массив curators (id, name, avatar), массив conference_sections (id, name, conference_id)

#### Scenario: Ошибка сети при загрузке метаданных
- **WHEN** запрос к get_info.json завершается с ошибкой сети
- **THEN** отображается сообщение об ошибке с кнопкой "Повторить"

### Requirement: Загрузка всех заявок секции TechLead
API клиент SHALL загружать заявки через `POST /api/lectures/moderate2.json` с фильтром `sections: [10634778]` (TechLead), итерируя постранично (per_page=100) пока не будут получены все записи. Все страницы SHALL загружаться при инициализации.

#### Scenario: Загрузка одной страницы
- **WHEN** выполняется запрос страницы 1 с per_page=100
- **THEN** возвращается массив заявок с полями: id, title, speakers, decision, curator, section, status

#### Scenario: Автоматическая загрузка следующих страниц
- **WHEN** количество заявок на странице равно per_page (есть ещё данные)
- **THEN** клиент автоматически запрашивает следующую страницу и объединяет результаты

#### Scenario: Завершение пагинации
- **WHEN** количество заявок на последней странице меньше per_page
- **THEN** пагинация завершается, возвращается полный объединённый массив заявок

#### Scenario: Индикатор загрузки
- **WHEN** идёт загрузка заявок (одна или несколько страниц)
- **THEN** пользователь видит spinner/индикатор прогресса

### Requirement: Смена decision заявки
API клиент SHALL отправлять `POST /api/lectures/moderate2.json` с телом `{"set":{"id":<lectureId>,"decision":"<variant>"}}` для смены decision заявки при перетаскивании карточки.

#### Scenario: Успешная смена decision
- **WHEN** пользователь перетаскивает карточку в новую колонку и API отвечает успехом
- **THEN** карточка остаётся в новой колонке, decision заявки обновлён

#### Scenario: Ошибка при смене decision (optimistic update rollback)
- **WHEN** пользователь перетаскивает карточку в новую колонку и API отвечает ошибкой
- **THEN** карточка возвращается в исходную колонку, пользователю показывается сообщение об ошибке

### Requirement: TypeScript типы из реальных данных API
Все данные API SHALL быть типизированы TypeScript-интерфейсами, выведенными из реальных ответов в `/data/*.json`.

#### Scenario: Типизация ответа moderate2
- **WHEN** разработчик использует данные заявки из API
- **THEN** TypeScript обеспечивает автодополнение и проверку типов для полей: id, title.value, decision.variant, decision.value, speakers.speakers, curator.value, section.value, section.name
