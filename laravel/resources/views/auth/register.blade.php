<x-guest-layout>
    <form id="register-form" method="POST" action="{{ route('register') }}">
        @csrf
        <h1 class="registerH1">Регистрация</h1>
        <!-- Имя -->
        <div>
            <x-input-label for="name" :value="__('Ваше имя')" />
            <x-text-input id="name" class="block mt-1 w-full" type="text" name="name" :value="old('name')" required autofocus autocomplete="name" />
            <x-input-error :messages="$errors->get('name')" class="mt-2" />
        </div>

        <!-- Email -->
        <div class="mt-4">
            <x-input-label for="email" :value="__('Ваш e-mail')" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <!-- Mobile -->
        <div class="mt-4">
            <x-input-label for="phone" :value="__('Ваш телефон')" />
            <x-text-input id="phone" class="block mt-1 w-full art-stranger" type="text" name="phone" :value="old('phone')" required autocomplete="phone" />
            <x-input-error :messages="$errors->get('phone')" class="mt-2" />
            <p class="registerTypes">Пример: +7 (___) ___-__-__</p>
        </div>

        <!-- City -->
        <div class="mt-4">
            <x-input-label for="city" :value="__('Ваш город')" />
            <select id="city" name="city" class="block mt-1 w-full" required>
                <option value="Алматы" {{ old('city') == 'Алматы' ? 'selected' : '' }}>Алматы</option>
                <option value="Астана" {{ old('city') == 'Астана' ? 'selected' : '' }}>Астана</option>
                <option value="Шымкент" {{ old('city') == 'Шымкент' ? 'selected' : '' }}>Шымкент</option>                
                <option value="Актобе" {{ old('city') == 'Актобе' ? 'selected' : '' }}>Актобе</option>
                <option value="Караганда" {{ old('city') == 'Кызылорда' ? 'selected' : '' }}>Караганда</option>
                <option value="Тараз" {{ old('city') == 'Тараз' ? 'selected' : '' }}>Тараз</option>
                <option value="Усть-Каменогорск" {{ old('city') == 'Усть-Каменогорск' ? 'selected' : '' }}>Усть-Каменогорск</option>
                <option value="Павлодар" {{ old('city') == 'Павлодар' ? 'selected' : '' }}>Павлодар</option>
                <option value="Атырау" {{ old('city') == 'Атырау' ? 'selected' : '' }}>Атырау</option>
                <option value="Семей" {{ old('city') == 'Семей' ? 'selected' : '' }}>Семей</option>
                <option value="Актау" {{ old('city') == 'Актау' ? 'selected' : '' }}>Актау</option>
                <option value="Кызылорда" {{ old('city') == 'Кызылорда' ? 'selected' : '' }}>Кызылорда</option>
                <option value="Костанай" {{ old('city') == 'Костанай' ? 'selected' : '' }}>Костанай</option>
                <option value="Уральск" {{ old('city') == 'Уральск' ? 'selected' : '' }}>Уральск</option>
                <option value="Туркестан" {{ old('city') == 'Туркестан' ? 'selected' : '' }}>Туркестан</option>
                <option value="Петропавловск" {{ old('city') == 'Петропавловск' ? 'selected' : '' }}>Петропавловск</option>
                <option value="Кокшетау" {{ old('city') == 'Кокшетау' ? 'selected' : '' }}>Кокшетау</option>
                <option value="Темиртау" {{ old('city') == 'Темиртау' ? 'selected' : '' }}>Темиртау</option>
                <option value="Талдыкорган" {{ old('city') == 'Талдыкорган' ? 'selected' : '' }}>Талдыкорган</option>
                <option value="Экибастуз" {{ old('city') == 'Экибастуз' ? 'selected' : '' }}>Экибастуз</option>
                <option value="Рудный" {{ old('city') == 'Рудный' ? 'selected' : '' }}>Рудный</option>
                <option value="Жезказган" {{ old('city') == 'Жезказган' ? 'selected' : '' }}>Жезказган</option>
                <option value="Каскелен" {{ old('city') == 'Каскелен' ? 'selected' : '' }}>Каскелен</option>
                <option value="Жанаозен" {{ old('city') == 'Жанаозен' ? 'selected' : '' }}>Жанаозен</option>
                <option value="Кентау" {{ old('city') == 'Кентау' ? 'selected' : '' }}>Кентау</option>
                <option value="Балхаш" {{ old('city') == 'Балхаш' ? 'selected' : '' }}>Балхаш</option>
                <option value="Сатпаев" {{ old('city') == 'Сатпаев' ? 'selected' : '' }}>Сатпаев</option>
                <option value="Талгар" {{ old('city') == 'Талгар' ? 'selected' : '' }}>Талгар</option>
                <option value="Кульсары" {{ old('city') == 'Кульсары' ? 'selected' : '' }}>Кульсары</option>
                <option value="Сарыагаш" {{ old('city') == 'Сарыагаш' ? 'selected' : '' }}>Сарыагаш</option>
                <option value="Косшы" {{ old('city') == 'Косшы' ? 'selected' : '' }}>Косшы</option>
                <option value="Конаев" {{ old('city') == 'Конаев' ? 'selected' : '' }}>Конаев</option>
                <option value="Арыс" {{ old('city') == 'Арыс' ? 'selected' : '' }}>Арыс</option>
                <option value="Жаркент" {{ old('city') == 'Жаркент' ? 'selected' : '' }}>Жаркент</option>
                <option value="Алатау" {{ old('city') == 'Алатау' ? 'selected' : '' }}>Алатау</option>
                <option value="Аксу" {{ old('city') == 'Аксу' ? 'selected' : '' }}>Аксу</option>
                <option value="Степногорск" {{ old('city') == 'Степногорск' ? 'selected' : '' }}>Степногорск</option>
                <option value="Щучинск" {{ old('city') == 'Щучинск' ? 'selected' : '' }}>Щучинск</option>
                <option value="Шу" {{ old('city') == 'Шу' ? 'selected' : '' }}>Шу</option>
                <option value="Риддер" {{ old('city') == 'Риддер' ? 'selected' : '' }}>Риддер</option>
                <option value="Жетысай" {{ old('city') == 'Жетысай' ? 'selected' : '' }}>Жетысай</option>
                <option value="Аягоз" {{ old('city') == 'Аягоз' ? 'selected' : '' }}>Аягоз</option>
                <option value="Есик" {{ old('city') == 'Есик' ? 'selected' : '' }}>Есик</option>
                <option value="Шахтинск" {{ old('city') == 'Шахтинск' ? 'selected' : '' }}>Шахтинск</option>
                <option value="Аральск" {{ old('city') == 'Аральск' ? 'selected' : '' }}>Аральск</option>
                <option value="Аксай" {{ old('city') == 'Аксай' ? 'selected' : '' }}>Аксай</option>
                <option value="Алтай" {{ old('city') == 'Алтай' ? 'selected' : '' }}>Алтай</option>
                <option value="Кандыагаш" {{ old('city') == 'Кандыагаш' ? 'selected' : '' }}>Кандыагаш</option>
                <option value="Житикара" {{ old('city') == 'Житикара' ? 'selected' : '' }}>Житикара</option>
                <option value="Сарань" {{ old('city') == 'Сарань' ? 'selected' : '' }}>Сарань</option>
                <option value="Ленгер" {{ old('city') == 'Ленгер' ? 'selected' : '' }}>Ленгер</option>
                <option value="Байконур (Байконыр)" {{ old('city') == 'Байконур (Байконыр)' ? 'selected' : '' }}>Байконур (Байконыр)</option>
                <option value="Шардара" {{ old('city') == 'Шардара' ? 'selected' : '' }}>Шардара</option>
                <option value="Лисаковск" {{ old('city') == 'Лисаковск' ? 'selected' : '' }}>Лисаковск</option>
                <option value="Атбасар" {{ old('city') == 'Атбасар' ? 'selected' : '' }}>Атбасар</option>
                <option value="Хромтау" {{ old('city') == 'Хромтау' ? 'selected' : '' }}>Хромтау</option>
                <option value="Текели" {{ old('city') == 'Текели' ? 'selected' : '' }}>Текели</option>
                <option value="Абай" {{ old('city') == 'Абай' ? 'selected' : '' }}>Абай</option>
                <option value="Тобыл" {{ old('city') == 'Тобыл' ? 'selected' : '' }}>Тобыл</option>
                <option value="Каратау" {{ old('city') == 'Каратау' ? 'selected' : '' }}>Каратау</option>
                <option value="Аркалык" {{ old('city') == 'Аркалык' ? 'selected' : '' }}>Аркалык</option>
                <option value="Шалкар" {{ old('city') == 'Шалкар' ? 'selected' : '' }}>Шалкар</option>
                <option value="Жанатас" {{ old('city') == 'Жанатас' ? 'selected' : '' }}>Жанатас</option>
                <option value="Алга" {{ old('city') == 'Алга' ? 'selected' : '' }}>Алга</option>
                <option value="Ушарал" {{ old('city') == 'Ушарал' ? 'selected' : '' }}>Ушарал</option>
                <option value="Уштобе" {{ old('city') == 'Уштобе' ? 'selected' : '' }}>Уштобе</option>
                <option value="Зайсан" {{ old('city') == 'Зайсан' ? 'selected' : '' }}>Зайсан</option>
                <option value="Шемонаиха" {{ old('city') == 'Шемонаиха' ? 'selected' : '' }}>Шемонаиха</option>
                <option value="Макинск" {{ old('city') == 'Макинск' ? 'selected' : '' }}>Макинск</option>
                <option value="Сарканд" {{ old('city') == 'Сарканд' ? 'selected' : '' }}>Сарканд</option>
                <option value="Акколь" {{ old('city') == 'Акколь' ? 'selected' : '' }}>Акколь</option>
                <option value="Тайынша" {{ old('city') == 'Тайынша' ? 'selected' : '' }}>Тайынша</option>
                <option value="Эмба" {{ old('city') == 'Эмба' ? 'selected' : '' }}>Эмба</option>
                <option value="Ерейментау" {{ old('city') == 'Ерейментау' ? 'selected' : '' }}>Ерейментау</option>
                <option value="Есиль" {{ old('city') == 'Есиль' ? 'selected' : '' }}>Есиль</option>
                <option value="Приозёрск" {{ old('city') == 'Приозёрск' ? 'selected' : '' }}>Приозёрск</option>
                <option value="Курчатов" {{ old('city') == 'Курчатов' ? 'selected' : '' }}>Курчатов</option>
                <option value="Каркаралинск" {{ old('city') == 'Каркаралинск' ? 'selected' : '' }}>Каркаралинск</option>
                <option value="Форт-Шевченко" {{ old('city') == 'Форт-Шевченко' ? 'selected' : '' }}>Форт-Шевченко</option>
                <option value="Булаево" {{ old('city') == 'Булаево' ? 'selected' : '' }}>Булаево</option>
                <option value="Каражал" {{ old('city') == 'Каражал' ? 'selected' : '' }}>Каражал</option>
                <option value="Сергеевка" {{ old('city') == 'Сергеевка' ? 'selected' : '' }}>Сергеевка</option>
                <option value="Казалинск" {{ old('city') == 'Казалинск' ? 'selected' : '' }}>Казалинск</option>
                <option value="Серебрянск" {{ old('city') == 'Серебрянск' ? 'selected' : '' }}>Серебрянск</option>
                <option value="Мамлютка" {{ old('city') == 'Мамлютка' ? 'selected' : '' }}>Мамлютка</option>
                <option value="Державинск" {{ old('city') == 'Державинск' ? 'selected' : '' }}>Державинск</option>
                <option value="Шар" {{ old('city') == 'Шар' ? 'selected' : '' }}>Шар</option>
                <option value="Степняк" {{ old('city') == 'Степняк' ? 'selected' : '' }}>Степняк</option>
                <option value="Темир" {{ old('city') == 'Темир' ? 'selected' : '' }}>Темир</option>
                <option value="Жем (Эмба-5)" {{ old('city') == 'Жем (Эмба-5)' ? 'selected' : '' }}>Жем (Эмба-5)</option>
            </select>
            <x-input-error :messages="$errors->get('city')" class="mt-2" />
        </div>
        

        <!-- Пароль -->
        <div class="mt-4">
            <x-input-label for="password" :value="__('Придумайте пароль')" />
            <x-text-input id="password" class="block mt-1 w-full"
                          type="password"
                          name="password"
                          required autocomplete="new-password" />
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <!-- Повтор пароля -->
        <div class="mt-4">
            <x-input-label for="password_confirmation" :value="__('Повторите пароль')" />
            <x-text-input id="password_confirmation" class="block mt-1 w-full"
                          type="password"
                          name="password_confirmation" required autocomplete="new-password" />
            <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
        </div>

        <!-- Скрытое поле для токена -->
        <input type="hidden" name="g-recaptcha-response" id="g-recaptcha-response">
        <x-input-error :messages="$errors->get('g-recaptcha-response')" class="mt-2" />

        <div class="flex items-center justify-end mt-4">
            <a class="registerEnter" href="{{ route('login') }}">
                {{ __('Вход') }}
            </a>
            <x-primary-button class="ms-4">
                {{ __('Регистрация') }}
            </x-primary-button>
        </div>
    </form>

    {{-- Google reCAPTCHA v3 --}}
    @php $recaptcha_sitekey = config('services.nocaptcha.sitekey'); @endphp

    <script src="https://www.google.com/recaptcha/api.js?render={{ $recaptcha_sitekey }}"></script>
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            const form = document.getElementById('register-form');
            const input = document.getElementById('g-recaptcha-response');
            if (!form || !input) return;

            function setTokenAndSubmit() {
                if (typeof grecaptcha === "undefined") {
                    console.error("grecaptcha is not defined");
                    form.submit();
                    return;
                }

                grecaptcha.ready(function () {
                    grecaptcha.execute('{{ $recaptcha_sitekey }}', {action: 'register'}).then(function (token) {
                        input.value = token;
                        form.submit();
                    }).catch(function () {
                        form.submit();
                    });
                });
            }

            // ✅ гарантируем токен перед отправкой формы (если юзер кликает быстро)
            form.addEventListener('submit', function (e) {
                if (input.value && input.value.length > 10) return;
                e.preventDefault();
                setTokenAndSubmit();
            });

            // ✅ предварительно подставим токен после загрузки
            if (typeof grecaptcha !== "undefined") {
                grecaptcha.ready(function () {
                    grecaptcha.execute('{{ $recaptcha_sitekey }}', {action: 'register'}).then(function (token) {
                        input.value = token;
                    });
                });
            }
        });
    </script>
</x-guest-layout>
