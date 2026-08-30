@section ('title', "$product->title")
@section ('meta_description', "$product->meta_description")
@section ('meta_keywords', "$product->meta_keywords")

<section class="container" wire:key="product-details-{{ $product->id }}">
    <div class="commonBreadcrumbs">
        <ul>
            <li>
                <a href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                        <path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>
                    </svg>
                </a>
            </li>
            →
            <li><a href="{{ route('shop') }}">Магазин</a></li>

            @php
                $crumbCats = [];
                $c = $product->category ?? null;
                while ($c) {
                    $crumbCats[] = $c;
                    $c = $c->parent ?? null;
                }
                $crumbCats = array_reverse($crumbCats);
                $root = $crumbCats[0] ?? null;
            @endphp

            @if($root)
                @foreach($crumbCats as $idx => $cat)
                    →
                    <li>
                        @php
                            $segments = array_slice(array_map(fn($x) => $x->slug, $crumbCats), 1, $idx);
                            $url = $idx === 0
                                ? route('category', ['slug' => $root->slug])
                                : route('category.path', ['slug' => $root->slug, 'path' => implode('/', $segments)]);
                        @endphp
                        <a href="{{ $url }}">{{ $cat->title }}</a>
                    </li>
                @endforeach
            @endif

            →
            <li>{!! $product->title !!}</li>
        </ul>
    </div>

    <div class="detailWrapper">
        @php
            $effectivePrice = $product->selling_price ?? $product->price;
        @endphp

        <div class="product__content_wrap">
            <div class="product__content_img" wire:ignore>
                <div class="flexslider">
                    <ul class="slides">
                        @if($product->images && $product->images->count())
                            @foreach ($product->images as $im)
                                <li>
                                    <img src="{{ asset('assets/images/products/' . $im->file_name) }}" class="product__item-img" alt="Product Image">
                                </li>
                            @endforeach
                        @else
                            <li>
                                <img src="{{ asset('assets/images/design/no-image.jpg') }}" class="product__item-img" alt="No Image">
                            </li>
                        @endif
                    </ul>
                </div>
            </div>

            <div class="detailsConent">
                <h1 class="detailTitle">{!! ucfirst($product->title) !!}</h1>

                <div class="deatailOneCLick" data-fancybox="dialog" data-src="#dialog-content2">
                    Купить в 1 клик
                </div>

                {{-- ✅ Fancybox попап изолируем от морфинга Livewire --}}
                <div wire:ignore>
                    <div id="dialog-content2" style="display:none;max-width:500px;">
                        <form class='mailform' id="oneClick" action="javascript:void(null);" onsubmit="oneClick()">
                            <input type="hidden" name="product" value="{{ $product->title }}"/>
                            <label class="form-text">Купить в 1 клик!</label>
                            <div class="form-text-anons">Оставьте заявку и наш специалист свяжется<br/> с Вами в ближайшее время:</div>
                            <fieldset class="loginFieldset frmEmailWrapCall">
                                <i class="fa-solid fa-user" aria-hidden="true"></i>
                                <input type="text" name="name" required="" placeholder="Ваше имя:" class="inputCall">
                            </fieldset>
                            <fieldset class="loginFieldset frmEmailWrapCall">
                                <i class="fa-solid fa-phone-volume" aria-hidden="true"></i>
                                <input type="text" name="phone" required="" placeholder="+7 (___) ___-__-__" class="inputCall art-stranger">
                            </fieldset>
                            <div class="formBtn">
                                <button class="btn-form light" type="submit">Купить</button>
                            </div>
                        </form>
                    </div>
                </div>

                @if ($product->remark === 'sale')
                    <div class="remarkIcon remarkSale">Акция</div>
                @elseif ($product->remark === 'new')
                    <div class="remarkIcon remarkNew">Новинка</div>
                @elseif ($product->remark === 'hit')
                    <div class="remarkIcon remarkHit">Хит продаж</div>
                @endif

                @if (!empty($product->selling_price) && (float)$product->selling_price > 0 && (float)$product->selling_price < (float)$product->price)
                    <div class="detailsPrice red">{{ number_format($product->price, 0, '.', ' ') }}<span>тг</span></div>
                    <div class="productSalePrice">{{ number_format($product->selling_price, 0, '.', ' ') }}<span>тг</span></div>
                @else
                    <div class="detailsPrice">{{ number_format($product->price, 0, '.', ' ') }} <span>тг</span></div>
                @endif

                <livewire:product-buy-box-component
                    :product-id="$product->id"
                    :key="'buybox-'.$product->id"
                />

                @php
                    $descRaw = (string)($product->description ?? '');
                    $hasDescription = trim(strip_tags($descRaw)) !== '';

                    $pairs = collect();
                    $htmlBlocks = collect();
                    if ($product->attributes && $product->attributes->count()) {
                        $pairs = $product->attributes
                            ->where('type', 'pair')
                            ->filter(fn($a) => trim((string)$a->name) !== '' || trim((string)$a->value) !== '');
                        $htmlBlocks = $product->attributes
                            ->where('type', 'html')
                            ->filter(fn($a) => trim((string)$a->content) !== '');
                    }
                    $hasSpecs = $pairs->count() || $htmlBlocks->count();

                    $tabsId = 'product-tabs-' . $product->id;
                    $tabDescId = 'product-desc-' . $product->id;
                    $tabSpecsId = 'product-specs-' . $product->id;
                    $defaultTab = $hasDescription ? $tabDescId : ($hasSpecs ? $tabSpecsId : $tabDescId);
                @endphp

                @if($hasDescription || $hasSpecs)
                    <style>
                        /* === Tabs === */
                        .productTabs { margin-top: 24px; }
                        .productTabs__nav { display: flex; gap: 10px; flex-wrap: wrap; border-bottom: 1px solid rgba(255,255,255,.08); }
                        .productTabs__btn {
                            appearance: none; border: 0; background: transparent; padding: 12px 14px;
                            font-weight: 600; cursor: pointer; opacity: .5; position: relative;
                            font-size: 20px; color: inherit; transition: opacity .2s ease;
                        }
                        .productTabs__btn:hover { opacity: .8; }
                        .productTabs__btn.is-active { opacity: 1; }
                        .productTabs__btn.is-active::after {
                            content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
                            background: currentColor;
                        }
                        .productTabs__pane { display: none; padding-top: 16px; }
                        .productTabs__pane.is-active { display: block; }

                        /* === Specs accordion === */
                        .specsBlock {
                            margin-top: 6px;
                            border-radius: 12px;
                            overflow: hidden;
                        }
                        .specsBlock__toggle {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            width: 100%;
                            padding: 18px 4px;
                            background: transparent;
                            border: none;
                            cursor: pointer;
                            color: inherit;
                        }
                        .specsBlock__toggle h3 {
                            margin: 0;
                            font-size: 20px;
                            font-weight: 700;
                            color: inherit;
                        }
                        .specsBlock__chevron {
                            width: 20px;
                            height: 20px;
                            fill: currentColor;
                            opacity: .6;
                            transition: transform .3s ease;
                        }
                        .specsBlock.is-open .specsBlock__chevron {
                            transform: rotate(180deg);
                        }
                        .specsBlock__body {
                            max-height: 0;
                            overflow: hidden;
                            transition: max-height .35s ease;
                        }
                        .specsBlock.is-open .specsBlock__body {
                            max-height: 2000px;
                        }

                        /* === Spec rows === */
                        .specRow {
                            display: flex;
                            align-items: baseline;
                            padding: 14px 4px;
                            border-top: 1px solid rgba(255,255,255,.07);
                        }
                        .specRow:last-child {
                            border-bottom: none;
                        }
                        .specRow__name {
                            flex-shrink: 0;
                            font-size: 15px;
                            opacity: .65;
                            white-space: nowrap;
                        }
                        .specRow__dots {
                            flex: 1;
                            min-width: 20px;
                            margin: 0 8px;
                            border-bottom: 1px dotted rgba(255,255,255,.15);
                            position: relative;
                            top: -4px;
                        }
                        .specRow__value {
                            flex-shrink: 0;
                            font-size: 15px;
                            font-weight: 600;
                            text-align: right;
                            white-space: nowrap;
                        }

                        /* HTML blocks inside specs */
                        .specsBlock__html {
                            padding: 12px 4px 16px;
                            border-top: 1px solid rgba(255,255,255,.07);
                            line-height: 1.6;
                        }

                        /* === Light theme overrides === */
                        body:not(.dark) .productTabs__nav,
                        .light-theme .productTabs__nav {
                            border-bottom-color: rgba(0,0,0,.08);
                        }
                        body:not(.dark) .specRow,
                        .light-theme .specRow {
                            border-top-color: rgba(0,0,0,.08);
                        }
                        body:not(.dark) .specRow__dots,
                        .light-theme .specRow__dots {
                            border-bottom-color: rgba(0,0,0,.15);
                        }
                        body:not(.dark) .specsBlock__html,
                        .light-theme .specsBlock__html {
                            border-top-color: rgba(0,0,0,.08);
                        }
                    </style>

                    <div class="productTabs" id="{{ $tabsId }}" wire:ignore>
                        <div class="productTabs__nav" role="tablist" aria-label="Табы товара">
                            @if($hasDescription)
                                <button
                                    type="button"
                                    class="productTabs__btn {{ $defaultTab === $tabDescId ? 'is-active' : '' }}"
                                    role="tab"
                                    aria-controls="{{ $tabDescId }}"
                                    aria-selected="{{ $defaultTab === $tabDescId ? 'true' : 'false' }}"
                                    data-tab-target="{{ $tabDescId }}"
                                >Описание</button>
                            @endif

                            @if($hasSpecs)
                                <button
                                    type="button"
                                    class="productTabs__btn {{ $defaultTab === $tabSpecsId ? 'is-active' : '' }}"
                                    role="tab"
                                    aria-controls="{{ $tabSpecsId }}"
                                    aria-selected="{{ $defaultTab === $tabSpecsId ? 'true' : 'false' }}"
                                    data-tab-target="{{ $tabSpecsId }}"
                                >Характеристики</button>
                            @endif
                        </div>

                        <div class="productTabs__panes">
                            @if($hasDescription)
                                <div id="{{ $tabDescId }}" class="productTabs__pane {{ $defaultTab === $tabDescId ? 'is-active' : '' }}" role="tabpanel">
                                    <div class="detailDescr">{!! $product->description !!}</div>
                                </div>
                            @endif

                            @if($hasSpecs)
                                <div id="{{ $tabSpecsId }}" class="productTabs__pane {{ $defaultTab === $tabSpecsId ? 'is-active' : '' }}" role="tabpanel">

                                    @if($pairs->count())
                                        <div class="specsBlock is-open" id="specsAccordion-{{ $product->id }}">
                                            <button type="button" class="specsBlock__toggle" onclick="this.closest('.specsBlock').classList.toggle('is-open')">
                                                <h3>Характеристики</h3>
                                                <svg class="specsBlock__chevron" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                                                </svg>
                                            </button>
                                            <div class="specsBlock__body">
                                                @foreach($pairs as $attr)
                                                    <div class="specRow">
                                                        <span class="specRow__name">{{ $attr->name }}</span>
                                                        <span class="specRow__dots"></span>
                                                        <span class="specRow__value">{{ $attr->value }}</span>
                                                    </div>
                                                @endforeach
                                            </div>
                                        </div>
                                    @endif

                                    @if($htmlBlocks->count())
                                        <div class="specsBlock__html">
                                            @foreach($htmlBlocks as $attr)
                                                {!! $attr->content !!}
                                            @endforeach
                                        </div>
                                    @endif

                                </div>
                            @endif
                        </div>
                    </div>

                    <script>
                        (function () {
                            function initTabs(root) {
                                if (!root) return;
                                const buttons = root.querySelectorAll('[data-tab-target]');
                                const panes = root.querySelectorAll('.productTabs__pane');
                                if (!buttons.length || !panes.length) return;

                                function activate(targetId) {
                                    buttons.forEach(btn => {
                                        const isActive = btn.getAttribute('data-tab-target') === targetId;
                                        btn.classList.toggle('is-active', isActive);
                                        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
                                    });
                                    panes.forEach(p => p.classList.toggle('is-active', p.id === targetId));
                                }

                                buttons.forEach(btn => {
                                    btn.addEventListener('click', function () {
                                        activate(btn.getAttribute('data-tab-target'));
                                    }, { passive: true });
                                });
                            }

                            function boot() {
                                initTabs(document.getElementById(@json($tabsId)));
                            }

                            document.addEventListener('DOMContentLoaded', boot);
                            document.addEventListener('livewire:init', boot);
                            document.addEventListener('livewire:load', boot);
                            document.addEventListener('livewire:navigated', boot);
                        })();
                    </script>
                @endif

            </div>
        </div>

        <div class="detailPopular">
            <h4>РЕКОМЕНДУЕМЫЕ ТОВАРЫ</h4>
            <div class="deatilsRelated">
                @foreach ($related_products as $rp)
                    <x-product-card :product="$rp" />
                @endforeach
            </div>
        </div>
    </div>
</section>
