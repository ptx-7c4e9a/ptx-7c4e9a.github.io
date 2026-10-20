# Локальная дизайн-система прототипов

Источник — Figma `zRLM56kfYe5yTjNEy5GtZW`. Этот слой используется обоими КЛК и ЕКТП; исходная Figma не изменялась. Прямые пользовательские уточнения записываются в `orchestration/code-review-2026-10-16/comments.json` и имеют приоритет над прежними снимками.

| Основа / компонент | Живой источник | Реализация |
| --- | --- | --- |
| Цвета Light/Dark | 217 semantic color variables; `source-evidence/semantic-colors-live-2026-10-16.json` | `src/tokens.css` |
| Типографика | Display/Heading — Exo 2; Body — Open Sans; Figma text styles прочитаны16.10 | `typography.css`; файлы из `C:/MEGA/AtomicSystem/Fonts` |
| SelectField | [2537:41609](https://www.figma.com/design/zRLM56kfYe5yTjNEy5GtZW/Design-System?node-id=2537-41609) | `src/ui/Select.tsx`, combobox/listbox, клавиатура, портал |
| DatePickerField / InputBase | [2237:81959](https://www.figma.com/design/zRLM56kfYe5yTjNEy5GtZW/Design-System?node-id=2237-81959),2141:28060 | `DateTimeField.tsx`, `TimeNumber.tsx`; Focus1.5px внутри, без внешнего зазора |
| Scrollbar | [799:24033](https://www.figma.com/design/zRLM56kfYe5yTjNEy5GtZW/Design-System?node-id=799-24033) | ширина4px, radius1px, прозрачный track; три состояния Subdued/Secondary |
| IconSwap / Chevron | [294:4619](https://www.figma.com/design/zRLM56kfYe5yTjNEy5GtZW/Design-System?node-id=294-4619),442:43452 | исходные SVG, размер glyph ограничен собственным root; Hover/Pressed — Brand/Primary; без фоновой плашки |
| Switch | [410:14259](https://www.figma.com/design/zRLM56kfYe5yTjNEy5GtZW/Design-System?node-id=410-14259) | M36×20, thumb16, состояния/тема через native semantic tokens |
| Checkbox | [441:11033](https://www.figma.com/design/zRLM56kfYe5yTjNEy5GtZW/Design-System?node-id=441-11033) | M20×20,R4; native Check SVG; checked/hover/pressed |
| Button | [320:4956](https://www.figma.com/design/zRLM56kfYe5yTjNEy5GtZW/Design-System?node-id=320-4956) | размеры M40/L48; primary, gray, outline1.5px внутри, text tertiary |
| Выбор периода C316–C318 | Прямое уточнение пользователя 20.10.2026 | `PeriodControl.tsx`: одна Outline-кнопка; при сбросе одна общая поверхность и два прозрачных действия, общий hover и одна рамка. Редактируемые DatePicker находятся внутри диалога. Без сброса внешнего контейнера нет. |
| UploadField | [917:45360](https://www.figma.com/design/zRLM56kfYe5yTjNEy5GtZW/Design-System?node-id=917-45360) | `UploadField.tsx`; label/dropzone/file metadata; системный input скрыт |
| Popover / User menu | [2538:45320](https://www.figma.com/design/zRLM56kfYe5yTjNEy5GtZW/Design-System?node-id=2538-45320),12303:47128 | `ActionPopover.tsx`, `UserMenu.tsx`; outside/Escape, клавиатура |
| Modal / Overlay | 12343:2571; Import12493:20209 | `Modal`, фокус/Escape; scrim и blur12; импорт600/pad24/R32 |
| Таблица | product frames KLK/EKTP | `DataTable.tsx`: один набор колонок; ширина по всему dataset, сохраняется при сортировке/страницах |

`components.css` содержит общий внешний вид и состояния. Продуктовые компоновки остаются в `style.css`, данные — в отдельных fixture JSON. Варианты, не используемые сценариями прототипов, не объявляются реализованными автоматически.

Ограничения: Upload показывает выбор/удаление локального файла и скачивание шаблона; действие бизнес-загрузки остаётся заглушкой без подключения сервиса. Постоянные заглушки сохраняют обычный визуальный вид и `aria-disabled`; зависимые состояния (нет файла, предел карты, недоступная страница) используют настоящий disabled. Декоративные source-анимации имеют отдельный контроль хешей.

Проверки браузера и актуальные ограничения фиксируются в `prototype-app/qa/spacing-2026-10-16`, общий статус — в pipeline. Наличие CSS или успешный build не заменяют визуальную проверку.


16.10.2026, C82: все линейные интерфейсные иконки имеют stroke1.5px. Общий Icon рендерит исходные SVG с currentColor и vector-effect=non-scaling-stroke: изменение слота не меняет толщину. Filled-геометрия сохраняет исходный контур; логотипы, 3D и иллюстрации не переводятся в линейные пиктограммы. Реестр35 используемых UI SVG: source-evidence/icon-stroke-2026-10-16.json. Unicode-шевроны в связанных карточках заменены native Icon; слот24px, без растягивания текстовыми flex-правилами.

SegmentedControl L: source13193:61045 / Item13193:61141–61153, R8/pad4/gap4, itemR4/pad4 12. Панель зон: оба сегмента Fill1:1, отступ до списка16px. Hover/pressed дополнены semantic interaction tokens по прямому поручению C79; в прочитанных source-вариантах Default/Hover/Pressed нет различимого фонового fill, это явно зафиксированное расширение поведения в коде.
#17.10.2026 — скругления в локальном коде

Округлённые HTML-элементы приложения используют `src/ui/Smooth.tsx`: `figma-squircle1.1.0`, `cornerSmoothing:1`, `preserveSmoothing:true`. Это явныеReactintrinsic-элементы с прежнимиDOMтегами иforwardRef; одинResizeObserver следит только за зарегистрированными владельцами. Документ целиком не сканируется; MutationObserver нет. Круглые аватары/точки/кластеры сохраняют круг. UIпоставщика карты и sourceSVGmotion не переоформляются.

Контуры сохраняют внешнюю область для теней,focus и вложенныхpopover. Поля с общимконтейнером рисуют однуобводку владельца; внутреннийinput прозрачен и не рисуетвторуюобводку. НовыеReactповерхности и controls добавлять черезSmooth, включая button/input/section/div. Не возвращать отклонённый глобальныйSmoothCorners.

