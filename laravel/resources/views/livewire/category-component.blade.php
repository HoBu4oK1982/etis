@section('title', $currentCategory->meta_title ?? $currentCategory->title)
@section('meta_description', $currentCategory->meta_description ?? '')
@section('meta_keywords', $currentCategory->meta_keywords ?? '')

<div class="container">
    <div class="shopCategoryWrapper">
        <h1 class="davrTitle">{{ $currentCategory->title }}</h1>
        <x-breadcrumbs :items="$breadcrumbs" />
        <div class="shopCategory">
            {{-- LEFT: tree + filters --}}
            <div class="shopCategory__left">

                {{-- Category tree (children of root) --}}
                <div class="categoryLeft__block">
                    <h3>Категории</h3>
                    @if($rootTree)
                        @include('livewire.partials.category-tree', [
                            'nodes' => $rootTree->activeChildren,
                            'rootSlug' => $rootCategory->slug,
                            'currentId' => $currentCategory->id,
                            'expanded' => $expanded,
                            'pathPrefix' => '',
                        ])
                    @endif
                </div>

                {{-- Filters --}}
                <div class="categoryLeft__block">
                    <h3>Фильтры</h3>

                    <div style="margin-bottom:12px;">
                        <div style="display:flex; gap:10px;">
                            <input type="number" placeholder="Цена от" style="width:100%;" wire:model.live.debounce.400ms="price_from">
                            <input type="number" placeholder="Цена до" style="width:100%;" wire:model.live.debounce.400ms="price_to">
                        </div>
                    </div>

                    <div class=" sort-item">
                        <select style="width:100%;" wire:model.live="brand_id">
                            <option value="">Все бренды</option>
                            @foreach($brands as $b)
                                <option value="{{ $b->id }}">{{ $b->title }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div style="display:flex; gap:10px;">
                        <button type="button" class="categoryLeft__block_button" wire:click="clearFilters">Сбросить</button>
                    </div>
                </div>

            </div>

            {{-- CENTER: products --}}
            <div class="shopCategory__right">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; flex-wrap:wrap;">
                    <div class=" sort-item">
                        <select wire:model.live="sort">
                            <option value="default">Сортировка: по умолчанию</option>
                            <option value="date">Сначала новые</option>
                            <option value="price">Цена: по возрастанию</option>
                            <option value="price-desc">Цена: по убыванию</option>
                        </select>
                    </div>
                    <div style="opacity:.75;">Найдено: {{ $products->total() }}</div>
                </div>

                <div class="category__pages__content">
                    @forelse($products as $p)
                        <x-product-card :product="$p" />
                    @empty
                        <div style="padding:20px;">Товары не найдены.</div>
                    @endforelse
                </div>

                <div style="margin-top:20px;">
                    {{ $products->links() }}
                </div>
            </div>
        </div>
    </div>
</div>
