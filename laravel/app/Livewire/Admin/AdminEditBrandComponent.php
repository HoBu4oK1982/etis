<?php

namespace App\Livewire\Admin;

use App\Models\Brand;
use DOMDocument;
use Illuminate\Support\Facades\File;
use Livewire\Component;
use Livewire\WithFileUploads;

class AdminEditBrandComponent extends Component
{
    use WithFileUploads;

    public Brand $brand;

    public string $title = '';
    public string $slug = '';
    public ?string $description = null;

    /** @var \Livewire\Features\SupportFileUploads\TemporaryUploadedFile|null */
    public $newImage = null;

    public int $position = 0;
    public int $status = 0;

    private array $beforeSaveDescriptionImages = [];

    public function mount(int $brand_id): void
    {
        $this->brand = Brand::findOrFail($brand_id);
        $this->title = (string)$this->brand->title;
        $this->slug = (string)$this->brand->slug;
        $this->description = $this->brand->description;
        $this->position = (int)($this->brand->position ?? 0);
        $this->status = (int)($this->brand->status ?? 0);

        $this->beforeSaveDescriptionImages = $this->extractStoredBrandImages($this->description);
    }

    public function updatedTitle(): void
    {
        $this->slug = Brand::makeUniqueSlugFromTitle($this->title, $this->brand->id);
    }

    public function updateBrand()
    {
        $this->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:brands,slug,' . $this->brand->id,
            'description' => 'nullable|string',
            'newImage' => 'nullable|image|max:4096',
            'position' => 'nullable|integer',
            'status' => 'required|in:0,1',
        ], [
            'title.required' => 'Введите название бренда',
            'slug.required' => 'Slug обязателен',
            'slug.unique' => 'Такой slug уже существует',
        ]);

        $processed = $this->processDescriptionImages($this->description);
        $afterImages = $this->extractStoredBrandImages($processed);

        $this->deleteRemovedBrandImages($this->beforeSaveDescriptionImages, $afterImages);

        $imageName = $this->brand->image;
        if ($this->newImage) {
            $ext = $this->newImage->getClientOriginalExtension() ?: 'jpg';

            if (!empty($imageName)) {
                // ✅ перезаписываем под старым именем
                $imageName = pathinfo($imageName, PATHINFO_FILENAME) . '.' . $ext;
            } else {
                $imageName = $this->slug . '-' . time() . '.' . $ext;
            }

            $this->storeImageToPublicAssets($this->newImage, $imageName);
        }

        $this->brand->update([
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $processed,
            'image' => $imageName,
            'position' => (int)($this->position ?? 0),
            'status' => (int)$this->status,
        ]);

        session()->flash('message', 'Бренд успешно обновлён!');
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
        $html = preg_replace('~<(?:!DOCTYPE|/?(?:html|body))[^>]*>~i', '', $html);

        return trim($html);
    }

    private function extractStoredBrandImages(?string $html): array
    {
        if (empty($html)) {
            return [];
        }

        $dom = new DOMDocument();
        @$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
        $images = $dom->getElementsByTagName('img');

        $paths = [];
        foreach ($images as $img) {
            $src = (string)$img->getAttribute('src');
            if (str_contains($src, '/uploads/brands/')) {
                $paths[] = $src;
            }
        }

        return array_values(array_unique($paths));
    }

    private function deleteRemovedBrandImages(array $before, array $after): void
    {
        $removed = array_diff($before, $after);
        foreach ($removed as $src) {
            $rel = ltrim(parse_url($src, PHP_URL_PATH) ?: '', '/');
            if ($rel === '' || !str_starts_with($rel, 'uploads/brands/')) {
                continue;
            }
            $path = public_path($rel);
            if (File::exists($path)) {
                File::delete($path);
            }
        }
    }

    public function render()
    {
        return view('livewire.admin.admin-edit-brand-component')->layout('layouts.admin');
    }
}
