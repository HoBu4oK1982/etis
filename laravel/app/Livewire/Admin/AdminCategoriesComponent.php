<?php

namespace App\Livewire\Admin;

use App\Models\Category;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Livewire\Component;
use Livewire\WithPagination;

class AdminCategoriesComponent extends Component
{
    use WithPagination;

    /**
     * Bootstrap pagination styles.
     */
    protected string $paginationTheme = 'bootstrap';

    public string $search = '';
    public int $perPage = 50;
    public string $filterStatus = '';

    /**
     * Expanded category IDs for tree view.
     * By default empty => only root level is shown.
     *
     * @var array<int>
     */
    public array $expanded = [];

    public function updatingSearch(): void { $this->resetPage(); }
    public function updatingFilterStatus(): void { $this->resetPage(); }

    public function toggle(int $categoryId): void
    {
        if (in_array($categoryId, $this->expanded, true)) {
            $this->expanded = array_values(array_diff($this->expanded, [$categoryId]));
        } else {
            $this->expanded[] = $categoryId;
            $this->expanded = array_values(array_unique($this->expanded));
        }

        // When collapsing/expanding, keep pagination stable.
        $this->resetPage();
    }

    /**
     * Переключить статус категории (активна / неактивна).
     */
    public function toggleStatus(int $categoryId): void
    {
        $category = Category::find($categoryId);
        if ($category) {
            $category->status = $category->status == 0 ? 1 : 0;
            $category->save();

            $statusText = $category->status == 0 ? 'включена' : 'выключена';
            session()->flash('message', "Категория \"{$category->title}\" {$statusText}.");
        }
    }

    /**
     * Build visible rows for tree view (root + expanded branches).
     *
     * @param  Collection<int, Category>  $categories
     * @return array<int, array{category: Category, depth: int, path: string, has_children: bool}>
     */
    protected function buildVisibleTreeRows(Collection $categories): array
    {
        $byParent = [];

        foreach ($categories as $cat) {
            $pid = $cat->parent_id ?: 0;
            $byParent[$pid][] = $cat;
        }

        // Sort siblings: position ASC, title ASC
        foreach ($byParent as &$list) {
            usort($list, function (Category $a, Category $b) {
                $pa = (int) ($a->position ?? 0);
                $pb = (int) ($b->position ?? 0);

                if ($pa !== $pb) {
                    return $pa <=> $pb;
                }

                return strcmp(mb_strtolower((string) $a->title), mb_strtolower((string) $b->title));
            });
        }
        unset($list);

        $expanded = $this->expanded;
        $rows = [];

        $walk = function (int $parentId, int $depth, string $path) use (&$walk, &$rows, $byParent, $expanded): void {
            if (empty($byParent[$parentId])) {
                return;
            }

            foreach ($byParent[$parentId] as $cat) {
                $newPath = $path ? ($path . ' / ' . $cat->title) : $cat->title;

                $hasChildren = !empty($byParent[(int) $cat->id]);

                $rows[] = [
                    'category' => $cat,
                    'depth' => $depth,
                    'path' => $newPath,
                    'has_children' => $hasChildren,
                ];

                // Descend only if expanded.
                if ($hasChildren && in_array((int) $cat->id, $expanded, true)) {
                    $walk((int) $cat->id, $depth + 1, $newPath);
                }
            }
        };

        // root
        $walk(0, 0, '');

        return $rows;
    }

    /**
     * Build rows for search results (no collapse): matches + full path.
     *
     * @param  Collection<int, Category>  $allCategories
     * @param  string  $search
     * @return array<int, array{category: Category, depth: int, path: string, has_children: bool}>
     */
    protected function buildSearchRows(Collection $allCategories, string $search): array
    {
        $s = mb_strtolower(trim($search));

        $map = $allCategories->keyBy('id');

        $matches = $allCategories->filter(function (Category $c) use ($s) {
            $t = mb_strtolower((string) $c->title);
            $sl = mb_strtolower((string) $c->slug);
            return str_contains($t, $s) || str_contains($sl, $s);
        });

        // Sort like tree siblings: position ASC then title ASC
        $matches = $matches->sort(function (Category $a, Category $b) {
            $pa = (int) ($a->position ?? 0);
            $pb = (int) ($b->position ?? 0);
            if ($pa !== $pb) {
                return $pa <=> $pb;
            }
            return strcmp(mb_strtolower((string) $a->title), mb_strtolower((string) $b->title));
        })->values();

        $rows = [];

        foreach ($matches as $cat) {
            $pathParts = [];
            $depth = 0;

            $cursor = $cat;
            // Protect from accidental loops.
            $guard = 0;

            while ($cursor && $guard < 50) {
                array_unshift($pathParts, (string) $cursor->title);
                if ($cursor->parent_id) {
                    $depth++;
                }
                $cursor = $cursor->parent_id ? ($map[$cursor->parent_id] ?? null) : null;
                $guard++;
            }

            $rows[] = [
                'category' => $cat,
                'depth' => max(0, $depth),
                'path' => implode(' / ', $pathParts),
                'has_children' => false,
            ];
        }

        return $rows;
    }

    protected function paginateRows(array $allRows): LengthAwarePaginator
    {
        $page = LengthAwarePaginator::resolveCurrentPage();
        $total = count($allRows);

        $items = collect($allRows)
            ->slice(($page - 1) * $this->perPage, $this->perPage)
            ->values();

        return new LengthAwarePaginator(
            $items,
            $total,
            $this->perPage,
            $page,
            [
                'path' => request()->url(),
                'query' => request()->query(),
            ]
        );
    }

    public function render()
    {
        // Load all categories once: needed for tree + search paths.
        $all = Category::query()->get();

        $s = trim($this->search);

        if ($s !== '') {
            $rowsArray = $this->buildSearchRows($all, $s);
        } else {
            $rowsArray = $this->buildVisibleTreeRows($all);
        }

        $rows = $this->paginateRows($rowsArray);

        // Фильтр по статусу — ПОСЛЕ построения дерева
        if ($this->filterStatus !== '') {
            $st = (int) $this->filterStatus;
            $filtered = array_values(array_filter($rowsArray, fn($row) => (int)$row['category']->status === $st));
            $rows = $this->paginateRows($filtered);
        }

        return view('livewire.admin.admin-categories-component', [
            'rows' => $rows,
        ])->layout('layouts.admin');
    }
}
