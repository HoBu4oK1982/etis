@section('title', 'Магазин')

<div class="container">
    <div class="shopCategoryWrapper"> 
        <h1 class="davrTitle">Магазин</h1>

        <x-breadcrumbs :items="$breadcrumbs" />

        <div style="padding:0;">
            <div class="categories">
                <div class="categories__wrap">
                    @foreach ($categories as $category)
                        <a href="{{ route('category', ['slug' => $category->slug]) }}" class="categories__item">
                            @if(!empty($category->image))
                                <img src="{{ asset('assets/images/categories/' . $category->image) }}" alt="{{ $category->title }}">
                            @else
                                <img src="{{ asset('assets/images/design/no-image.jpg') }}" alt="{{ $category->title }}">
                            @endif
                            <h4>{{ $category->title }}</h4>
                        </a>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</div>
