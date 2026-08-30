<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use Livewire\WithFileUploads;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Carbon;
use App\Models\Article;
use DOMDocument;

class AdminEditArticleComponent extends Component
{
    use WithFileUploads;
    public $article;
    public $title;
    public $slug;
    public $description;
    public $short_description;
    public $image;
    public $newimage;
    public $status;
    public $meta_title;
    public $meta_description;
    public $meta_keywords;

    protected $beforeSaveImages = [];

    public function mount($article_id)
    {
        $this->article = Article::findOrFail($article_id);
        $this->fill($this->article->toArray());
    }

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
    ];


    public function save()
    {
        $this->validate([            
            'title' => 'required|string|max:255',
            'slug' => 'required|unique:articles,slug,' . $this->article->id,
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
        ]);
    
        // Сохраняем старые изображения из описания перед обновлением
        $this->beforeSaveImages = $this->getImagesFromContent($this->article->description);
    
        // Обрабатываем новые изображения и обновляем описание
        $this->description = $this->processImages($this->description);
    
        // Сохраняем услугу в базе данных
        $this->article->update([
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
    
        // Сравниваем старые изображения с новыми
        $currentImages = $this->getImagesFromContent($this->description);
        $removedImages = array_diff($this->beforeSaveImages, $currentImages);
    
        // Удаляем изображения, которых нет в новом контенте
        foreach ($removedImages as $oldImage) {
            $pathToDelete = public_path(parse_url($oldImage, PHP_URL_PATH));
            if (File::exists($pathToDelete)) {
                File::delete($pathToDelete);
            }
        }
    
        if($this->newimage){
            // Если изображения нет в базе, создаем новое имя
            if($this->article->image == NULL){
                $imageName = Carbon::now()->timestamp . '_0' . '.' . $this->newimage->extension();
                $this->newimage->storeAs('articles', $imageName);
                $this->article->image = $imageName;
            } else {
                // Если изображение уже существует, меняем расширение
                $imageName = pathinfo($this->article->image, PATHINFO_FILENAME) . '.' . $this->newimage->extension();
                $this->newimage->storeAs('articles', $imageName);
                $this->article->image = $imageName;
            }
        }
    
        // Сохраняем модель в базе данных
        $this->article->save();
    
        // Отображаем сообщение об успехе
        session()->flash('message', 'Новость успешно обновлена!');
        return redirect()->route('admin.articles');
    }
    

    private function processImages($content)
    {
        // Проверка на пустой контент
        if (empty($content)) {
            return '';
        }

        $dom = new DOMDocument();
        @$dom->loadHTML(mb_convert_encoding($content, 'HTML-ENTITIES', 'UTF-8'));
        $images = $dom->getElementsByTagName('img');
        $key = 0;

        foreach ($images as $img) {
            $data = $img->getAttribute('src');
            if (str_contains($data, 'data:image')) {
                preg_match('/data:image\/(\w+);base64,/', $data, $matches);
                $type = $matches[1] ?? 'jpg';
                list(, $data) = explode(',', $data);
                $data = base64_decode($data);

                if ($data === false) {
                    continue;
                }

                $image_name = "/uploads/articles/" . time() . '_' . $key . '.' . $type;
                $path = public_path() . $image_name;
                file_put_contents($path, $data);

                $img->setAttribute('src', $image_name);
                $key++;
            }
        }
        return $dom->saveHTML($dom->documentElement);
    }
    private function getImagesFromContent($content)
    {
        // Проверка на пустой контент
        if (empty($content)) {
            return [];
        }
        $dom = new DOMDocument();
        @$dom->loadHTML(mb_convert_encoding($content, 'HTML-ENTITIES', 'UTF-8'));
        $images = [];
        foreach ($dom->getElementsByTagName('img') as $img) {
            $src = $img->getAttribute('src');
            if (!str_contains($src, 'data:image')) {
                $images[] = $src;
            }
        }
        return $images;
    }

    public function render()
    {
        return view('livewire.admin.admin-edit-article-component', [
            'article' => $this->article,
        ])->layout('layouts.admin');
    }
}
