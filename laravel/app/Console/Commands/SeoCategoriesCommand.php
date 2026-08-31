<?php

namespace App\Console\Commands;

use Anthropic\Client;
use Anthropic\Core\Exceptions\APIStatusException;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\NextRevalidator;
use App\Support\CategoryTree;
use Illuminate\Console\Command;

/**
 * Генерация SEO-мета и текста для категорий через Claude API.
 *
 *   php artisan etis:seo:categories                      — все незаполненные
 *   php artisan etis:seo:categories --dry-run            — показать, не сохранять
 *   php artisan etis:seo:categories --category=kotly     — одна категория
 *   php artisan etis:seo:categories --force              — перезаписать заполненные
 *
 * Идемпотентность: по умолчанию категория пропускается, если у неё уже есть
 * meta_title И description. Прогон можно прервать и запустить заново —
 * продолжит с того места, где остановился.
 *
 * События моделей на время записи отключены намеренно: иначе каждое из 143
 * сохранений дёрнуло бы синхронный webhook ревалидации во фронт (до 3с) и
 * переиндексацию поиска. Ревалидация отправляется один раз в конце,
 * переиндексацию поиска запускаем отдельно (php artisan search:reindex).
 */
class SeoCategoriesCommand extends Command
{
    protected $signature = 'etis:seo:categories
        {--category= : Slug одной категории вместо всего дерева}
        {--dry-run : Показать сгенерированное, ничего не сохранять}
        {--force : Перезаписать категории, у которых мета уже заполнена}
        {--limit= : Обработать не более N категорий (для пробного прогона)}
        {--sleep=1 : Пауза между запросами к API, секунд}';

    protected $description = 'Генерирует meta_title / meta_description / meta_keywords / description для категорий через Claude API';

    /** Модель Claude. Sonnet 4.6 — баланс качества и цены для объёмной генерации. */
    private const MODEL = 'claude-sonnet-4-6';

    private const MAX_TITLE = 60;
    private const MAX_DESCRIPTION = 160;

    /** Сколько раз повторить запрос при rate limit / перегрузке. */
    private const MAX_ATTEMPTS = 4;

    private int $generated = 0;
    private int $skipped = 0;
    private int $failed = 0;

    /** @var array<int, string> */
    private array $warnings = [];

    public function handle(): int
    {
        $apiKey = (string) config('services.anthropic.key');

        if ($apiKey === '') {
            $this->error('Не задан ANTHROPIC_API_KEY в .env — генерировать нечем.');

            return self::FAILURE;
        }

        $categories = $this->targetCategories();

        if ($categories->isEmpty()) {
            $this->warn('Нет категорий для обработки.');

            return self::SUCCESS;
        }

        $dryRun = (bool) $this->option('dry-run');
        $sleep = max(0, (int) $this->option('sleep'));

        $this->info(sprintf(
            'Категорий к обработке: %d%s. Модель: %s',
            $categories->count(),
            $dryRun ? ' (dry-run, запись отключена)' : '',
            self::MODEL
        ));
        $this->newLine();

        $client = new Client(apiKey: $apiKey);

        foreach ($categories as $i => $category) {
            $context = $this->buildContext($category);

            $this->line(sprintf(
                '<fg=gray>[%d/%d]</> %s <fg=gray>(/%s, уровень %d)</>',
                $i + 1,
                $categories->count(),
                $context['path'],
                $category->slug,
                $context['level']
            ));

            try {
                $seo = $this->generate($client, $context);
            } catch (\Throwable $e) {
                $this->failed++;
                $this->error('    ошибка: ' . $e->getMessage());

                continue;
            }

            $this->reportLengths($category, $seo);

            if ($dryRun) {
                $this->preview($seo);
            } else {
                $this->persist($category, $seo);
            }

            $this->generated++;

            if ($sleep > 0 && $i < $categories->count() - 1) {
                sleep($sleep);
            }
        }

        $this->summary($dryRun);

        return $this->failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Категории для обработки: одна по slug либо всё активное дерево.
     *
     * @return \Illuminate\Support\Collection<int, Category>
     */
    private function targetCategories()
    {
        $query = Category::query()->where('status', 0);

        if ($slug = $this->option('category')) {
            $query->where('slug', $slug);

            $found = $query->get();

            if ($found->isEmpty()) {
                $this->error("Активная категория со slug «{$slug}» не найдена.");
            }

            return $found;
        }

        $query->orderBy('parent_id')->orderBy('position')->orderBy('id');

        $categories = $query->get();

        if (! $this->option('force')) {
            $categories = $categories->filter(function (Category $c) {
                $filled = trim((string) $c->meta_title) !== ''
                    && trim((string) $c->description) !== '';

                if ($filled) {
                    $this->skipped++;
                }

                return ! $filled;
            })->values();
        }

        if ($limit = (int) $this->option('limit')) {
            $categories = $categories->take($limit);
        }

        return $categories;
    }

    /**
     * Контекст категории для промпта.
     *
     * Ключевое: цепочка родителей. Без неё «KASKAD» — бессмысленный набор
     * букв, а с ней это «Отопление → Котлы → Weisberg → Котлы для крышных
     * котельных → KASKAD», и модель понимает, о чём писать.
     *
     * @return array<string, mixed>
     */
    private function buildContext(Category $category): array
    {
        $chain = $this->parentChain($category);
        $titles = array_map(fn (Category $c) => $c->title, $chain);

        $subtreeIds = CategoryTree::descendantIds($category->id);

        $brands = Brand::query()
            ->whereIn('id', Product::query()
                ->whereIn('category_id', $subtreeIds)
                ->where('status', 0)
                ->whereNotNull('brand_id')
                ->distinct()
                ->pluck('brand_id'))
            ->orderBy('title')
            ->pluck('title')
            ->all();

        $children = Category::query()
            ->where('parent_id', $category->id)
            ->where('status', 0)
            ->orderBy('position')
            ->orderBy('id')
            ->pluck('title')
            ->all();

        $productsQuery = Product::query()
            ->whereIn('category_id', $subtreeIds)
            ->where('status', 0);

        return [
            'title'      => $category->title,
            'slug'       => $category->slug,
            'level'      => count($chain) - 1,
            'path'       => implode(' → ', $titles),
            'parents'    => array_slice($titles, 0, -1),
            'children'   => $children,
            'brands'     => $brands,
            'products'   => (clone $productsQuery)->count(),
            'samples'    => (clone $productsQuery)->orderBy('id')->limit(12)->pluck('title')->all(),
        ];
    }

    /**
     * Цепочка от корня до самой категории включительно.
     *
     * @return array<int, Category>
     */
    private function parentChain(Category $category): array
    {
        $chain = [$category];
        $node = $category;

        // Ограничение на 5 уровней вложенности — как в CategoryController.
        for ($i = 0; $i < 5 && $node->parent_id; $i++) {
            $parent = Category::find($node->parent_id);

            if (! $parent) {
                break;
            }

            array_unshift($chain, $parent);
            $node = $parent;
        }

        return $chain;
    }

    /**
     * Запрос к Claude со structured output — гарантирует четыре поля на выходе.
     *
     * @param  array<string, mixed>  $context
     * @return array{meta_title: string, meta_description: string, meta_keywords: string, description: string}
     */
    private function generate(Client $client, array $context): array
    {
        $seo = $this->requestSeo($client, $this->userPrompt($context));

        // Один корректирующий заход, если модель промахнулась по длине.
        $tooLong = $this->lengthProblems($seo);

        if ($tooLong !== []) {
            $seo = $this->requestSeo($client, $this->repairPrompt($context, $seo, $tooLong));
        }

        return $seo;
    }

    /**
     * @return array{meta_title: string, meta_description: string, meta_keywords: string, description: string}
     */
    private function requestSeo(Client $client, string $prompt): array
    {
        $attempt = 0;

        while (true) {
            $attempt++;

            try {
                $message = $client->messages->create(
                    model: self::MODEL,
                    maxTokens: 8000,
                    thinking: ['type' => 'adaptive'],
                    system: [
                        [
                            'type' => 'text',
                            'text' => $this->systemPrompt(),
                            // Системный промпт одинаков для всех 143 запросов —
                            // кэшируем, чтобы не платить за него каждый раз.
                            'cacheControl' => ['type' => 'ephemeral'],
                        ],
                    ],
                    messages: [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    outputConfig: ['format' => $this->schema()],
                );
            } catch (APIStatusException $e) {
                $type = $e->type?->value;
                $retryable = in_array($type, ['rate_limit_error', 'overloaded_error', 'api_error'], true);

                if ($retryable && $attempt < self::MAX_ATTEMPTS) {
                    $wait = 2 ** $attempt;
                    $this->warn("    {$type}, повтор через {$wait}с (попытка {$attempt})");
                    sleep($wait);

                    continue;
                }

                throw $e;
            }

            if ($message->stopReason === 'refusal') {
                throw new \RuntimeException(
                    'модель отказалась отвечать: ' . ($message->stopDetails?->explanation ?? 'без пояснения')
                );
            }

            return $this->decode($message);
        }
    }

    /**
     * Достаём JSON из первого текстового блока ответа.
     *
     * @return array{meta_title: string, meta_description: string, meta_keywords: string, description: string}
     */
    private function decode(object $message): array
    {
        $json = null;

        foreach ($message->content as $block) {
            if ($block->type === 'text') {
                $json = $block->text;
                break;
            }
        }

        if ($json === null) {
            throw new \RuntimeException('в ответе нет текстового блока');
        }

        $data = json_decode($json, true);

        if (! is_array($data)) {
            throw new \RuntimeException('ответ не разобрался как JSON: ' . mb_substr($json, 0, 200));
        }

        foreach (['meta_title', 'meta_description', 'meta_keywords', 'description'] as $key) {
            if (! isset($data[$key]) || trim((string) $data[$key]) === '') {
                throw new \RuntimeException("в ответе пустое поле {$key}");
            }
        }

        return [
            'meta_title'       => trim((string) $data['meta_title']),
            'meta_description' => trim((string) $data['meta_description']),
            'meta_keywords'    => trim((string) $data['meta_keywords']),
            'description'      => trim((string) $data['description']),
        ];
    }

    /** JSON-схема ответа: ровно четыре поля, ничего лишнего. */
    private function schema(): array
    {
        return [
            'type'   => 'json_schema',
            'schema' => [
                'type'       => 'object',
                'properties' => [
                    'meta_title' => [
                        'type'        => 'string',
                        'description' => 'Title страницы, СТРОГО не длиннее ' . self::MAX_TITLE . ' символов',
                    ],
                    'meta_description' => [
                        'type'        => 'string',
                        'description' => 'Description, СТРОГО не длиннее ' . self::MAX_DESCRIPTION . ' символов',
                    ],
                    'meta_keywords' => [
                        'type'        => 'string',
                        'description' => 'От 5 до 8 ключевых слов через запятую',
                    ],
                    'description' => [
                        'type'        => 'string',
                        'description' => 'SEO-текст 300–500 слов в простом HTML (p, h2, h3, ul, li, strong)',
                    ],
                ],
                'required'             => ['meta_title', 'meta_description', 'meta_keywords', 'description'],
                'additionalProperties' => false,
            ],
        ];
    }

    private function systemPrompt(): string
    {
        return <<<'PROMPT'
        Ты — SEO-копирайтер и инженер-теплотехник интернет-магазина ETIS.KZ (etis.kz).

        ETIS.KZ — казахстанский поставщик отопительного, вентиляционного,
        холодильного и сантехнического оборудования: промышленные и бытовые котлы,
        газовые и дизельные горелки, тепловые завесы, насосы, расширительные баки,
        емкости и металлоконструкции. Работает с юридическими лицами и частными
        клиентами по всему Казахстану, основной город — Алматы.

        Пишешь по-русски, для казахстанского рынка. Валюта — тенге (₸).

        ЖЁСТКИЕ ТРЕБОВАНИЯ К ПОЛЯМ

        meta_title — не длиннее 60 символов, считая пробелы. Базовый шаблон:
        «{Категория} купить в Алматы — цены, каталог | ETIS.KZ». Если в 60 символов
        шаблон не влезает, сокращай хвост в таком порядке: убери «, каталог»,
        затем «— цены», затем «в Алматы». Название категории и «| ETIS.KZ»
        сохраняй всегда.

        meta_description — не длиннее 160 символов, считая пробелы. Продающее,
        с ключевыми словами категории, с конкретикой (бренды, применение) и
        призывом к действию в конце («Доставка по Казахстану», «Звоните»,
        «Заказать с доставкой»). Без кавычек-ёлочек внутри.

        meta_keywords — от 5 до 8 ключевых слов через запятую. Реальные поисковые
        запросы: название категории, синонимы, бренды, «купить», «Алматы»,
        «Казахстан», «цена». Без хеш-тегов и повторов.

        description — SEO-текст на 300–500 слов, простой HTML: <p>, <h2>, <h3>,
        <ul>, <li>, <strong>. Без <html>, <body>, <script>, style-атрибутов и
        markdown. Структура: вводный абзац о том, что это за оборудование и где
        применяется; <h2> о том, как выбрать (реальные технические критерии —
        мощность, топливо, давление, материал, условия эксплуатации); <h2> с
        ассортиментом и брендами из контекста; завершающий абзац о том, почему
        покупать в ETIS.KZ (подбор инженером, доставка по Казахстану, гарантия,
        сервис). Экспертный тон, без воды и превосходных степеней. Не выдумывай
        цены, сроки, сертификаты и цифры, которых нет в контексте.

        КОНТЕКСТ ВЛОЖЕННОСТИ

        Тебе даётся полный путь категории от корня. Пиши про КОНЕЧНУЮ категорию,
        но с учётом всей цепочки. Пример: категория «KASKAD» с путём
        «Отопление → Котлы → Weisberg → Котлы для крышных котельных → KASKAD» —
        это серия котлов KASKAD бренда Weisberg для крышных котельных, и текст
        должен быть именно про неё, а не про абстрактный «KASKAD».

        Если у категории есть бренды — упоминай их. Если есть подкатегории —
        отрази их в тексте. Если товаров нет, пиши про направление в целом,
        не утверждая наличие конкретных позиций на складе.
        PROMPT;
    }

    /** @param array<string, mixed> $context */
    private function userPrompt(array $context): string
    {
        $lines = [
            'Категория: ' . $context['title'],
            'Полный путь: ' . $context['path'],
            'Уровень вложенности: ' . $context['level'] . ($context['level'] === 0 ? ' (корневая)' : ''),
        ];

        if ($context['parents'] !== []) {
            $lines[] = 'Родительские категории: ' . implode(', ', $context['parents']);
        }

        $lines[] = $context['children'] !== []
            ? 'Подкатегории: ' . implode(', ', $context['children'])
            : 'Подкатегорий нет — это конечная категория каталога.';

        $lines[] = $context['brands'] !== []
            ? 'Бренды внутри категории: ' . implode(', ', $context['brands'])
            : 'Брендов в привязке к товарам нет.';

        $lines[] = 'Товаров в категории (с подкатегориями): ' . $context['products'];

        if ($context['samples'] !== []) {
            $lines[] = 'Примеры товаров:';

            foreach ($context['samples'] as $sample) {
                $lines[] = '  — ' . $sample;
            }
        }

        $lines[] = '';
        $lines[] = 'Сгенерируй meta_title, meta_description, meta_keywords и description для этой категории.';

        return implode("\n", $lines);
    }

    /**
     * @param  array<string, string>  $seo
     * @param  array<int, string>  $problems
     */
    private function repairPrompt(array $context, array $seo, array $problems): string
    {
        return $this->userPrompt($context)
            . "\n\nПредыдущая попытка нарушила лимиты:\n"
            . implode("\n", array_map(fn ($p) => '  — ' . $p, $problems))
            . "\n\nБыло:\n"
            . "meta_title: {$seo['meta_title']}\n"
            . "meta_description: {$seo['meta_description']}\n"
            . "\nПерепиши, уложившись в лимиты. Остальные поля можно оставить прежними.";
    }

    /**
     * @param  array<string, string>  $seo
     * @return array<int, string>
     */
    private function lengthProblems(array $seo): array
    {
        $problems = [];

        if (mb_strlen($seo['meta_title']) > self::MAX_TITLE) {
            $problems[] = sprintf(
                'meta_title — %d символов при лимите %d',
                mb_strlen($seo['meta_title']),
                self::MAX_TITLE
            );
        }

        if (mb_strlen($seo['meta_description']) > self::MAX_DESCRIPTION) {
            $problems[] = sprintf(
                'meta_description — %d символов при лимите %d',
                mb_strlen($seo['meta_description']),
                self::MAX_DESCRIPTION
            );
        }

        return $problems;
    }

    /** @param array<string, string> $seo */
    private function reportLengths(Category $category, array $seo): void
    {
        $problems = $this->lengthProblems($seo);

        $words = str_word_count(strip_tags($seo['description']), 0, 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ');

        $this->line(sprintf(
            '    <fg=gray>title %d/%d · description %d/%d · текст ~%d слов</>',
            mb_strlen($seo['meta_title']),
            self::MAX_TITLE,
            mb_strlen($seo['meta_description']),
            self::MAX_DESCRIPTION,
            $words
        ));

        foreach ($problems as $problem) {
            $warning = $category->slug . ': ' . $problem;
            $this->warnings[] = $warning;
            $this->warn('    ' . $problem . ' — сохранено как есть, проверьте вручную');
        }
    }

    /** @param array<string, string> $seo */
    private function preview(array $seo): void
    {
        $this->line('    <fg=cyan>meta_title:</>       ' . $seo['meta_title']);
        $this->line('    <fg=cyan>meta_description:</> ' . $seo['meta_description']);
        $this->line('    <fg=cyan>meta_keywords:</>    ' . $seo['meta_keywords']);
        $this->line('    <fg=cyan>description:</>      ' . mb_substr(strip_tags($seo['description']), 0, 160) . '…');
        $this->newLine();
    }

    /** @param array<string, string> $seo */
    private function persist(Category $category, array $seo): void
    {
        // Без событий: 143 сохранения не должны обернуться 143 webhook'ами
        // ревалидации и переиндексациями. Ревалидируем один раз в конце.
        Category::withoutEvents(function () use ($category, $seo) {
            $category->forceFill([
                'meta_title'       => $seo['meta_title'],
                'meta_description' => $seo['meta_description'],
                'meta_keywords'    => $seo['meta_keywords'],
                'description'      => $seo['description'],
            ])->save();
        });
    }

    private function summary(bool $dryRun): void
    {
        $this->newLine();
        $this->info(sprintf(
            'Готово. Сгенерировано: %d · пропущено (уже заполнены): %d · с ошибкой: %d',
            $this->generated,
            $this->skipped,
            $this->failed
        ));

        if ($this->warnings !== []) {
            $this->newLine();
            $this->warn('Превышения лимитов (' . count($this->warnings) . '):');

            foreach ($this->warnings as $warning) {
                $this->warn('  — ' . $warning);
            }
        }

        if ($dryRun || $this->generated === 0) {
            return;
        }

        (new NextRevalidator())->tags(['categories', 'catalog', 'home'])->send();
        $this->line('<fg=gray>Ревалидация ISR-кэша фронта отправлена.</>');
        $this->line('<fg=gray>Не забудьте: php artisan search:reindex</>');
    }
}
