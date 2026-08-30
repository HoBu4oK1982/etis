<div id="mobileSearchForm" class="{{ !empty($query) ? 'active' : '' }}" wire:ignore.self>
    <form class="header__middle__search" id="menuSearchDesktop" action="{{route('product.search')}}">
        <input 
            class="headerSearchInput"
            required
            type="type"
            name="search" 
            value="{{$search}}"
            placeholder="Поиск по каталогу..."
            wire:model.live="query"
            autocomplete="off"
            wire:keydown.escape = "preset"
            wire:keydown.tab = "preset"
        />
        <button class="headerSearchBtn" type="submit">ПОИСК...</button>
        @if (!empty($query))
            <div class="searchOverlay" wire:click="preset"></div>

            <div class="searchListHeader">
                @if (!empty($products))
                    @foreach ($products as $product)
                        <a href="{{route('product.details', ['slug' => $product['slug']])}}" class="searchListHeaderA" >{{ $product['title'] }}</a>
                    @endforeach
                @else
                    <div class="searchListHeaderA">
                        Ничего не найдено!
                    </div>
                @endif
            </div>
        @endif
    </form>
</div>