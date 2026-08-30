@section('title', 'Системы отопления и кондиционированния в Алматы | Европейские Технологии')
<!-- Main -->
<main class="content">       
    <section class="container">
        <div class="sliders__wrapper">
            <div class="slider__wrap">
                <div class="flexslider">
                    <ul class="slides">    
                        @foreach ($slides as $slide)
                            <li>
                                <a href="{{$slide->link}}">
                                    <img src="{{asset('assets/images/slides')}}/{{$slide->image}}"  alt="">
                                </a>
                            </li>
                        @endforeach                        
                    </ul>
                </div>
            </div>
            <div class="slider__banners">
                <div class="slider__banner">
                    <h4>Воздухонагреватели R&S</h4>
                    <div class="slider__banner_content_wrap">
                        <img src="{{asset('assets/images/banners/banner_1.png')}}" alt="">
                        <div class="slider__banner_content">
                            <p>Предоставляется возможность выбора горелок на газу или на...</p>
                            <div class="slider__banner_btn">Подробнее...</div>
                        </div>
                    </div>
                </div>
                <div class="slider__banner">
                    <h4>Горелки Iran Radiator</h4>
                    <div class="slider__banner_content_wrap">
                        <img src="{{asset('assets/images/banners/banner_2.png')}}" alt="">
                        <div class="slider__banner_content">
                            <p>Компания Iran Radiator на сегодня является самым крупным...</p>
                            <div class="slider__banner_btn">Подробнее...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section class="categories__wrapper">
        <div class="container">
            <div class="categories">
                <h2>Категории продукции</h2>
                <div class="categories__wrap">
                    @foreach ($categories as $category)
                        <a href="{{ route('category', ['slug' => $category->slug]) }}" class="categories__item">
                            <img src="{{asset('assets/images/categories')}}/{{$category->image}}" alt="">
                            <h4>{{$category->title}}</h4>
                        </a>
                    @endforeach                    
                </div>
            </div> 
        </div>            
    </section>
    <section class="best__wrapper">
        <div class="container">
            <div class="bests__wrap">
                <div class="best__item">
                    <img src="{{asset('assets/images/design/best_1.jpg')}}" alt="">
                    <h5>Клиентский сервис</h5>
                </div>
                <div class="best__item">
                    <img src="{{asset('assets/images/design/best_2.jpg')}}" alt="">
                    <h5>Бонусы за покупку</h5>
                </div>
                <div class="best__item">
                    <img src="{{asset('assets/images/design/best_3.jpg')}}" alt="">
                    <h5>Гарантия качества</h5>
                </div>
                <div class="best__item">
                    <img src="{{asset('assets/images/design/best_4.jpg')}}" alt="">
                    <h5>Быстрая доставка</h5>
                </div>
            </div>
        </div>
    </section>
    <section class="special__home_wrapper">
        <div class="container">
            <div class="special__home">
                
            </div>
        </div>
    </section>
    <section class="about__wrapper">
        <div class="container">
            <div class="about__home">
                <h2>О компании</h2>
                <div class="about__content_wrap">
                    <div class="about__logo_name">
                        <img src="{{asset('assets/images/design/header__logo.png')}}" alt="">
                        <h1>Системы отопления и кондиционированния в Алматы</h1>
                    </div>
                    <div class="about__content">
                        <p>Наша компания предоставляет комплексные услуги в сфере отопления, холодоснабжения, водоснабжения и проектирования в Алматы и по всему Казахстану. Мы работаем с жилыми домами, квартирами, офисными центрами и промышленными объектами, предлагая современные инженерные решения, которые обеспечивают комфорт, надежность и экономичность.</p>
                        <h6>Отопление в Алматы</h6>
                        <p>Системы отопления под ключ — одно из ключевых направлений нашей работы. Мы занимаемся проектированием и монтажом отопления в частных домах, коттеджах, квартирах и офисных зданиях. Используем современные котлы, радиаторы, теплые полы и автоматику, что позволяет снизить энергозатраты и создать оптимальный микроклимат. Наши системы отопления в Алматы отличаются долговечностью и эффективностью.</p>
                        <h6>Холодоснабжение и кондиционирование</h6>
                        <p>Мы предлагаем профессиональные решения по установке и обслуживанию систем холодоснабжения. В нашем портфолио — монтаж чиллеров, фанкойлов, центральных кондиционеров и климатических установок. Такие системы востребованы для торговых комплексов, бизнес-центров и производственных предприятий. Качественное холодоснабжение в Алматы — гарантия стабильной работы оборудования и комфорта людей.</p>
                    </div>
                    <div class="about__btn_wrap">
                        <a href="#" class="about__btn">Читать полностью...</a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section class="blog__wrapper">
        <div class="container">
            <h2>Блог</h2>
            <div class="blog__content">
                @foreach ($articles as $article)
                    <a href="{{ route('article', ['article_slug' => $article->slug]) }}" class="blog__item">
                        <figure>
                            <img src="{{asset('assets/images/articles')}}/{{$article->image}}" class="blog__item_img" alt="">
                        </figure>                        
                        <div class="blog__item_content">
                            <h3>{{$article->title}}</h3>
                            <p>{{$article->short_description}}</p>
                        </div>
                    </a>
                @endforeach                
            </div>
        </div>
    </section>
</main>