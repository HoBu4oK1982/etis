@php
    // expected vars:
    // $nodes (Collection<Category>)
    // $rootSlug (string)
    // $currentId (int)
    // $expanded (array)
    // $pathPrefix (string) - accumulated path from root (without leading/trailing slash)
@endphp

<ul class="categoryLeft__tree" style="list-style:none; padding-left:0;">
    @foreach($nodes as $node)
        @php
            $isActive = ($node->id === $currentId);
            $hasChildren = $node->activeChildren && $node->activeChildren->count() > 0;
            $isOpen = !empty($expanded[$node->id]);
        @endphp

        <li style="margin:6px 0;">
            <div style="display:flex; align-items:center; gap:8px;">
                @if($hasChildren)
                    <button type="button"
                        wire:click="toggleExpand({{ $node->id }})"
                        style="width:22px; height:22px; line-height:22px; border:1px solid #ddd; background:#000000; color:#fff; cursor:pointer;">
                        {{ $isOpen ? '−' : '+' }}
                    </button>
                @else
                    <span style="display:inline-block; width:15px;"></span>
                @endif

                @php $nextPath = trim(($pathPrefix ? $pathPrefix.'/' : '').$node->slug, '/'); @endphp

                <a href="{{ route('category.path', ['slug' => $rootSlug, 'path' => $nextPath]) }}"
                class="cat-tree-link {{ $isActive ? 'is-active' : '' }} {{ $isOpen ? 'is-open' : '' }}">
                    {{ $node->title }}
                </a>
            </div>

            @if($hasChildren && $isOpen)
                <div style="padding-left:22px; margin-top:10px;">
                    @include('livewire.partials.category-tree', [
                        'nodes' => $node->activeChildren,
                        'rootSlug' => $rootSlug,
                        'currentId' => $currentId,
                        'expanded' => $expanded,
                        'pathPrefix' => $nextPath,
                    ])
                </div>
            @endif
        </li>
    @endforeach
</ul>
