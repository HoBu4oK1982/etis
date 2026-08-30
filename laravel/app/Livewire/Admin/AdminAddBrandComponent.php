<?php

namespace App\Livewire\Admin;

use App\Models\Brand;
use DOMDocument;
use Illuminate\Support\Facades\File;
use Livewire\Component;
use Livewire\WithFileUploads;

class AdminAddBrandComponent extends Component
{
    use WithFileUploads;

    public string $title = '';
    public string $slug = '';
    public ?string $description = null;

    /** @var \Livewire\Features\SupportFileUploads\TemporaryUploadedFile|null */
    public $image = null;

    public int $position = 0;

    // 0 = включен (default), 1 = выключен
    public int $status = 0;

    public function updatedTitle(): void
    {
        $this->slug = Brand::makeUniqueSlugFromTitle($this->title);
    }

    public function storeBrand()
    {
        $this->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:brands,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:4096',
            'position' => 'nullable|integer',
            'status' => 'required|in:0,1',
        ], [
            'title.required' => 'Введите название бренда',
            'slug.required' => 'Slug обязателен',
            'slug.unique' => 'Такой slug уже существует',
            'image.image' => 'Файл должен быть изображением',
            'image.max' => 'Картинка слишком большая',
        ]);

        $description = $this->processDescriptionImages($this->description);

        $imageName = null;
        if ($this->image) {
            $ext = $this->image->getClientOriginalExtension() ?: 'jpg';
            $imageName = $this->slug . '-' . time() . '.' . $ext;
            $this->storeImageToPublicAssets($this->image, $imageName);
        }

        Brand::create([
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $description,
            'image' => $imageName,
            'position' => (int)($this->position ?? 0),
            'status' => (int)$this->status,
        ]);

        session()->flash('message', 'Бренд успешно добавлен!');
        return redirect()->route('admin.brands');
    }

    private function storeImageToPublicAssets($uploadedFile, string $fileName): void
    {
        $dir = public_path('assets/images/brands');
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0775, true);
        }

        File::copy($uploadedFile->getRealPath(), $dir . DIRECTORY_SEPARATOR . $fileName);
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
            $src = $img->getAttribute('src');

            if (is_string($src) && str_contains($src, 'data:image')) {
                preg_match('/data:image\/(png|jpg|jpeg|gif|webp);base64/', $src, $matches);
                $extension = $matches[1] ?? 'jpg';

                [, $data] = explode(',', $src, 2);
                $data = base64_decode($data);
                if ($data === false) {
                    continue;
                }

                $fileName = 'brand-' . time() . '-' . ($counter++) . '.' . $extension;
                $path = public_path('uploads/brands');
                if (!File::exists($path)) {
                    File::makeDirectory($path, 0775, true);
                }

                file_put_contents($path . DIRECTORY_SEPARATOR . $fileName, $data);
                $img->setAttribute('src', '/uploads/brands/' . $fileName);
            }
        }

        $html = $dom->saveHTML();
        // strip wrapper tags added by DOMDocument
        $html = preg_replace('~<(?:!DOCTYPE|/?(?:html|body))[^>]*>~i', '', $html);

        return trim($html);
    }

    public function render()
    {
        return view('livewire.admin.admin-add-brand-component')->layout('layouts.admin');
    }
}
