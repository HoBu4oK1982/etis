{{-- <!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans text-gray-900 antialiased">
        <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <div>
                <a href="/">
                    <x-application-logo class="w-20 h-20 fill-current text-gray-500" />
                </a>
            </div>

            <div class="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                {{ $slot }}
            </div>
        </div>
    </body>
</html> --}}

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>@yield('title')</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="robots" content="index, follow" />
    <meta name="keywords" content="@yield('meta_keywords')" />
    <meta name="description" content="@yield('meta_description')" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE-egde" />
    <link rel="shortcut icon" type="image/x-icon" href="{{asset('assets/images/design/favicon.ico')}}" /> 
    <link rel="image_src" href="" />
    <meta property="og:title" content="@yield('title')"/>
    <meta property="og:description" content="@yield('meta_description')"/>
    <meta property="og:image" content="">
    <meta property="og:type" content="article"/>
    <meta property="og:site_name" content="">
    <meta property="og:url" content= "https://pandbox.kz" />
    @livewireStyles
    {{-- Styles --}}
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link rel="stylesheet" href="{{asset('assets/css/style.css')}}">
    <link rel="stylesheet" href="{{asset('assets/css/response.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('assets/css/flexslider.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('assets/css/owl.carousel.min.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('assets/css/magnific-popup.css')}}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.2.5/jquery.fancybox.min.css" />
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" id="theme-styles">
    <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.css" rel="stylesheet">  
    @livewireStyles
</head>
<body>
    <main>
        @livewire('header-component')
        <div class="mb-6 flex flex-col sm:justify-center items-center pt-6 sm:pt-0">
            <div class="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg mt-4">
                {{ $slot }}
            </div>
        </div>
    </main>
    @livewire('footer-component')
    <div class="scrollTopBtn">
        <img src="{{asset('assets/images/design/arrow__top.png')}}" alt="">
    </div> 
    {{-- Scripts --}}
    @livewireScripts    
    @php($recaptcha_sitekey = config('services.nocaptcha.sitekey'))
    @if($recaptcha_sitekey)
        <script src="https://www.google.com/recaptcha/api.js?render={{ $recaptcha_sitekey }}"></script>
    @endif
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.2.5/jquery.fancybox.min.js"></script>    
    <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@latest/bundled/lenis.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.4/gsap.min.js"
        integrity="sha512-EZI2cBcGPnmR89wTgVnN3602Yyi7muWo8y1B3a8WmIv1J9tYG+udH4LvmYjLiGp37yHB7FfaPBo8ly178m9g4Q=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/ScrollTrigger.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>
    <script type="text/javascript" src="{{asset('assets/js/mask.js')}}"></script>
    <script type="text/javascript" src="{{asset('assets/js/jquery.flexslider.js')}}"></script>
    <script type="text/javascript" src="{{asset('assets/js/jquery.magnific-popup.js')}}"></script>
    <script type="text/javascript" src="{{asset('assets/js/owl.carousel.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('assets/js/main.js')}}"></script>
    <!-- GSAP ANIMATION -->
    <script>

        //Smooth scroll
        const lenis = new Lenis()

        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }
        requestAnimationFrame(raf)
        //Smooth scroll
        gsap.registerPlugin(ScrollTrigger);




        //Scroll to top btn

        gsap.set('.scrollTopBtn', {
            position: 'fixed',
            bottom: '-100px',
            right: '60px',
            opacity: 0,
        });

        const tl2 = gsap.timeline({
            scrollTrigger: {
                start: 'top+=200',
                end: '+=.5',
                toggleActions: 'play none none reverse',
                scrub: 2,
            }
        });

        gsap.set('.scrollTopBtn', {
            position: 'fixed',
            bottom: '-100px',
            right: '60px',
            opacity: 0,
        });

        tl2.to('.scrollTopBtn', {
            bottom: '100px',
            opacity: 1,
        })

        //Scroll actions

        const scrollToTop = document.querySelector('.scrollTopBtn');
        scrollToTop.addEventListener('click', () => {
            lenis.scrollTo('top', {
                duration: 1,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            })
        });
        //Resolution
        let mm = gsap.matchMedia();
        
        mm.add("(min-width:0) and (max-width: 768px)", () => {
            gsap.registerPlugin(ScrollTrigger);
            gsap.set('.scrollTopBtn', {
                position: 'fixed',
                bottom: '-100px',
                right: '20px',
                opacity: 0,
            });


            tl2.to('.scrollTopBtn', {
                bottom: '150px',
                right: '20px',
                opacity: 1,
            });

        });
    </script>
    {{-- Flex Slider --}}
    <script type="text/javascript">
        $(window).load(function() {
            $('.flexslider').flexslider({
                animation: "slide"
            });
        });
    </script>
    {{-- Flex Slider --}}  
    {{-- Popup --}}
    <script type="text/javascript" language="javascript">
        function call(e) {
            if (e && e.preventDefault) e.preventDefault();

            const form = document.getElementById('formx');
            const siteKey = @json(config('services.nocaptcha.sitekey'));

            const sendAjax = function () {
                var msg = $('#formx').serialize();
                $.ajax({
                    type: 'POST',
                    url: '/assets/mail/mail.php',
                    data: msg,
                    success: function() {
                        alert('Сообщение успешно отправлено!');
                        $('input[name=name].inputCall').val('');
                        $('input[name=phone].inputCall').val('');
                        Fancybox.close();
                    },
                    error: function(xhr) {
                        alert('Возникла ошибка: ' + (xhr.status || xhr.responseCode || ''));
                    }
                });
            };

            if (!siteKey || typeof grecaptcha === 'undefined') {
                sendAjax();
                return false;
            }

            grecaptcha.ready(function () {
                grecaptcha.execute(siteKey, {action: 'callback'}).then(function (token) {
                    if (form) {
                        let tokenInput = form.querySelector('input[name="g-recaptcha-response"]');
                        if (!tokenInput) {
                            tokenInput = document.createElement('input');
                            tokenInput.type = 'hidden';
                            tokenInput.name = 'g-recaptcha-response';
                            form.appendChild(tokenInput);
                        }
                        tokenInput.value = token;

                        let actionInput = form.querySelector('input[name="recaptcha_action"]');
                        if (!actionInput) {
                            actionInput = document.createElement('input');
                            actionInput.type = 'hidden';
                            actionInput.name = 'recaptcha_action';
                            form.appendChild(actionInput);
                        }
                        actionInput.value = 'callback';
                    }
                    sendAjax();
                }).catch(function () {
                    sendAjax();
                });
            });

            return false;
        }
    </script>
    <div id="dialog-content" style="display:none;max-width:500px;">
        <form class="mailform" id="formx" action="javascript:void(null);" onsubmit="return call(event)"> 
            <label class="form-text">Оставить заявку</label>
            <div class="form-text-anons">Оставьте заявку и наш специалист свяжется<br> с Вами в ближайшее время:</div>
            <fieldset class="loginFieldset frmEmailWrapCall"> <i class="fa-solid fa-user" aria-hidden="true"></i>
                <input type="text" name="name" required="" placeholder="Ваше имя:" class="inputCall">
            </fieldset>
            <fieldset class="loginFieldset frmEmailWrapCall"> <i class="fa-solid fa-phone-volume"
                    aria-hidden="true"></i>
                <input type="text" name="phone" required="" placeholder="+7 (___) ___-__-__" class="inputCall art-stranger">
            </fieldset>
            <input type="hidden" name="g-recaptcha-response" value="">
            <input type="hidden" name="recaptcha_action" value="callback">
            <div class="formBtn">
                <button class="btn-form light" type="submit">Оставить заявку</button>
            </div>
        </form>
    </div>
    {{-- Popup end --}}
    <script type="text/javascript" language="javascript">
        function oneClick() {
        var msg   = $('#oneClick').serialize();
            $.ajax({
            type: 'POST',
            url: '/assets/mail/one__click.php',
            data: msg,
            success: function(data) {
                alert('Сообщение успешно отправлено!');
                $('input[name=product].vvod').val('');
                $('input[name=name].inputCall').val('');
                $('input[name=phone].inputCall').val('');
                Fancybox.close();
            },
            error:  function(xhr, str){
                alert('Возникла ошибка: ' + xhr.responseCode);
            }
            });
        }
    </script>
    {{-- Popup end --}}
    {{-- Whats App --}}
    <div id="whatsAppFixed">
        <a href="https://wa.me/+77776280575" target="_blank">
            <img src="{{asset('assets/images/design/whatsAppFixed.png')}}" alt="">
        </a>
    </div>
    {{-- Whats App end --}}
    {{-- Pagination --}}
    <script type="text/javascript">
        $(document).ready(function() {
            $('a[href^="#pagination"]').click(function () {
            var elementClick = $(this).attr("href");
            var destination = $(elementClick).offset().top;
            $('html,body').animate( { scrollTop: destination }, 1100 );
            return false;
            });
        });
    </script>    
    <script>
        $(document).on('click', '.page-link-scroll-to-top', function (e) {
            $("html, body").animate({ scrollTop: 300 }, "slow");
            return false;
        });
    </script>
    {{-- Pagination end --}}
    {{-- Mask --}}  
        <script>
            $('.art-stranger').mask('+7 (999) 999-99-99');

            $.fn.setCursorPosition = function(pos) {
            if ($(this).get(0).setSelectionRange) {
                $(this).get(0).setSelectionRange(pos, pos);
            } else if ($(this).get(0).createTextRange) {
                var range = $(this).get(0).createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
            };
            $('input[type="tel"]').click(function(){
                $(this).setCursorPosition(4);  // set position number
            });
        </script>
    {{-- Mask end --}}
    @stack('scripts')
</body>
</html>
