<?php

namespace App\Livewire\Admin;

use App\Models\Slider;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Livewire\Component;
use Livewire\WithFileUploads;

class AdminAddSlideComponent extends Component
{
    use WithFileUploads;

    // 3 текстовых поля
    public $eyebrow;
    public $title;
    public $subtitle;

    // прочее
    public $link;
    public $image;
    public $position = 0;
    public $status = 0; // 0 = включен

    protected $messages = [
        'image.required' => 'Изображение обязательное поле',
        'image.image'    => 'Файл должен быть изображением',
    ];

    public function save()
    {
        if (! Auth::check()) {
            return redirect()->route('login');
        }

        $this->validate([
            'eyebrow'  => 'nullable|string|max:255',
            'title'    => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'link'     => 'nullable|string|max:500',
            'image'    => 'required|image|mimes:jpg,jpeg,png,webp,svg',
            'position' => 'nullable|integer|min:0',
            'status'   => 'nullable|integer|in:0,1',
        ]);

        $imageName = Carbon::now()->timestamp . '_0.' . $this->image->extension();
        $this->storeImageToPublicAssets($this->image, $imageName);

        Slider::create([
            'eyebrow'  => $this->eyebrow,
            'title'    => $this->title,
            'subtitle' => $this->subtitle,
            'link'     => $this->link ?: '#',
            'image'    => $imageName,
            'position' => (int) ($this->position ?? 0),
            'status'   => $this->status === null ? 0 : (int) $this->status,
        ]);

        session()->flash('message', 'Слайд создан');
        return redirect()->route('admin.slides');
    }

    /**
     * Кладёт файл в public/assets/images/sliders/ — по паттерну
     * категорий/брендов/товаров etis.kz. Оттуда его отдаёт asset(),
     * а Next.js frontend читает через ProductListResource-like URL.
     */
    private function storeImageToPublicAssets($uploadedFile, string $fileName): void
    {
        $dir = public_path('assets/images/sliders');
        if (! File::exists($dir)) {
            File::makeDirectory($dir, 0775, true);
        }
        File::copy($uploadedFile->getRealPath(), $dir . DIRECTORY_SEPARATOR . $fileName);
    }

    public function render()
    {
        return view('livewire.admin.admin-add-slide-component')->layout('layouts.admin');
    }
}
