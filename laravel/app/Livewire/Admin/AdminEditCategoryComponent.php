<?php

namespace App\Livewire\Admin;

use App\Models\Category;
use DOMDocument;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Livewire\Component;
use Livewire\WithFileUploads;

class AdminEditCategoryComponent extends Component
{
    use WithFileUploads;

    public Category $category;

    public $title;
    public $subtitle;
    public $short_description;
    public $slug;
    public $description;
    public $image;
    public $newimage;
    public $parent_id;
    public $position = 0;
    public $status = 0;
    public $meta_title;
    public $meta_description;
    public $meta_keywords;

    protected array $beforeSaveImages = [];

    public function mount($category_id)
    {
        $this->category = Category::findOrFail($category_id);
        $this->fill($this->category->toArray());
    }

    protected $messages = [
        'title.required' => 'Название обязательное поле',
        'slug.required' => 'Транслит обязательное поле',
        'slug.unique' => 'Такой транслит уже существует',
    ];

    public function updatedTitle()
    {
        $this->slug = Str::slug((string) $this->title);
        $originalSlug = $this->slug;
        $counter = 1;

        while (Category::where('slug', $this->slug)
            ->where('id', '!=', $this->category->id)
            ->exists()) {
            $this->slug = $originalSlug . '-' . $counter;
            $counter++;
        }
    }

    public function save()
    {
        $this->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'slug' => 'required|string|max:255|unique:categories,slug,' . $this->category->id,
            'description' => 'nullable|string',
            'newimage' => 'nullable|image|mimes:svg,jpg,jpeg,png,gif,webp',
            'parent_id' => 'nullable|integer|exists:categories,id',
            'position' => 'nullable|integer|min:0',
            'status' => 'nullable|integer|in:0,1',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string|max:255',
        ]);

        // Нельзя сделать родителем саму себя или потомка
        if ($this->parent_id && (int) $this->parent_id === (int) $this->category->id) {
            $this->addError('parent_id', 'Категория не может быть родителем самой себя.');
            return;
        }
        if ($this->parent_id && $this->isDescendant((int) $this->parent_id, $this->category->id)) {
            $this->addError('parent_id', 'Нельзя выбрать дочернюю категорию в качестве родителя.');
            return;
        }

        // Сохраняем старые изображения из описания (только /uploads/categories/*) перед обновлением
        $this->beforeSaveImages = $this->getLocalCategoryUploadImages($this->category->description);

        // Обрабатываем новые изображения и обновляем описание
        $processedDescription = $this->processImages($this->description);

        // Обновляем поля
        $this->category->update([
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'short_description' => $this->short_description,
            'slug' => $this->slug,
            'description' => $processedDescription,
            'parent_id' => $this->parent_id ?: null,
            'position' => (int) ($this->position ?? 0),
            'status' => $this->status === null ? 0 : (int) $this->status,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords,
        ]);

        // Удаляем изображения из /public/uploads/categories, которых больше нет в описании
        // (удаляем ТОЛЬКО то, что реально лежит в uploads/categories)
        $currentImages = $this->getLocalCategoryUploadImages($processedDescription);
        $removedImages = array_values(array_diff($this->beforeSaveImages, $currentImages));

        foreach ($removedImages as $oldImagePath) {
            $relative = ltrim($oldImagePath, '/');
            $pathToDelete = public_path($relative);

            // Safety: удаляем только из public/uploads/categories
            if (!str_starts_with(str_replace('\\', '/', $relative), 'uploads/categories/')) {
                continue;
            }

            if (File::exists($pathToDelete)) {
                File::delete($pathToDelete);
            }
        }

        // Главное изображение категории
        if ($this->newimage) {
            // Если картинка уже была — сохраняем новую ПОД ТЕМ ЖЕ ИМЕНЕМ (перезаписываем файл)
            // чтобы не ломались ссылки.
            $imageName = $this->category->image
                ? (string) $this->category->image
                : (Carbon::now()->timestamp . '_0.' . $this->newimage->extension());

            $this->storeImageToPublicAssets($this->newimage, $imageName, overwrite: true);

            // Если старого не было — записываем имя
            if (!$this->category->image) {
                $this->category->image = $imageName;
                $this->category->save();
            }
        }

        session()->flash('message', 'Категория успешно обновлена!');
        return redirect()->route('admin.categories');
    }

    private function storeImageToPublicAssets($uploadedFile, string $fileName, bool $overwrite = false): void
    {
        $dir = public_path('assets/images/categories');
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0775, true);
        }

        $target = $dir . DIRECTORY_SEPARATOR . $fileName;
        if ($overwrite && File::exists($target)) {
            File::delete($target);
        }

        File::copy($uploadedFile->getRealPath(), $target);
    }

    private function processImages(?string $content): string
    {
        if (empty($content)) {
            return '';
        }

        $dom = new DOMDocument();
        @$dom->loadHTML(mb_convert_encoding($content, 'HTML-ENTITIES', 'UTF-8'));

        $images = $dom->getElementsByTagName('img');
        $counter = 0;

        foreach ($images as $img) {
            $src = $img->getAttribute('src');

            if (str_contains($src, 'data:image')) {
                preg_match('/data:image\/(png|jpg|jpeg|gif|webp);base64/', $src, $matches);
                $extension = $matches[1] ?? 'jpg';

                [, $data] = explode(',', $src, 2);
                $data = base64_decode($data);

                if ($data === false) {
                    continue;
                }

                $dir = public_path('uploads/categories');
                if (!File::exists($dir)) {
                    File::makeDirectory($dir, 0775, true);
                }

                $imageName = 'uploads/categories/' . time() . '_' . $counter . '.' . $extension;
                $counter++;

                file_put_contents(public_path($imageName), $data);
                $img->setAttribute('src', '/' . $imageName);
            }
        }

        return $dom->saveHTML($dom->documentElement);
    }

    private function getLocalCategoryUploadImages(?string $content): array
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

            // Оставляем только локальные файлы из /uploads/categories
            $path = parse_url($src, PHP_URL_PATH) ?: '';
            if ($path === '') {
                continue;
            }

            if (!str_starts_with($path, '/')) {
                $path = '/' . $path;
            }

            if (str_starts_with($path, '/uploads/categories/')) {
                $images[] = $path;
            }
        }

        return array_values(array_unique($images));
    }

    private function isDescendant(int $maybeParentId, int $categoryId): bool
    {
        $current = Category::find($maybeParentId);
        $guard = 0;

        while ($current && $guard < 50) {
            if ((int) $current->parent_id === (int) $categoryId) {
                return true;
            }
            $current = $current->parent_id ? Category::find($current->parent_id) : null;
            $guard++;
        }

        return false;
    }

    public function render()
    {
        $categories = Category::query()
            ->where('id', '!=', $this->category->id)
            ->orderByRaw('CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END')
            ->orderBy('parent_id')
            ->orderBy('position')
            ->orderBy('title')
            ->get();

        $options = $this->buildOptions($categories);

        return view('livewire.admin.admin-edit-category-component', [
            'category' => $this->category,
            'options' => $options,
        ])->layout('layouts.admin');
    }

    private function buildOptions($categories): array
    {
        $byParent = [];
        foreach ($categories as $cat) {
            $byParent[$cat->parent_id ?: 0][] = $cat;
        }

        $options = [];
        $walk = function ($parentId, int $depth) use (&$walk, &$options, $byParent) {
            foreach ($byParent[$parentId] ?? [] as $node) {
                $options[] = [
                    'id' => $node->id,
                    'label' => str_repeat('— ', $depth) . $node->title,
                ];
                $walk($node->id, $depth + 1);
            }
        };

        $walk(0, 0);
        return $options;
    }
}
