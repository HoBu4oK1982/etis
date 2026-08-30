<?php

namespace App\Livewire\Admin;

use App\Models\Category;
use DOMDocument;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Livewire\Component;
use Livewire\WithFileUploads;

class AdminAddCategoryComponent extends Component
{
    use WithFileUploads;

    public $title;
    public $subtitle;
    public $short_description;
    public $slug;
    public $description;
    public $image;
    public $parent_id;
    public $position = 0;
    public $status = 0; // 0 = включена
    public $meta_title;
    public $meta_description;
    public $meta_keywords;

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

        while (Category::where('slug', $this->slug)->exists()) {
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
            'slug' => 'required|string|max:255|unique:categories,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:svg,jpg,jpeg,png,gif,webp',
            'parent_id' => 'nullable|integer|exists:categories,id',
            'position' => 'nullable|integer|min:0',
            'status' => 'nullable|integer|in:0,1',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string|max:255',
        ]);

        $imageName = null;
        if ($this->image) {
            $imageName = Carbon::now()->timestamp . '_0.' . $this->image->extension();
            $this->storeImageToPublicAssets($this->image, $imageName);
        }

        $description = $this->processImages($this->description);

        Category::create([
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'short_description' => $this->short_description,
            'slug' => $this->slug,
            'description' => $description,
            'image' => $imageName,
            'parent_id' => $this->parent_id ?: null,
            'position' => (int) ($this->position ?? 0),
            'status' => $this->status === null ? 0 : (int) $this->status,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords,
        ]);

        session()->flash('message', 'Категория успешно добавлена!');
        return redirect()->route('admin.categories');
    }

    private function storeImageToPublicAssets($uploadedFile, string $fileName): void
    {
        $dir = public_path('assets/images/categories');
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0775, true);
        }

        File::copy($uploadedFile->getRealPath(), $dir . DIRECTORY_SEPARATOR . $fileName);
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

    public function render()
    {
        $categories = Category::query()
            ->orderByRaw('CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END')
            ->orderBy('parent_id')
            ->orderBy('position')
            ->orderBy('title')
            ->get();

        // Плоский список с отступами для селекта родителя
        $options = $this->buildOptions($categories);

        return view('livewire.admin.admin-add-category-component', [
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
