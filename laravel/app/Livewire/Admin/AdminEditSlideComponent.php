<?php

namespace App\Livewire\Admin;

use App\Models\Slider;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Livewire\Component;
use Livewire\WithFileUploads;

class AdminEditSlideComponent extends Component
{
    use WithFileUploads;

    public $slide_id;

    // 3 текстовых поля
    public $eyebrow;
    public $title;
    public $subtitle;

    // прочее
    public $link;
    public $image;     // текущее имя файла в БД
    public $newimage;  // временный загружаемый файл
    public $position = 0;
    public $status = 0;

    public function mount($slide_id)
    {
        $slide = Slider::findOrFail($slide_id);

        $this->slide_id = $slide->id;
        $this->eyebrow  = $slide->eyebrow;
        $this->title    = $slide->title;
        $this->subtitle = $slide->subtitle;
        $this->link     = $slide->link;
        $this->image    = $slide->image;
        $this->position = (int) ($slide->position ?? 0);
        $this->status   = (int) ($slide->status ?? 0);
    }

    public function update()
    {
        $this->validate([
            'eyebrow'  => 'nullable|string|max:255',
            'title'    => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'link'     => 'nullable|string|max:500',
            'newimage' => 'nullable|image|mimes:jpg,jpeg,png,webp,svg',
            'position' => 'nullable|integer|min:0',
            'status'   => 'nullable|integer|in:0,1',
        ]);

        $slide = Slider::findOrFail($this->slide_id);

        // Новый файл — сохраняем в public/assets/images/sliders/.
        // Если старой картинки не было, генерируем новое имя;
        // если была — перезаписываем под тем же именем (URL не меняется).
        if ($this->newimage) {
            $imageName = $slide->image
                ?: Carbon::now()->timestamp . '_0.' . $this->newimage->extension();
            $this->storeImageToPublicAssets($this->newimage, $imageName);
            $slide->image = $imageName;
        }

        $slide->eyebrow  = $this->eyebrow;
        $slide->title    = $this->title;
        $slide->subtitle = $this->subtitle;
        $slide->link     = $this->link ?: '#';
        $slide->position = (int) ($this->position ?? 0);
        $slide->status   = (int) ($this->status ?? 0);
        $slide->save();

        session()->flash('message', 'Слайд обновлён');
        return redirect()->route('admin.slides');
    }

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
        return view('livewire.admin.admin-edit-slide-component')->layout('layouts.admin');
    }
}
