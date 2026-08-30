<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use Livewire\WithFileUploads;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use App\Models\Article;
use DOMDocument;

class AdminAddArticleComponent extends Component
{
    use WithFileUploads;

    public $title;
    public $slug;
    public $image;
    public $description;
    public $short_description;
    public $status;
    public $meta_title;
    public $meta_description;
    public $meta_keywords;
    
    public function updatedTitle()
    {
        $this->slug = Str::slug($this->title);
        $originalSlug = $this->slug;
        $counter = 1;

        while (Article::where('slug', $this->slug)->exists()) {
            $this->slug = $originalSlug . '-' . $counter;
            $counter++;
        }
    }

    protected $messages = [
        'title.required' => 'Заголовок обязательное поле',
        'slug.required' => 'Транслит обязательное поле',
    ];

     public function save()
    {
        $this->validate([
            'title' => 'required|string',
            'slug' => 'required|unique:articles,slug',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'image' => 'nullable|image|mimes:svg,jpg,jpeg,png,gif',
        ]);
        
        if ($this->image) {
            $imageName = Carbon::now()->timestamp . '_0' . '.'   . $this->image->extension();
            $this->image->storeAs('articles', $imageName);
            $this->image = $imageName;
        }

        $this->description = $this->processImages($this->description);
        
        Article::create([
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'image' => $this->image,
            'status' => $this->status  == NULL ? 0 : $this->status,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords,
        ]);

        session()->flash('message', 'Новость успешно добавлена!');
        return redirect()->route('admin.articles');
    }

    private function processImages($content)
    {
        if (empty($content)) {
            return '';
        }

        $dom = new DOMDocument();
        @$dom->loadHTML(mb_convert_encoding($content, 'HTML-ENTITIES', 'UTF-8'));

        $images = $dom->getElementsByTagName('img');
        $counter = 1;

        foreach ($images as $img) {
            $data = $img->getAttribute('src');
            if (str_contains($data, 'data:image')) {
                preg_match('/data:image\/(png|jpg|jpeg|gif|webp);base64/', $data, $matches);
                $extension = $matches[1] ?? 'jpg';
                list(, $data) = explode(',', $data);
                $data = base64_decode($data);
                $imageName = "/uploads/articles/" . time() . "_$counter." . $extension;
                $path = public_path() . $imageName;
                $counter++;
                file_put_contents($path, $data);
                $img->setAttribute('src', $imageName);
            }
        }

        return $dom->saveHTML($dom->documentElement);
    }

    public function render()
    {
        return view('livewire.admin.admin-add-article-component')->layout('layouts.admin');
    }
}
