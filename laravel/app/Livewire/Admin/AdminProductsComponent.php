<?php

namespace App\Livewire\Admin;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Livewire\Component;
use Livewire\WithPagination;

class AdminProductsComponent extends Component
{
    use WithPagination;

    protected string $paginationTheme = 'bootstrap';

    public string $search = '';
    public int $perPage = 20;
    public string $filterStatus = '';
    public string $filterRemark = '';

    public function updatingSearch(): void { $this->resetPage(); }
    public function updatingFilterStatus(): void { $this->resetPage(); }
    public function updatingFilterRemark(): void { $this->resetPage(); }

    private function buildCategoryPaths(): array
    {
        $cats = Category::query()->select(['id', 'title', 'parent_id'])->get();
        $byId = $cats->keyBy('id');
        $cache = [];

        $build = function (int $id) use (&$build, &$cache, $byId): string {
            if (isset($cache[$id])) {
                return $cache[$id];
            }
            $cat = $byId->get($id);
            if (!$cat) {
                return $cache[$id] = '';
            }
            $titles = [$cat->title];
            $p = $cat->parent_id;
            $guard = 0;
            while ($p && $guard < 20) {
                $guard++;
                $parent = $byId->get($p);
                if (!$parent) {
                    break;
                }
                array_unshift($titles, $parent->title);
                $p = $parent->parent_id;
            }
            return $cache[$id] = implode(' / ', $titles);
        };

        $paths = [];
        foreach ($byId as $id => $cat) {
            $paths[$id] = $build((int)$id);
        }
        return $paths;
    }

    public function render()
    {
        $q = Product::query()->with(['category','brand']);

        if (trim($this->search) !== '') {
            $s = trim($this->search);
            $q->where(function (Builder $qq) use ($s) {
                $qq->where('title', 'like', "%{$s}%")
                    ->orWhere('slug', 'like', "%{$s}%")
                    ->orWhere('sku', 'like', "%{$s}%")
                    ->orWhereHas('brand', function (Builder $b) use ($s) {
                        $b->where('title', 'like', "%{$s}%");
                    });
            });
        }

        if ($this->filterStatus !== '') {
            $q->where('status', (int) $this->filterStatus);
        }

        if ($this->filterRemark !== '') {
            if ($this->filterRemark === 'none') {
                $q->whereNull('remark');
            } else {
                $q->where('remark', $this->filterRemark);
            }
        }

        $products = $q->orderByDesc('id')->paginate($this->perPage);

        $categoryPaths = $this->buildCategoryPaths();

        return view('livewire.admin.admin-products-component', [
            'products' => $products,
            'categoryPaths' => $categoryPaths,
        ])->layout('layouts.admin');
    }
}
