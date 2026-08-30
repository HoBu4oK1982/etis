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
    <meta property="og:url" content= "https://etis.kz" />
    @livewireStyles
    {{-- Styles --}}
    <link rel="stylesheet" type="text/css" href="{{asset('assets/css/flexslider.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('assets/css/style.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('assets/css/mobile.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('assets/css/slick.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('assets/css/slick-theme.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('assets/css/magnific-popup.css')}}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.2.5/jquery.fancybox.min.css" />
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" id="theme-styles">
    <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.css" rel="stylesheet">  
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.6.1/nouislider.min.css" integrity="sha512-qveKnGrvOChbSzAdtSs8p69eoLegyh+1hwOMbmpCViIwj7rn4oJjdmMvWOuyQlTOZgTlZA0N2PXA7iA8/2TUYA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    {{-- @livewireStyles (duplicate removed to prevent Livewire 3 snapshot issues) --}}
</head>
<body>
    <main>
        @livewire('header-component')
        {{$slot}}
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
        crossorigin="anonymous" referrerpolicy="no-referrer">
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/ScrollTrigger.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.6.1/nouislider.min.js" 
        integrity="sha512-1mDhG//LAjM3pLXCJyaA+4c+h5qmMoTc7IuJyuNNPaakrWT9rVTxICK4tIizf7YwJsXgDC2JP74PGCc7qxLAHw==" 
        crossorigin="anonymous" 
        referrerpolicy="no-referrer">
    </script>
    
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>
    <script type="text/javascript" src="{{asset('assets/js/mask.js')}}"></script>
    <script type="text/javascript" src="{{asset('assets/js/jquery.flexslider.js')}}"></script>
    <script type="text/javascript" src="{{asset('assets/js/jquery.magnific-popup.js')}}"></script>
    <script type="text/javascript" src="{{asset('assets/js/main.js')}}"></script>
    <script type="text/javascript" src="{{asset('assets/js/slick.js')}}"></script>
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
        //Resolution
        let mm = gsap.matchMedia();

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
            });
        });

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
            const siteKey = @json($recaptcha_sitekey);

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

            // ✅ reCAPTCHA v3 (если ключ не задан — просто отправляем)
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
    <div id="mobile_bar">
        <div class="mobile_bar_wrapper">
            <div class="mobile_bar_item" style="width: 50%;">
                <a target="_parent" href="https://wa.me/77776280575">
                    <span class="mobile_bar_icons_inner">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" id="whatsapp-icon" width="100%" height="28px"><title>Forma 1</title><path d="M28 13.639c0 7.533-6.154 13.64-13.745 13.64-2.41 0-4.675-.616-6.645-1.697L0 28l2.481-7.318a13.502 13.502 0 0 1-1.972-7.043C.509 6.106 6.663 0 14.255 0 21.847 0 28 6.106 28 13.639zM14.255 2.172c-6.373 0-11.557 5.144-11.557 11.467 0 2.51.818 4.833 2.201 6.724l-1.444 4.258 4.442-1.411a11.546 11.546 0 0 0 6.358 1.896c6.372 0 11.556-5.143 11.556-11.466 0-6.323-5.184-11.468-11.556-11.468zm6.941 14.609c-.085-.14-.31-.223-.646-.391-.338-.167-1.995-.976-2.303-1.087-.309-.111-.534-.167-.758.167-.224.335-.87 1.088-1.067 1.311-.197.223-.393.251-.73.084-.337-.167-1.423-.521-2.71-1.659-1.001-.886-1.678-1.98-1.874-2.316-.196-.334-.021-.515.148-.681.152-.15.337-.391.505-.586.169-.195.225-.334.337-.557.113-.224.056-.419-.028-.586-.084-.167-.759-1.812-1.039-2.482-.281-.669-.561-.557-.758-.557-.196 0-.421-.029-.646-.029-.225 0-.59.084-.899.419-.308.334-1.179 1.143-1.179 2.788 0 1.645 1.207 3.235 1.376 3.458.168.222 2.33 3.708 5.756 5.047 3.426 1.338 3.426.892 4.043.836.618-.056 1.993-.809 2.275-1.589.281-.782.281-1.451.197-1.59z"></path></svg>
                    </span>WhatsApp
                </a>
            </div>
            <div class="mobile_bar_item" style="width: 50%;">
                <a target="_parent" href="tel:+77776280575">
                    <span class="mobile_bar_icons_inner">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 27" id="phone-icon" width="100%" height="100%"><title>Shape 1</title><path d="M22.35 16.726c-.554-.576-1.222-.884-1.929-.884-.702 0-1.376.302-1.952.878l-1.803 1.795c-.149-.08-.297-.154-.44-.228-.205-.103-.399-.2-.565-.302-1.689-1.071-3.224-2.468-4.697-4.274-.713-.9-1.192-1.658-1.541-2.428.468-.427.902-.871 1.324-1.299.16-.159.32-.325.48-.484 1.198-1.197 1.198-2.747 0-3.944L9.669 4.001c-.177-.177-.36-.359-.531-.542A26.208 26.208 0 0 0 8.065 2.4c-.553-.548-1.215-.838-1.912-.838-.696 0-1.369.29-1.94.838l-.011.011-1.941 1.954a4.17 4.17 0 0 0-1.238 2.65c-.137 1.664.354 3.214.73 4.229.925 2.49 2.306 4.798 4.366 7.271 2.5 2.98 5.507 5.334 8.943 6.992 1.313.621 3.065 1.356 5.022 1.482.12.005.245.011.36.011 1.318 0 2.425-.473 3.292-1.413.006-.012.018-.017.023-.029.297-.359.639-.684.999-1.031.245-.234.496-.479.742-.735.565-.587.862-1.271.862-1.972 0-.707-.303-1.385-.879-1.955zm2.043 6c-.006 0-.006.006 0 0-.223.239-.451.456-.697.695-.37.354-.747.724-1.101 1.14-.576.615-1.255.906-2.146.906-.085 0-.177 0-.262-.006-1.695-.108-3.27-.769-4.452-1.333-3.23-1.561-6.066-3.778-8.423-6.588-1.946-2.342-3.247-4.507-4.109-6.832-.531-1.419-.725-2.525-.639-3.567.057-.667.314-1.22.787-1.693l1.946-1.943c.28-.262.577-.405.868-.405.359 0 .65.217.833.399l.017.017c.348.325.679.661 1.027 1.02.177.183.36.365.543.553l1.558 1.556c.604.604.604 1.162 0 1.766-.166.166-.326.331-.491.49-.48.491-.936.947-1.433 1.391-.011.011-.023.017-.028 .028-.491.491-.4.969-.297 1.294l.017.051c.405.98.976 1.904 1.843 3.003l.006.006c1.575 1.938 3.236 3.448 5.068 4.604.234 .149.474 .268.702 .382.205 .103.399 .2.565 .302.023 .012.046 .029.068 .04.194 .097.377 .143.565 .143.474 0 .771 -.297.868 -.394l1.952 -1.948c.194 -.194.502 -.428.861 -.428.354 0 .645 .222.822 .416l.012 .012 3.144 3.139c.588 .582.588 1.18.006 1.784zm-8.8 -16.303a7.231 7.231 0 0 1 3.937 2.04 7.256 7.256 0 0 1 2.044 3.932.765.765 0 0 0 .759 .638c.045 0 .085 -.006 .131 -.011a.77 .77 0 0 0 .633 -.889 8.783 8.783 0 0 0 -2.471 -4.759 8.807 8.807 0 0 0 -4.765 -2.467.774.774 0 0 0 -.89 .627.76.76 0 0 0 .622 .889zm12.395 5.487a14.455 14.455 0 0 0 -4.069 -7.835A14.487 14.487 0 0 0 16.072 .012a.768.768 0 0 0 -.885 .627.774.774 0 0 0 .634 .889 12.97 12.97 0 0 1 7.014 3.63 12.904 12.904 0 0 1 3.635 7.003.765.765 0 0 0 .89 .627.756.756 0 0 0 .628 -.878z"></path></svg>
                    </span>Позвонить
                </a>
            </div>
        </div>
    </div>
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
    <script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js"></script>
    <script>
		window.addEventListener('cart-updated', event => {
			Swal.fire({
				position: 'center-center',
				icon: 'success',
				title: '<h3 class="sweetTitle">' + event.detail.prodName + ' добавлен в корзину!</h3>',
				showConfirmButton: false,
				timer: 2000,
				customClass: 'swal-wide'
			})
		})
	</script>
    <script>
		window.addEventListener('wish-added', event => {
			Swal.fire({
				position: 'center-center',
				icon: 'success',
				title: '<h3 class="sweetTitle">' + event.detail.prodName + ' добавлен в избранное!</h3>',
				showConfirmButton: false,
				timer: 1000,
				customClass: 'swal-wide'
			})
		})
	</script>
    <script>
		window.addEventListener('wish-deleted', event => {
			Swal.fire({
				position: 'center-center',
				icon: 'error',
				title: '<h3 class="sweetTitle">' + event.detail.prodName + ' удален из избранного!</h3>',
				showConfirmButton: false,
				timer: 1000,
				customClass: 'swal-wide'
			})
		})
	</script>
    <script>
		window.addEventListener('cart-error', event => {
			Swal.fire({
				position: 'center-center',
				icon: 'error',
				title: '<h3 class="sweetTitle">На складе всего ' + event.detail.prodQty + ' шт.',
				showConfirmButton: false,
				timer: 2000,
				customClass: 'swal-wide'
			})
		})
	</script>
    <script>
        $('.product__carousel').slick({
            dots: true,
            infinite: true,
            speed: 300,
            slidesToShow: 4,
            arrows: false,
            autoplay: true,
            autoplaySpeed: 2000,
            responsive: [
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 3,
                  infinite: true,
                  dots: false,
                }
              },
              {
                breakpoint: 600,
                settings: {
                  slidesToShow: 2,
                }
              },
              {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    arrows: false,
                    centerMode: true,
                    centerPadding: '10px',
                    dots: true,
                    autoplay: false,
                }
              }
            ]
          });
    </script>
    @stack('scripts')
</body>
</html>