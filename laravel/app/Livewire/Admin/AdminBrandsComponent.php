<?php

namespace App\Livewire\Admin;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Builder;
use Livewire\Component;
use Livewire\WithPagination;

class AdminBrandsComponent extends Component
{
    use WithPagination;

    protected string $paginationTheme = 'bootstrap';

    public string $search = '';
    public int $perPage = 20;

    public function updatingSearch(): void
    {
        $this->resetPage();
    }

    public function render()
    {
        $q = Brand::query();

        if (trim($this->search) !== '') {
            $s = trim($this->search);
            $q->where(function (Builder $qq) use ($s) {
                $qq->where('title', 'like', "%{$s}%")
                    ->orWhere('slug', 'like', "%{$s}%");
            });
        }

        $brands = $q->orderBy('position')->orderBy('id')->paginate($this->perPage);

        return view('livewire.admin.admin-brands-component', [
            'brands' => $brands,
        ])->layout('layouts.admin');
    }
}
