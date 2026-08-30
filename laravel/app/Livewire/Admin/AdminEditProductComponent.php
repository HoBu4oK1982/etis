<?php

namespace App\Livewire\Admin;

use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductFile;
use App\Models\ProductImage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Livewire\Component;
use Livewire\WithFileUploads;
use DOMDocument;

class AdminEditProductComponent extends Component
{
    use WithFileUploads;

    public Product $product;

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

    public array $chars = [];

    /** @var array<int, \Livewire\Features\SupportFileUploads\TemporaryUploadedFile> */
    public array $newImages = [];

    /** @var array<int, \Livewire\Features\SupportFileUploads\TemporaryUploadedFile> */
    public array $newFiles = [];

    /**
     * Titles for existing PDF files (key: file id)
     *
     * @var array<int, string>
     */
    public array $existingFileTitles = [];

    /**
     * Titles for newly selected PDF files (index-based)
     *
     * @var array<int, string>
     */
    public array $newFileTitles = [];

    private array $beforeSaveDescriptionImages = [];
    private array $beforeSaveShortDescriptionImages = [];
    private array $beforeSaveAttributeImages = [];

    public function mount(int $product_id): void
    {
        $this->product = Product::with(['images','files','attributes'])->findOrFail($product_id);
        $this->fill($this->product->toArray());
        $this->category_id = $this->product->category_id;
        $this->brand_id = $this->product->brand_id;

        $this->chars = $this->product->attributes->map(fn($a) => [
            'type' => $a->type ?? 'pair',
            'name' => $a->name,
            'value' => $a->value,
            'content' => $a->content,
        ])->toArray();

        $this->existingFileTitles = $this->product->files->pluck('title', 'id')->toArray();

        if (empty($this->chars)) {
            $this->chars = [['type' => 'pair', 'name' => '', 'value' => '', 'content' => null]];
        }
    }

    public function updatedTitle(): void
    {
        $this->slug = Product::makeUniqueSlug($this->title, $this->product->id);
    }

    public function addCharRow(): void
    {
        $this->chars[] = ['type' => 'pair', 'name' => '', 'value' => '', 'content' => null];
    }

    public function removeCharRow(int $index): void
    {
        if (count($this->chars) <= 1) {
            $this->chars = [['type' => 'pair', 'name' => '', 'value' => '', 'content' => null]];
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
                // HTML: только summernote (content)
                $this->chars[$index]['name'] = '';
                $this->chars[$index]['value'] = '';
                $this->chars[$index]['content'] = (string)($this->chars[$index]['content'] ?? '');
            } else {
                // pair: только name + value
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


    public function removeExistingImage(int $imageId): void
    {
        $img = ProductImage::query()->where('product_id', $this->product->id)->findOrFail($imageId);
        $path = public_path('assets/images/products/' . $img->file_name);
        if (File::exists($path)) {
            File::delete($path);
        }
        $img->delete();
        $this->normalizeImagePositions();
        $this->product->refresh();
    }

    public function removeNewImage(int $index): void
    {
        if (!array_key_exists($index, $this->newImages)) {
            return;
        }
        unset($this->newImages[$index]);
        $this->newImages = array_values($this->newImages);
    }

    public function moveNewImageUp(int $index): void
    {
        if ($index <= 0 || $index >= count($this->newImages)) {
            return;
        }
        $tmp = $this->newImages[$index - 1];
        $this->newImages[$index - 1] = $this->newImages[$index];
        $this->newImages[$index] = $tmp;
        $this->newImages = array_values($this->newImages);
    }

    public function moveNewImageDown(int $index): void
    {
        if ($index < 0 || $index >= (count($this->newImages) - 1)) {
            return;
        }
        $tmp = $this->newImages[$index + 1];
        $this->newImages[$index + 1] = $this->newImages[$index];
        $this->newImages[$index] = $tmp;
        $this->newImages = array_values($this->newImages);
    }

    public function moveExistingImageUp(int $imageId): void
    {
        $this->normalizeImagePositions();

        $imgs = ProductImage::query()
            ->where('product_id', $this->product->id)
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        $idx = $imgs->search(fn($i) => (int)$i->id === (int)$imageId);
        if ($idx === false || $idx <= 0) {
            return;
        }
        $a = $imgs[$idx - 1];
        $b = $imgs[$idx];
        $tmp = $a->position;
        $a->position = $b->position;
        $b->position = $tmp;
        $a->save();
        $b->save();

        $this->product->refresh();
    }

    public function moveExistingImageDown(int $imageId): void
    {
        $this->normalizeImagePositions();

        $imgs = ProductImage::query()
            ->where('product_id', $this->product->id)
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        $idx = $imgs->search(fn($i) => (int)$i->id === (int)$imageId);
        if ($idx === false || $idx >= ($imgs->count() - 1)) {
            return;
        }
        $a = $imgs[$idx];
        $b = $imgs[$idx + 1];
        $tmp = $a->position;
        $a->position = $b->position;
        $b->position = $tmp;
        $a->save();
        $b->save();

        $this->product->refresh();
    }

    private function normalizeImagePositions(): void
    {
        $imgs = ProductImage::query()
            ->where('product_id', $this->product->id)
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        $pos = 0;
        foreach ($imgs as $img) {
            if ((int)$img->position !== $pos) {
                $img->position = $pos;
                $img->save();
            }
            $pos++;
        }
    }

    public function removeExistingFile(int $fileId): void
    {
        $f = ProductFile::query()->where('product_id', $this->product->id)->findOrFail($fileId);
        $path = public_path(ltrim($f->path, '/'));
        if (File::exists($path)) {
            File::delete($path);
        }
        $f->delete();
        $this->normalizeFilePositions();
        $this->product->refresh();
        $this->existingFileTitles = $this->product->files->pluck('title', 'id')->toArray();
    }

    public function updatedNewFiles(): void
    {
        // Prefill titles for newly selected PDF files
        $this->newFileTitles = [];
        foreach ($this->newFiles as $i => $f) {
            if (!$f) {
                continue;
            }
            $base = pathinfo((string) $f->getClientOriginalName(), PATHINFO_FILENAME);
            $this->newFileTitles[$i] = trim((string) $base) !== '' ? $base : (string) $f->getClientOriginalName();
        }
        $this->newFileTitles = array_values($this->newFileTitles);
    }

    public function removeNewFile(int $index): void
    {
        if (!array_key_exists($index, $this->newFiles)) {
            return;
        }
        unset($this->newFiles[$index]);
        $this->newFiles = array_values($this->newFiles);

        unset($this->newFileTitles[$index]);
        $this->newFileTitles = array_values($this->newFileTitles);
    }

    public function moveNewFileUp(int $index): void
    {
        if ($index <= 0 || $index >= count($this->newFiles)) {
            return;
        }

        [$this->newFiles[$index - 1], $this->newFiles[$index]] = [$this->newFiles[$index], $this->newFiles[$index - 1]];
        [$this->newFileTitles[$index - 1], $this->newFileTitles[$index]] = [$this->newFileTitles[$index] ?? '', $this->newFileTitles[$index - 1] ?? ''];

        $this->newFiles = array_values($this->newFiles);
        $this->newFileTitles = array_values($this->newFileTitles);
    }

    public function moveNewFileDown(int $index): void
    {
        if ($index < 0 || $index >= (count($this->newFiles) - 1)) {
            return;
        }

        [$this->newFiles[$index + 1], $this->newFiles[$index]] = [$this->newFiles[$index], $this->newFiles[$index + 1]];
        [$this->newFileTitles[$index + 1], $this->newFileTitles[$index]] = [$this->newFileTitles[$index] ?? '', $this->newFileTitles[$index + 1] ?? ''];

        $this->newFiles = array_values($this->newFiles);
        $this->newFileTitles = array_values($this->newFileTitles);
    }

    public function moveExistingFileUp(int $fileId): void
    {
        $this->normalizeFilePositions();

        $files = ProductFile::query()
            ->where('product_id', $this->product->id)
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        $idx = $files->search(fn($f) => (int)$f->id === (int)$fileId);
        if ($idx === false || $idx <= 0) {
            return;
        }

        $a = $files[$idx - 1];
        $b = $files[$idx];
        $tmp = $a->position;
        $a->position = $b->position;
        $b->position = $tmp;
        $a->save();
        $b->save();

        $this->product->refresh();
        $this->existingFileTitles = $this->product->files->pluck('title', 'id')->toArray();
    }

    public function moveExistingFileDown(int $fileId): void
    {
        $this->normalizeFilePositions();

        $files = ProductFile::query()
            ->where('product_id', $this->product->id)
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        $idx = $files->search(fn($f) => (int)$f->id === (int)$fileId);
        if ($idx === false || $idx >= ($files->count() - 1)) {
            return;
        }

        $a = $files[$idx];
        $b = $files[$idx + 1];
        $tmp = $a->position;
        $a->position = $b->position;
        $b->position = $tmp;
        $a->save();
        $b->save();

        $this->product->refresh();
        $this->existingFileTitles = $this->product->files->pluck('title', 'id')->toArray();
    }

    private function normalizeFilePositions(): void
    {
        $files = ProductFile::query()
            ->where('product_id', $this->product->id)
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        $pos = 0;
        foreach ($files as $f) {
            if ((int)$f->position !== $pos) {
                $f->position = $pos;
                $f->save();
            }
            $pos++;
        }
    }


    public function save()
    {
        $this->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug,' . $this->product->id,
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
            'newImages.*' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif,svg|max:8192',
            'newFiles.*' => 'nullable|mimes:pdf|max:51200',
            'newFileTitles.*' => 'nullable|string|max:255',
            'existingFileTitles.*' => 'nullable|string|max:255',
        ], [
            'category_id.required' => 'Выберите категорию',
        ]);

        // Сохраняем старые изображения из описания до обновления
        $this->beforeSaveDescriptionImages = $this->getLocalDescriptionImages($this->product->description);
        $this->beforeSaveShortDescriptionImages = $this->getLocalDescriptionImages($this->product->short_description);
        $this->beforeSaveAttributeImages = $this->getAllAttributeImages($this->product->attributes);

        // Обрабатываем новые base64 картинки из Summernote (description, short_description, характеристики HTML)
        $this->description = $this->processDescriptionImages($this->description);
        $this->short_description = $this->processDescriptionImages($this->short_description);

        /* Обрабатываем base64 картинки в HTML-характеристиках */
        foreach ($this->chars as $i => $row) {
            $type = (string)($row['type'] ?? 'pair');
            if ($type === 'html') {
                $this->chars[$i]['content'] = $this->processDescriptionImages((string)($row['content'] ?? ''));
            }
        }
        $this->product->update([
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

        // Удаляем картинки из description, которые исчезли
        $currentImages = $this->getLocalDescriptionImages($this->description);
        $removed = array_diff($this->beforeSaveDescriptionImages, $currentImages);
        foreach ($removed as $old) {
            $p = public_path(ltrim(parse_url($old, PHP_URL_PATH) ?? '', '/'));
            if ($p && str_contains($p, public_path('uploads/products')) && File::exists($p)) {
                File::delete($p);
            }
        }

        /* Удаляем картинки из short_description, которые исчезли */
        $currentShortImages = $this->getLocalDescriptionImages($this->short_description);
        $removedShort = array_diff($this->beforeSaveShortDescriptionImages, $currentShortImages);
        foreach ($removedShort as $old) {
            $p = public_path(ltrim(parse_url($old, PHP_URL_PATH) ?? '', '/'));
            if ($p && str_contains($p, public_path('uploads/products')) && File::exists($p)) {
                File::delete($p);
            }
        }

        /* Удаляем картинки из HTML-характеристик, которые исчезли */
        $currentAttrImages = $this->getAllAttributeImagesFromRows($this->chars);
        $removedAttr = array_diff($this->beforeSaveAttributeImages, $currentAttrImages);
        foreach ($removedAttr as $old) {
            $p = public_path(ltrim(parse_url($old, PHP_URL_PATH) ?? '', '/'));
            if ($p && str_contains($p, public_path('uploads/products')) && File::exists($p)) {
                File::delete($p);
            }
        }


        // Добавляем новые изображения в галерею
        if (!empty($this->newImages)) {
            $dir = public_path('assets/images/products');
            if (!File::exists($dir)) {
                File::makeDirectory($dir, 0775, true);
            }

            $pos = (int)ProductImage::where('product_id', $this->product->id)->max('position');
            $pos = $pos ? $pos + 1 : 0;

            foreach ($this->newImages as $img) {
                if (!$img) {
                    continue;
                }

                $ext = $img->extension() ?: 'jpg';
                $fileName = $this->makeNextIndexedFileName($dir, $this->slug, $ext);

                File::copy($img->getRealPath(), $dir . DIRECTORY_SEPARATOR . $fileName);

                ProductImage::create([
                    'product_id' => $this->product->id,
                    'file_name' => $fileName,
                    'position' => $pos,
                ]);

                $pos++;
            }
        }

        // Persist existing PDF titles
        foreach ($this->existingFileTitles as $id => $title) {
            $file = ProductFile::query()->where('product_id', $this->product->id)->find($id);
            if (!$file) {
                continue;
            }
            $clean = trim((string)$title);
            $file->title = $clean !== '' ? $clean : ($file->original_name ?: basename($file->path));
            $file->save();
        }

        // Добавляем новые PDF
        if (!empty($this->newFiles)) {
            $dir = public_path('uploads/product-files');
            if (!File::exists($dir)) {
                File::makeDirectory($dir, 0775, true);
            }

            $pos = (int)ProductFile::where('product_id', $this->product->id)->max('position');
            $pos = $pos ? $pos + 1 : 0;

            $i = 0;
            foreach ($this->newFiles as $f) {
                if (!$f) {
                    continue;
                }
                $ext = $f->extension() ?: 'pdf';
                $fileName = $this->makeNextIndexedFileName($dir, $this->slug, $ext);
                File::copy($f->getRealPath(), $dir . DIRECTORY_SEPARATOR . $fileName);

                ProductFile::create([
                    'product_id' => $this->product->id,
                    'title' => trim((string)($this->newFileTitles[$i] ?? '')) !== '' ? trim((string)($this->newFileTitles[$i] ?? '')) : (string)$f->getClientOriginalName(),
                    'original_name' => $f->getClientOriginalName(),
                    'path' => '/uploads/product-files/' . $fileName,
                    'size' => (int)$f->getSize(),
                    'position' => $pos,
                ]);

                $pos++;
                $i++;
            }
        }

        // Характеристики: проще всего пересоздать
        ProductAttribute::where('product_id', $this->product->id)->delete();
        $pos = 0;
        foreach ($this->chars as $row) {
            $type = (string)($row['type'] ?? 'pair');
            $type = in_array($type, ['pair', 'html'], true) ? $type : 'pair';

            if ($type === 'pair') {
                $name = trim((string)($row['name'] ?? ''));
                $value = trim((string)($row['value'] ?? ''));
                if ($name === '' && $value === '') {
                    continue;
                }

                ProductAttribute::create([
                    'product_id' => $this->product->id,
                    'type' => 'pair',
                    'name' => $name,
                    'value' => $value,
                    'content' => null,
                    'position' => $pos,
                ]);
                $pos++;
                continue;
            }

            // HTML: только summernote content
            $content = trim((string)($row['content'] ?? ''));
            if ($content === '') {
                continue;
            }

            ProductAttribute::create([
                'product_id' => $this->product->id,
                'type' => 'html',
                'name' => '',
                'value' => null,
                'content' => $content,
                'position' => $pos,
            ]);
            $pos++;
        }

        session()->flash('message', 'Товар успешно обновлен!');
        return redirect()->route('admin.products');
    }

    private function processDescriptionImages(?string $content): string
    {
        if (empty($content)) {
            return '';
        }

        $dom = new DOMDocument();
        @$dom->loadHTML(mb_convert_encoding($content, 'HTML-ENTITIES', 'UTF-8'));

        $images = $dom->getElementsByTagName('img');
        $counter = 0;

        foreach ($images as $img) {
            $data = $img->getAttribute('src');
            if (str_contains($data, 'data:image')) {
                preg_match('/data:image\/(png|jpg|jpeg|gif|webp|svg\+xml);base64/', $data, $matches);
                $ext = $matches[1] ?? 'jpg';
                $ext = $ext === 'svg+xml' ? 'svg' : $ext;

                [$meta, $payload] = explode(',', $data, 2);
                $binary = base64_decode($payload);
                if ($binary === false) {
                    continue;
                }

                $dir = public_path('uploads/products');
                if (!File::exists($dir)) {
                    File::makeDirectory($dir, 0775, true);
                }

                $fileName = $this->makeNextIndexedFileName(public_path('uploads/products'), $this->slug, $ext);
                $imageName = '/uploads/products/' . $fileName;
                File::put(public_path($imageName), $binary);
                $img->setAttribute('src', $imageName);
                $counter++;
            }
        }

        return $dom->saveHTML($dom->documentElement);
    }

    private function getLocalDescriptionImages(?string $content): array
    {
        if (empty($content)) {
            return [];
        }

        $dom = new DOMDocument();
        @$dom->loadHTML(mb_convert_encoding($content, 'HTML-ENTITIES', 'UTF-8'));

        $images = [];
        foreach ($dom->getElementsByTagName('img') as $img) {
            $src = $img->getAttribute('src');
            if (empty($src) || str_contains($src, 'data:image')) {
                continue;
            }
            // Удаляем только наши файлы
            if (str_starts_with($src, '/uploads/products/')) {
                $images[] = $src;
            }
        }
        return $images;
    }


    private function getAllAttributeImages($attributes): array
    {
        $all = [];
        foreach ($attributes as $a) {
            $type = (string)($a->type ?? 'pair');
            if ($type !== 'html') {
                continue;
            }
            $all = array_merge($all, $this->getLocalDescriptionImages((string)($a->content ?? '')));
        }
        return array_values(array_unique($all));
    }

    private function getAllAttributeImagesFromRows(array $rows): array
    {
        $all = [];
        foreach ($rows as $row) {
            $type = (string)($row['type'] ?? 'pair');
            if ($type !== 'html') {
                continue;
            }
            $all = array_merge($all, $this->getLocalDescriptionImages((string)($row['content'] ?? '')));
        }
        return array_values(array_unique($all));
    }
    
    /**
     * Generate next available file name like slug_0.ext, slug_1.ext ...
     * Checks existing files in the target public directory.
     */
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
                if ($n > $max) {
                    $max = $n;
                }
            }
        }

        $i = $max + 1;
        // Extra safety: ensure not exists
        while (File::exists($absDir . DIRECTORY_SEPARATOR . $slug . '_' . $i . '.' . $ext)) {
            $i++;
        }

        return $slug . '_' . $i . '.' . $ext;
    }

public function render()
    {
        $categories = Category::query()
            ->select(['id','title','parent_id','position'])
            ->where(function ($q) {
                $q->where('status', 0);
                // Также показываем текущую категорию товара, даже если она выключена
                if ($this->category_id) {
                    $q->orWhere('id', $this->category_id);
                }
            })
            ->orderBy('position')
            ->orderBy('id')
            ->get();
        $brands = Brand::query()->select(['id','title','status','position'])->orderBy('position')->orderBy('id')->get();
        $this->product->loadMissing(['images','files']);

        return view('livewire.admin.admin-edit-product-component', [
            'product' => $this->product,
            'categories' => $categories,
            'brands' => $brands,
        ])->layout('layouts.admin');
    }
}
