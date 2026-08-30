@php
    /**
     * @var \App\Models\Category $category
     * @var string $rootSlug
     * @var string $pathPrefix  // относительный путь под root (без ведущего/замыкающего слеша)
     * @var bool $isRoot
     */

    $hasChildren = $category->activeChildren && $category->activeChildren->count() > 0;

    if (!isset($isRoot)) {
        $isRoot = false;
    }

    if (!isset($pathPrefix)) {
        $pathPrefix = '';
    }

    // URL категории
    if ($isRoot) {
        $url = route('category', ['slug' => $category->slug]);
        $nextPrefix = '';
    } else {
        $nextPrefix = trim($pathPrefix, '/');
        $url = route('category.path', ['slug' => $rootSlug, 'path' => $nextPrefix]);
    }
@endphp

<li class="catalog-item {{ $hasChildren ? 'has-children' : '' }}">
    <a href="{{ $url }}">
        {{ $category->title }}
        @if($hasChildren)
            <span class="catalog-arrow">›</span>
        @endif
    </a>

    @if($hasChildren)
        <ul class="catalog-submenu">
            @foreach($category->activeChildren as $child)
                @php
                    $childPath = $isRoot
                        ? $child->slug
                        : trim($nextPrefix . '/' . $child->slug, '/');
                @endphp

                @include('partials.catalog-menu-item', [
                    'category' => $child,
                    'rootSlug' => $rootSlug,
                    'pathPrefix' => $childPath,
                    'isRoot' => false,
                ])
            @endforeach
        </ul>
    @endif
</li>
