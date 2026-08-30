@section('title', 'Бренды')

<div class="container">
    <div class="shopCategoryWrapper">
        <h1 class="davrTitle">Бренды</h1>

        <x-breadcrumbs :items="$breadcrumbs" />

        <div style="padding:0;">
            <div class="categories">
                <div class="categories__wrap">
                    @forelse($brands as $brand)
                        <a href="{{ route('brand', ['slug' => $brand->slug]) }}" class="categories__item">
                            @if(!empty($brand->image))
                                <img src="{{ asset('assets/images/brands/' . $brand->image) }}" alt="{{ $brand->title }}">
                            @else
                                <img src="{{ asset('assets/images/design/no-image.jpg') }}" alt="{{ $brand->title }}">
                            @endif
                            <h4>{{ $brand->title }}</h4>
                        </a>
                    @empty
                        <div style="padding:20px;">Бренды не найдены.</div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>
