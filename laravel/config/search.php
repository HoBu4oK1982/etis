<?php

return [
    /*
    | Локали. У etis.kz один язык — русский. Оставлено массивом, чтобы
    | легко расширить, если появится казахский/английский.
    */
    'locales' => ['ru'],

    /*
    | Веса полей при ранжировании.
    | body почти не влияет на быстрые подсказки — иначе по запросу "радиатор"
    | всплывают товары, где радиатор просто упомянут в описании услуги.
    */
    'field_weights' => [
        'title' => 8.0,
        'keywords' => 4.0,
        'body' => 0.35,
    ],

    /*
    | Множители вклада по качеству совпадения токена.
    */
    'match_scores' => [
        'exact' => 1.0,    // точное совпадение основы
        'prefix' => 0.65,  // запрос — префикс слова (autocomplete)
        'fuzzy' => 0.45,   // опечатка (Левенштейн ≤ порога)
        'trigram' => 0.3,  // частичное совпадение по триграммам
    ],

    /*
    | Бонусы (добавляются к итоговому score).
    */
    'boosts' => [
        'exact_title' => 14.0,
        'exact_phrase_in_title' => 10.0,
        'title_starts_with' => 5.0,
        'exact_phrase_in_strict' => 4.0,
        'strict_starts_with' => 2.0,
        'all_tokens' => 3.0,
        'in_stock' => 1.5,
        'popularity_max' => 3.0,
    ],

    /*
    | Быстрые подсказки в шапке.
    | strict-режим: только title + keywords (SKU/brand/category/meta_keywords).
    | body отключён — не тянет ложные совпадения из длинных описаний.
    */
    'suggest' => [
        'min_score' => 4.0,
        'strict_fields' => ['title', 'keywords'],
        'strict_candidates' => true,
        'strict_drop_body_matches' => true,
        'hide_body_only_types' => ['product'],
        'preferred_types' => ['category', 'product', 'brand', 'article'],
    ],

    /*
    | Полная страница поиска — description/body участвуют, чтобы находились
    | товары по наполнению карточек и статьи по содержимому.
    */
    'full' => [
        'min_score' => 0.5,
        'hide_body_only_types' => [],
        'body_only_multiplier' => 0.38,
    ],

    /*
    | Ручные приоритеты для ключевых категорий etis.kz.
    | Сработает, если запрос содержит один из query, а документ подходит
    | по type + title_contains.
    */
    'manual_priorities' => [
        [
            'query' => ['котел', 'котёл', 'котлы', 'котлов', 'boiler', 'baxi', 'ariston', 'buderus', 'vaillant', 'protherm'],
            'type' => ['category', 'product'],
            'title_contains' => ['котел', 'котёл', 'boiler', 'baxi', 'ariston', 'buderus', 'vaillant', 'protherm'],
            'boost' => 28.0,
        ],
        [
            'query' => ['радиатор', 'радиаторы', 'батарея', 'батареи', 'radiator', 'kermi', 'purmo', 'global'],
            'type' => ['category', 'product'],
            'title_contains' => ['радиатор', 'батарея', 'radiator', 'kermi', 'purmo', 'global'],
            'boost' => 26.0,
        ],
        [
            'query' => ['кондиционер', 'сплит', 'сплит-система', 'сплит система', 'air conditioner', 'daikin', 'mitsubishi', 'gree', 'haier', 'lg', 'samsung'],
            'type' => ['category', 'product'],
            'title_contains' => ['кондиционер', 'сплит', 'daikin', 'mitsubishi', 'gree', 'haier'],
            'boost' => 26.0,
        ],
        [
            'query' => ['тепловой насос', 'теплонасос', 'heat pump', 'geo'],
            'type' => ['category', 'product'],
            'title_contains' => ['тепловой насос', 'теплонасос', 'heat pump'],
            'boost' => 24.0,
        ],
        [
            'query' => ['насос', 'циркуляционный', 'grundfos', 'wilo', 'dab'],
            'type' => ['category', 'product'],
            'title_contains' => ['насос', 'grundfos', 'wilo', 'dab'],
            'boost' => 22.0,
        ],
        [
            'query' => ['конвектор', 'convector'],
            'type' => ['category', 'product'],
            'title_contains' => ['конвектор', 'convector'],
            'boost' => 22.0,
        ],
        [
            'query' => ['теплый пол', 'тёплый пол', 'underfloor', 'devi', 'nexans'],
            'type' => ['category', 'product'],
            'title_contains' => ['теплый пол', 'тёплый пол', 'underfloor', 'devi'],
            'boost' => 22.0,
        ],
        [
            'query' => ['горелка', 'burner', 'baltur', 'weishaupt', 'riello'],
            'type' => ['category', 'product'],
            'title_contains' => ['горелка', 'burner', 'baltur', 'weishaupt', 'riello'],
            'boost' => 20.0,
        ],
        [
            'query' => ['труба', 'трубы', 'фитинг', 'фитинги', 'валтек', 'valtec', 'rehau'],
            'type' => ['category', 'product'],
            'title_contains' => ['труба', 'трубы', 'фитинг', 'valtec', 'rehau'],
            'boost' => 18.0,
        ],
    ],

    /*
    | Приоритет типов сущностей для общей выдачи.
    | В коммерческом каталоге etis.kz товар → категория → бренд → статья.
    */
    'type_weights' => [
        'product'  => 1.75,
        'category' => 1.35,
        'brand'    => 1.25,
        'article'  => 0.58,
    ],

    /*
    | Жёсткий порядок типов при равной/близкой релевантности.
    */
    'type_priority' => [
        'product'  => 100,
        'category' => 80,
        'brand'    => 65,
        'article'  => 35,
    ],

    /*
    | Fuzzy: максимальное расстояние Левенштейна в зависимости от длины слова.
    */
    'fuzzy' => [
        'min_word_len' => 3,
        'distance_by_len' => [
            4 => 1,
            7 => 2,
            999 => 2,
        ],
        'trigram_threshold' => 0.34,
    ],

    /*
    | Кандидатов из БД на доскоринг в PHP.
    */
    'candidate_limit' => 500,

    /*
    | Стоп-слова — не участвуют в ранжировании.
    */
    'stopwords' => [
        'и', 'в', 'во', 'на', 'с', 'со', 'для', 'по', 'от', 'из', 'к', 'у', 'за', 'под', 'над', 'или',
        'the', 'a', 'an', 'of', 'for', 'and', 'or', 'with', 'to', 'in',
    ],

    /*
    | Синонимы: каждая строка — группа взаимозаменяемых слов/фраз.
    | Первый элемент — каноническая форма. Тематика etis.kz —
    | отопление / кондиционирование / водоснабжение / инженерка.
    */
    'synonyms' => [
        // === ОТОПЛЕНИЕ ===
        ['котел', 'котёл', 'boiler'],
        ['газовый котел', 'газовый котёл', 'gas boiler'],
        ['электрический котел', 'электрокотел', 'электрический котёл', 'electric boiler'],
        ['твердотопливный котел', 'твердотопливный котёл', 'solid fuel boiler', 'дровяной котел'],
        ['конденсационный котел', 'конденсационный котёл', 'condensing boiler'],
        ['настенный котел', 'настенный котёл', 'wall mounted boiler'],
        ['напольный котел', 'напольный котёл', 'floor standing boiler'],

        ['радиатор', 'батарея', 'радиатор отопления', 'radiator'],
        ['биметаллический радиатор', 'биметалл', 'bimetal radiator'],
        ['алюминиевый радиатор', 'алюминиевая батарея', 'aluminum radiator'],
        ['стальной радиатор', 'панельный радиатор', 'steel radiator', 'panel radiator'],
        ['чугунный радиатор', 'чугунная батарея', 'cast iron radiator'],

        ['конвектор', 'convector'],
        ['горелка', 'burner'],
        ['теплый пол', 'тёплый пол', 'underfloor heating', 'напольное отопление'],
        ['терморегулятор', 'термостат', 'thermostat', 'температурный регулятор'],

        // === КЛИМАТ / ХОЛОДОСНАБЖЕНИЕ ===
        ['кондиционер', 'сплит', 'сплит-система', 'сплит система', 'ac', 'air conditioner'],
        ['инверторный кондиционер', 'инвертор', 'inverter ac'],
        ['мульти сплит', 'мульти-сплит', 'multi split'],
        ['канальный кондиционер', 'duct air conditioner', 'канальник'],
        ['кассетный кондиционер', 'cassette ac', 'кассетник'],

        ['тепловой насос', 'теплонасос', 'heat pump'],
        ['воздух-вода', 'воздух вода', 'air to water', 'воздух-воздух', 'воздух воздух', 'air to air'],
        ['чиллер', 'chiller'],
        ['фанкойл', 'fan coil'],
        ['вентиляция', 'приточка', 'приточная вентиляция', 'ventilation'],
        ['рекуператор', 'приточно вытяжная', 'приточно-вытяжная', 'recuperator', 'heat recovery'],

        ['фреон', 'хладагент', 'хладон', 'refrigerant', 'r410a', 'r32', 'r134a', 'r404a', 'r407c'],
        ['компрессор', 'compressor'],

        // === ВОДОСНАБЖЕНИЕ ===
        ['насос', 'pump'],
        ['циркуляционный насос', 'циркуляционник', 'circulation pump'],
        ['скважинный насос', 'глубинный насос', 'well pump', 'submersible pump'],
        ['повысительный насос', 'станция водоснабжения', 'booster pump'],
        ['дренажный насос', 'drainage pump'],
        ['фекальный насос', 'канализационный насос', 'sewage pump'],

        ['фильтр', 'filter'],
        ['умягчитель', 'умягчитель воды', 'water softener'],
        ['осмос', 'обратный осмос', 'reverse osmosis'],
        ['водонагреватель', 'бойлер', 'water heater'],
        ['бойлер косвенного нагрева', 'бкн', 'indirect water heater'],

        // === ТРУБЫ / ФИТИНГИ ===
        ['труба', 'трубопровод', 'pipe'],
        ['полипропиленовая труба', 'пп труба', 'ппр', 'polypropylene pipe'],
        ['металлопластиковая труба', 'мп труба', 'multilayer pipe'],
        ['медная труба', 'медтруба', 'copper pipe'],
        ['гофрированная труба', 'нержавейка', 'stainless flexible pipe'],
        ['фитинг', 'фитинги', 'соединитель', 'fitting'],
        ['коллектор', 'гребёнка', 'гребенка', 'manifold'],

        // === АРМАТУРА / АВТОМАТИКА ===
        ['кран', 'вентиль', 'шаровой кран', 'ball valve'],
        ['клапан', 'предохранительный клапан', 'valve', 'safety valve'],
        ['фильтр грубой очистки', 'сетчатый фильтр', 'strainer'],
        ['расширительный бак', 'мембранный бак', 'expansion tank'],
        ['насосная группа', 'группа безопасности', 'pump group'],
        ['датчик', 'сенсор', 'sensor'],
        ['манометр', 'pressure gauge'],

        // === ИЗОЛЯЦИЯ ===
        ['теплоизоляция', 'изоляция', 'k-flex', 'k flex', 'kaiflex', 'каучуковая изоляция', 'energoflex'],

        // === БРЕНДЫ (частые опечатки/варианты) ===
        ['baxi', 'бакси'],
        ['ariston', 'аристон'],
        ['buderus', 'будерус'],
        ['vaillant', 'вайлант'],
        ['protherm', 'протерм'],
        ['viessmann', 'висман'],
        ['bosch', 'бош'],
        ['daikin', 'дайкин'],
        ['mitsubishi', 'мицубиси', 'мицубиши'],
        ['gree', 'гри'],
        ['haier', 'хайер'],
        ['grundfos', 'грундфос'],
        ['wilo', 'вило'],
        ['dab', 'даб'],
        ['kermi', 'керми'],
        ['purmo', 'пурмо'],
        ['global', 'глобал'],
        ['rifar', 'рифар'],
        ['valtec', 'валтек'],
        ['rehau', 'рехау'],
        ['baltur', 'балтур'],
        ['weishaupt', 'вайсхаупт'],
        ['riello', 'риэлло', 'риело'],
        ['danfoss', 'данфосс'],
        ['reflex', 'рефлекс'],
    ],
];
