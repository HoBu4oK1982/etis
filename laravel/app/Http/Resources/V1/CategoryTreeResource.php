<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Рекурсивный ресурс для дерева категорий.
 * Использовать c ->with(['activeChildren.activeChildren.activeChildren.activeChildren'])
 *
 * Важно: children отдаём ВСЕГДА, даже если связь не подгружена.
 * Раньше здесь стоял whenLoaded(), и на последнем уровне вложенности
 * ключ children просто отсутствовал в JSON — фронт падал на
 * node.children.length. Пустой массив честнее: «детей нет или мы их
 * не грузили» для клиента одно и то же.
 */
class CategoryTreeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'        => $this->id,
            'title'     => (string) $this->title,
            'slug'      => (string) $this->slug,
            'parent_id' => $this->parent_id,
            'position'  => (int) $this->position,
            'children'  => $this->relationLoaded('activeChildren')
                ? self::collection($this->activeChildren)
                : [],
        ];
    }
}
