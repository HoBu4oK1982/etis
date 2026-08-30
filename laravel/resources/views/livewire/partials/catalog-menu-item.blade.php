@php
    // Ссылка: /category/{rootSlug}/{path...}
    $fullPath = trim($pathPrefix . '/' . $category->slug, '/');
    $url = $isRoot
        ? url('/category/' . $category->slug)
        : url('/category/' . $rootSlug . '/' . $fullPath);

    $children = $category->activeChildren ?? collect();
    $hasChildren = $children->count() > 0;
@endphp

<li class="catalog-item">
    <a href="{{ $url }}">
        <span>{{ $category->title }}</span>
        @if($hasChildren)
            <span class="catalog-arrow">›</span>
        @endif
    </a>

    @if($hasChildren)
        <ul class="catalog-submenu">
            @foreach($children as $child)
                @include('livewire.partials.catalog-menu-item', [
                    'category' => $child,
                    'rootSlug' => $rootSlug,
                    'pathPrefix' => $fullPath,
                    'isRoot' => false,
                ])
            @endforeach
        </ul>
    @endif
</li>
