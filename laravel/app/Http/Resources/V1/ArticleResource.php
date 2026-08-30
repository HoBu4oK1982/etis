<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ArticleResource extends JsonResource
{
    public function toArray($request): array
    {
        $isFull = (bool) $request->route('article_slug') || (bool) $request->route('slug');
        $content = (string) ($this->description ?? '');
        $excerpt = (string) ($this->short_description ?? '');

        if ($excerpt === '' && $content !== '') {
            $excerpt = Str::limit(trim(preg_replace('/\s+/u', ' ', strip_tags($content))), 220);
        }

        $plainContent = trim(preg_replace('/\s+/u', ' ', strip_tags($content)));
        $wordCount = $plainContent === ''
            ? 0
            : count(preg_split('/\s+/u', $plainContent, -1, PREG_SPLIT_NO_EMPTY));

        $image = null;
        if ($this->image) {
            $value = (string) $this->image;
            if (preg_match('~^https?://~i', $value)) {
                $image = $value;
            } elseif (str_starts_with($value, '/')) {
                $image = asset(ltrim($value, '/'));
            } else {
                $image = asset('assets/images/articles/' . ltrim($value, '/'));
            }
        }

        return [
            'id'           => $this->id,
            'title'        => (string) $this->title,
            'slug'         => (string) $this->slug,
            'excerpt'      => $excerpt !== '' ? $excerpt : null,
            'image'        => $image,
            'content'      => $this->when($isFull, $content !== '' ? $content : null),
            'reading_time' => max(1, (int) ceil($wordCount / 180)),
            'meta' => [
                'title'       => $this->meta_title ?: $this->title,
                'description' => $this->meta_description ?: ($excerpt !== '' ? $excerpt : null),
                'keywords'    => $this->meta_keywords ?: null,
            ],
            'created_at'   => optional($this->created_at)->toIso8601String(),
            'updated_at'   => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
