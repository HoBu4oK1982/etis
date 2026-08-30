<?php

namespace App\Livewire\Admin;

use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductFile;
use App\Models\ProductImage;
use DOMDocument;
use Illuminate\Support\Facades\File;
use Livewire\Component;
use Livewire\WithFileUploads;

class AdminAddProductComponent extends Component
{
    use WithFileUploads;

    public ?int $category_id = null;
    public ?int $brand_id = null;

    public string $title = '';
    public string $slug = '';
    public ?string $sku = null;

    public $price = null;
    public $selling_price = null;

    public ?string $description = null;
    public ?string $short_description = null;

    public int $status = 0;
    public ?string $remark = null;

    public ?string $meta_title = null;
    public ?string $meta_description = null;
    public ?string $meta_keywords = null;

    /**
     * Characteristics rows.
     * type = pair|html
     */
    public array $chars = [];

    /** @var array<int, \Livewire\Features\SupportFileUploads\TemporaryUploadedFile> */
    public array $images = [];

    /** @var array<int, \Livewire\Features\SupportFileUploads\TemporaryUploadedFile> */
    public array $files = [];

    /** @var array<int, string> */
    public array $fileTitles = [];

    // ===============================================================
    //  ДУБЛИКАТ ТОВАРА
    // ===============================================================

    /** ID исходного товара при копировании (null если обычное создание) */
    public ?int $source_id = null;

    /** Заголовок исходного товара — для баннера */
    public ?string $sourceTitle = null;

    /**
     * Унаследованные картинки от исходного товара.
     * [ ['file_name' => 'x.jpg', 'position' => 0, 'url' => '/assets/...', 'keep' => true], ... ]
     */
    public array $inheritedImages = [];

    /**
     * Унаследованные PDF от исходного товара.
     * [ ['path' => '/uploads/...', 'title' => '...', 'original_name' => '...', 'position' => 0, 'keep' => true], ... ]
     */
    public array $inheritedFiles = [];

    // ===============================================================

    public function mount(?int $source_id = null): void
    {
        $this->status = 0;
        $this->brand_id = null;
        $this->chars = [
            ['type' => 'pair', 'name' => '', 'value' => '', 'content' => ''],
        ];

        // Если это дубликат — предзаполняем форму данными исходного товара
        if ($source_id) {
            $this->loadFromSource((int) $source_id);
        }
    }

    /**
     * Загружает все поля исходного товара в форму (кроме id/timestamps/slug).
     * Slug генерируется уникальный. Валидация 'unique:products,slug' всё равно
     * не даст сохранить дубликат.
     */
    private function loadFromSource(int $sourceId): void
    {
        $source = Product::query()
            ->with(['attributes', 'images', 'files'])
            ->find($sourceId);

        if (! $source) {
            session()->flash('error', 'Исходный товар не найден.');
            return;
        }

        $this->source_id   = $source->id;
        $this->sourceTitle = $source->title;

        // Основные поля
        $this->title             = (string) $source->title;
        $this->slug              = Product::makeUniqueSlug($source->slug); // "orig-slug-2", "-3" и т.д.
        $this->sku               = $source->sku;
        $this->price             = $source->price;
        $this->selling_price     = $source->selling_price;
        $this->brand_id          = $source->brand_id;
        $this->category_id       = $source->category_id;
        $this->description       = $source->description;
        $this->short_description = $source->short_description;
        $this->status            = (int) $source->status;
        $this->remark            = $source->remark;
        $this->meta_title        = $source->meta_title;
        $this->meta_description  = $source->meta_description;
        $this->meta_keywords     = $source->meta_keywords;

        // Характеристики
        $chars = [];
        foreach ($source->attributes as $attr) {
            $type = in_array($attr->type ?? 'pair', ['pair', 'html'], true) ? ($attr->type ?? 'pair') : 'pair';

            $chars[] = [
                'type'    => $type,
                'name'    => (string) ($attr->name ?? ''),
                'value'   => (string) ($attr->value ?? ''),
                'content' => (string) ($attr->content ?? ''),
            ];
        }
        if (empty($chars)) {
            $chars = [['type' => 'pair', 'name' => '', 'value' => '', 'content' => '']];
        }
        $this->chars = $chars;

        // Унаследованные картинки — покажем миниатюры в форме
        foreach ($source->images as $img) {
            $this->inheritedImages[] = [
                'file_name' => $img->file_name,
                'position'  => (int) $img->position,
                'url'       => asset('assets/images/products/' . $img->file_name),
                'keep'      => true,
            ];
        }

        // Унаследованные PDF файлы
        foreach ($source->files as $f) {
            $this->inheritedFiles[] = [
                'path'          => (string) $f->path,
                'title'         => (string) ($f->title ?? ''),
                'original_name' => (string) ($f->original_name ?? basename($f->path)),
                'position'      => (int) $f->position,
                'keep'          => true,
            ];
        }
    }

    /**
     * Убрать унаследованную картинку из копии (нажатие крестика).
     */
    public function removeInheritedImage(int $index): void
    {
        if (isset($this->inheritedImages[$index])) {
            unset($this->inheritedImages[$index]);
            $this->inheritedImages = array_values($this->inheritedImages);
        }
    }

    /**
     * Убрать унаследованный PDF из копии.
     */
    public function removeInheritedFile(int $index): void
    {
        if (isset($this->inheritedFiles[$index])) {
            unset($this->inheritedFiles[$index]);
            $this->inheritedFiles = array_values($this->inheritedFiles);
        }
    }

    // ---------------------------------------------------------------

    public function updatedTitle(): void
    {
        $this->slug = Product::makeUniqueSlug($this->title);
    }

    public function addCharRow(): void
    {
        $this->chars[] = ['type' => 'pair', 'name' => '', 'value' => '', 'content' => ''];
    }

    public function removeCharRow(int $index): void
    {
        if (count($this->chars) <= 1) {
            $this->chars = [['type' => 'pair', 'name' => '', 'value' => '', 'content' => '']];
            return;
        }
        unset($this->chars[$index]);
        $this->chars = array_values($this->chars);
        $this->dispatch('reinit-editors');
    }

    public function updatedChars($value = null, $name = null): void
    {
        if (is_string($name) && str_ends_with($name, '.type')) {
            $index = (int) explode('.', $name)[0];
            $type = (string)($this->chars[$index]['type'] ?? 'pair');
            $type = in_array($type, ['pair', 'html'], true) ? $type : 'pair';

            if ($type === 'html') {
                $this->chars[$index]['name'] = '';
                $this->chars[$index]['value'] = '';
                $this->chars[$index]['content'] = (string)($this->chars[$index]['content'] ?? '');
            } else {
                $this->chars[$index]['content'] = '';
                $this->chars[$index]['name'] = (string)($this->chars[$index]['name'] ?? '');
                $this->chars[$index]['value'] = (string)($this->chars[$index]['value'] ?? '');
            }
        }

        foreach ($this->chars as $i => $row) {
            $type = (string)($row['type'] ?? 'pair');
            $this->chars[$i]['type'] = in_array($type, ['pair', 'html'], true) ? $type : 'pair';
            $this->chars[$i]['name'] = (string)($row['name'] ?? '');
            $this->chars[$i]['value'] = (string)($row['value'] ?? '');
            $this->chars[$i]['content'] = (string)($row['content'] ?? '');
        }

        $this->dispatch('reinit-editors');
    }

    public function removeImage(int $index): void
    {
        if (!array_key_exists($index, $this->images)) return;
        unset($this->images[$index]);
        $this->images = array_values($this->images);
    }

    public function moveImageUp(int $index): void
    {
        if ($index <= 0 || $index >= count($this->images)) return;
        $tmp = $this->images[$index - 1];
        $this->images[$index - 1] = $this->images[$index];
        $this->images[$index] = $tmp;
        $this->images = array_values($this->images);
    }

    public function moveImageDown(int $index): void
    {
        if ($index < 0 || $index >= (count($this->images) - 1)) return;
        $tmp = $this->images[$index + 1];
        $this->images[$index + 1] = $this->images[$index];
        $this->images[$index] = $tmp;
        $this->images = array_values($this->images);
    }

    public function updatedFiles(): void
    {
        $this->fileTitles = [];
        foreach ($this->files as $i => $f) {
            if (!$f) continue;
            $base = pathinfo((string)$f->getClientOriginalName(), PATHINFO_FILENAME);
            $this->fileTitles[$i] = trim((string)$base) !== '' ? $base : (string)$f->getClientOriginalName();
        }
        $this->fileTitles = array_values($this->fileTitles);
    }

    public function removeFile(int $index): void
    {
        if (!array_key_exists($index, $this->files)) return;
        unset($this->files[$index]);
        $this->files = array_values($this->files);

        unset($this->fileTitles[$index]);
        $this->fileTitles = array_values($this->fileTitles);
    }

    public function moveFileUp(int $index): void
    {
        if ($index <= 0 || $index >= count($this->files)) return;
        [$this->files[$index - 1], $this->files[$index]] = [$this->files[$index], $this->files[$index - 1]];
        [$this->fileTitles[$index - 1], $this->fileTitles[$index]] = [$this->fileTitles[$index] ?? '', $this->fileTitles[$index - 1] ?? ''];
        $this->files = array_values($this->files);
        $this->fileTitles = array_values($this->fileTitles);
    }

    public function moveFileDown(int $index): void
    {
        if ($index < 0 || $index >= (count($this->files) - 1)) return;
        [$this->files[$index + 1], $this->files[$index]] = [$this->files[$index], $this->files[$index + 1]];
        [$this->fileTitles[$index + 1], $this->fileTitles[$index]] = [$this->fileTitles[$index] ?? '', $this->fileTitles[$index + 1] ?? ''];
        $this->files = array_values($this->files);
        $this->fileTitles = array_values($this->fileTitles);
    }

    public function save()
    {
        $this->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug',
            'sku' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'brand_id' => 'nullable|integer|exists:brands,id',
            'category_id' => 'required|integer',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'status' => 'required|in:0,1',
            'remark' => 'nullable|in:hit,sale,new',
            'chars' => 'array',
            'chars.*.type' => 'required|in:pair,html',
            'chars.*.name' => 'nullable|string|max:255',
            'chars.*.value' => 'nullable|string',
            'chars.*.content' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif,svg|max:8192',
            'files.*' => 'nullable|mimes:pdf|max:51200',
            'fileTitles.*' => 'nullable|string|max:255',
        ], [
            'category_id.required' => 'Выберите категорию',
            'slug.unique'          => 'Товар с таким транслитом (slug) уже существует. Измените название.',
        ]);

        $this->description = $this->processDescriptionImages($this->description);
        $this->short_description = $this->processDescriptionImages($this->short_description);

        foreach ($this->chars as $i => $row) {
            $type = (string)($row['type'] ?? 'pair');
            if ($type === 'html') {
                $this->chars[$i]['content'] = $this->processDescriptionImages((string)($row['content'] ?? ''));
            }
        }

        $product = Product::create([
            'title' => $this->title,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'price' => $this->price,
            'selling_price' => $this->selling_price,
            'brand_id' => $this->brand_id,
            'category_id' => $this->category_id,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'status' => $this->status,
            'remark' => $this->remark,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords,
        ]);

        $imagesDir = public_path('assets/images/products');
        if (!File::exists($imagesDir)) {
            File::makeDirectory($imagesDir, 0775, true);
        }

        $imagePos = 0;

        // 1) Унаследованные картинки — физически копируем файлы с новыми именами
        foreach ($this->inheritedImages as $inh) {
            $srcPath = $imagesDir . DIRECTORY_SEPARATOR . $inh['file_name'];
            if (!File::exists($srcPath)) {
                continue;
            }

            $ext = pathinfo($inh['file_name'], PATHINFO_EXTENSION) ?: 'jpg';
            $newName = $this->makeNextIndexedFileName($imagesDir, $this->slug, $ext);

            try {
                File::copy($srcPath, $imagesDir . DIRECTORY_SEPARATOR . $newName);

                ProductImage::create([
                    'product_id' => $product->id,
                    'file_name'  => $newName,
                    'position'   => $imagePos,
                ]);

                $imagePos++;
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Не удалось скопировать унаследованную картинку', [
                    'src'   => $srcPath,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // 2) Новые картинки, добавленные вручную
        if (!empty($this->images)) {
            foreach ($this->images as $img) {
                if (!$img) continue;

                $ext = $img->extension() ?: 'jpg';
                $fileName = $this->makeNextIndexedFileName($imagesDir, $this->slug, $ext);
                File::copy($img->getRealPath(), $imagesDir . DIRECTORY_SEPARATOR . $fileName);

                ProductImage::create([
                    'product_id' => $product->id,
                    'file_name'  => $fileName,
                    'position'   => $imagePos,
                ]);

                $imagePos++;
            }
        }

        // 3) PDF файлы
        $filesDir = public_path('uploads/product-files');
        if (!File::exists($filesDir)) {
            File::makeDirectory($filesDir, 0775, true);
        }

        $filePos = 0;

        // 3a) Унаследованные PDF
        foreach ($this->inheritedFiles as $inh) {
            $relPath = ltrim((string) $inh['path'], '/');
            $srcAbs  = public_path($relPath);
            if (!File::exists($srcAbs)) {
                continue;
            }

            $ext = pathinfo($srcAbs, PATHINFO_EXTENSION) ?: 'pdf';
            $newName = $this->makeNextIndexedFileName($filesDir, $this->slug, $ext);

            try {
                File::copy($srcAbs, $filesDir . DIRECTORY_SEPARATOR . $newName);

                ProductFile::create([
                    'product_id'    => $product->id,
                    'title'         => $inh['title'] ?: pathinfo($newName, PATHINFO_FILENAME),
                    'original_name' => $inh['original_name'] ?: basename($newName),
                    'path'          => '/uploads/product-files/' . $newName,
                    'size'          => (int) @filesize($srcAbs),
                    'position'      => $filePos,
                ]);

                $filePos++;
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Не удалось скопировать унаследованный PDF', [
                    'src'   => $srcAbs,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // 3b) Новые PDF
        if (!empty($this->files)) {
            $i = 0;
            foreach ($this->files as $f) {
                if (!$f) continue;

                $ext = $f->extension() ?: 'pdf';
                $fileName = $this->makeNextIndexedFileName($filesDir, $this->slug, $ext);
                File::copy($f->getRealPath(), $filesDir . DIRECTORY_SEPARATOR . $fileName);

                ProductFile::create([
                    'product_id'    => $product->id,
                    'title'         => trim((string)($this->fileTitles[$i] ?? '')) !== '' ? trim((string)($this->fileTitles[$i] ?? '')) : (string) $f->getClientOriginalName(),
                    'original_name' => $f->getClientOriginalName(),
                    'path'          => '/uploads/product-files/' . $fileName,
                    'size'          => (int) $f->getSize(),
                    'position'      => $filePos,
                ]);

                $filePos++;
                $i++;
            }
        }

        // 4) Характеристики
        $pos = 0;
        foreach ($this->chars as $row) {
            $type = (string)($row['type'] ?? 'pair');
            $type = in_array($type, ['pair', 'html'], true) ? $type : 'pair';

            if ($type === 'pair') {
                $name  = trim((string)($row['name']  ?? ''));
                $value = trim((string)($row['value'] ?? ''));
                if ($name === '' && $value === '') continue;

                ProductAttribute::create([
                    'product_id' => $product->id,
                    'type'       => 'pair',
                    'name'       => $name,
                    'value'      => $value,
                    'content'    => null,
                    'position'   => $pos,
                ]);
                $pos++;
                continue;
            }

            $content = trim((string)($row['content'] ?? ''));
            if ($content === '') continue;

            ProductAttribute::create([
                'product_id' => $product->id,
                'type'       => 'html',
                'name'       => '',
                'value'      => null,
                'content'    => $content,
                'position'   => $pos,
            ]);
            $pos++;
        }

        $msg = $this->source_id
            ? 'Товар успешно скопирован. Проверьте поля и, если нужно, отредактируйте.'
            : 'Товар успешно добавлен!';
        session()->flash('message', $msg);

        return redirect()->route('admin.products');
    }

    private function processDescriptionImages(?string $content): string
    {
        if (empty($content)) return '';

        $dom = new DOMDocument();
        @$dom->loadHTML(mb_convert_encoding($content, 'HTML-ENTITIES', 'UTF-8'));

        $images = $dom->getElementsByTagName('img');

        foreach ($images as $img) {
            $data = $img->getAttribute('src');
            if (str_contains($data, 'data:image')) {
                preg_match('/data:image\/(png|jpg|jpeg|gif|webp|svg\+xml);base64/', $data, $matches);
                $ext = $matches[1] ?? 'jpg';
                $ext = $ext === 'svg+xml' ? 'svg' : $ext;

                [, $payload] = explode(',', $data, 2);
                $binary = base64_decode($payload);
                if ($binary === false) continue;

                $dir = public_path('uploads/products');
                if (!File::exists($dir)) {
                    File::makeDirectory($dir, 0775, true);
                }

                $fileName = $this->makeNextIndexedFileName(public_path('uploads/products'), $this->slug, $ext);
                $imageName = '/uploads/products/' . $fileName;
                File::put(public_path($imageName), $binary);
                $img->setAttribute('src', $imageName);
            }
        }

        return $dom->saveHTML($dom->documentElement);
    }

    private function makeNextIndexedFileName(string $absDir, string $slug, string $ext): string
    {
        $slug = trim($slug) !== '' ? $slug : 'item';
        $ext = ltrim(strtolower($ext ?: 'jpg'), '.');

        if (!File::exists($absDir)) {
            File::makeDirectory($absDir, 0775, true);
        }

        $max = -1;
        $pattern = $absDir . DIRECTORY_SEPARATOR . $slug . '_*.*';
        foreach (File::glob($pattern) as $path) {
            $base = basename($path);
            if (preg_match('/^' . preg_quote($slug, '/') . '_(\d+)\.[^.]+$/', $base, $m)) {
                $n = (int)$m[1];
                if ($n > $max) $max = $n;
            }
        }

        $i = $max + 1;
        while (File::exists($absDir . DIRECTORY_SEPARATOR . $slug . '_' . $i . '.' . $ext)) {
            $i++;
        }

        return $slug . '_' . $i . '.' . $ext;
    }

    public function render()
    {
        $categories = Category::query()
            ->select(['id', 'title', 'parent_id', 'position'])
            ->where('status', 0)
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        $brands = Brand::query()
            ->select(['id', 'title', 'status', 'position'])
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        return view('livewire.admin.admin-add-product-component', [
            'categories' => $categories,
            'brands'     => $brands,
        ])->layout('layouts.admin');
    }
}
