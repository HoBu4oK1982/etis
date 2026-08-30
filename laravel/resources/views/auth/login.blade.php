<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Вход в панель · etis.kz</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        /* ---------- ТЕМА (те же переменные, что в админке) ---------- */
        :root[data-theme="dark"] {
            --bg-1:        #0a1628;
            --bg-2:        #0f2037;
            --panel:       rgba(20, 38, 62, 0.72);
            --panel-solid: #14263e;
            --border:      rgba(255, 255, 255, 0.08);
            --text:        #e6ebf5;
            --text-muted:  #8a9bb8;
            --accent:      #3b82f6;
            --accent-2:    #8b5cf6;
            --accent-hover:#2563eb;
            --input-bg:    #0f2037;                   /* solid — иначе Chrome/Windows красит белым */
            --input-focus: #14263e;
            --input-border:rgba(255, 255, 255, 0.10);
            --danger:      #ef4444;
            --success:     #22c55e;
        }
        :root[data-theme="light"] {
            --bg-1:        #eef2f9;
            --bg-2:        #e0e7f4;
            --panel:       rgba(255, 255, 255, 0.86);
            --panel-solid: #ffffff;
            --border:      rgba(10, 22, 40, 0.08);
            --text:        #1a2540;
            --text-muted:  #64748b;
            --accent:      #2563eb;
            --accent-2:    #7c3aed;
            --accent-hover:#1d4ed8;
            --input-bg:    #ffffff;
            --input-focus: #ffffff;
            --input-border:rgba(10, 22, 40, 0.12);
            --danger:      #dc2626;
            --success:     #16a34a;
        }

        * { box-sizing: border-box; }
        html, body { height: 100%; }
        body {
            margin: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            transition: background 0.3s ease, color 0.3s ease;
        }

        /* ---------- Светящиеся сферы на фоне ---------- */
        .orb {
            position: fixed;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.45;
            pointer-events: none;
            z-index: 0;
        }
        .orb-1 { width: 420px; height: 420px; background: var(--accent);   top: -120px; left: -120px; animation: float1 22s ease-in-out infinite; }
        .orb-2 { width: 520px; height: 520px; background: var(--accent-2); bottom: -180px; right: -160px; animation: float2 26s ease-in-out infinite; }
        .orb-3 { width: 300px; height: 300px; background: #06b6d4; top: 40%; left: 55%; opacity: 0.25; animation: float3 30s ease-in-out infinite; }

        @keyframes float1 { 0%,100% { transform: translate(0,0);      } 50% { transform: translate(60px, 90px);   } }
        @keyframes float2 { 0%,100% { transform: translate(0,0);      } 50% { transform: translate(-90px, -60px); } }
        @keyframes float3 { 0%,100% { transform: translate(0,0);      } 50% { transform: translate(-50px, 40px);  } }

        :root[data-theme="light"] .orb { opacity: 0.28; }
        :root[data-theme="light"] .orb-3 { opacity: 0.15; }

        /* ---------- Тумблер темы (справа сверху) ---------- */
        .theme-toggle {
            position: fixed;
            top: 24px;
            right: 24px;
            width: 44px; height: 44px;
            border-radius: 50%;
            background: var(--panel);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text);
            z-index: 10;
            transition: transform 0.25s ease, background 0.3s ease;
        }
        .theme-toggle:hover { transform: rotate(20deg) scale(1.05); }

        /* ---------- Карточка входа ---------- */
        .card {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 440px;
            background: var(--panel);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 48px 40px 36px;
            box-shadow: 0 25px 70px rgba(0, 0, 0, 0.35);
            animation: cardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        :root[data-theme="light"] .card { box-shadow: 0 25px 70px rgba(10, 22, 40, 0.12); }

        @keyframes cardIn {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0);    }
        }

        /* ---------- Шапка ---------- */
        .brand { text-align: center; margin-bottom: 32px; }
        .brand-logo {
            width: 60px; height: 60px;
            background: linear-gradient(135deg, var(--accent), var(--accent-2));
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 800;
            font-size: 26px;
            letter-spacing: -1px;
            margin-bottom: 18px;
            box-shadow: 0 10px 28px rgba(59, 130, 246, 0.35);
        }
        .brand h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 6px;
            letter-spacing: -0.5px;
        }
        .brand p {
            font-size: 14px;
            color: var(--text-muted);
            margin: 0;
        }

        /* ---------- Форма ---------- */
        .field { margin-bottom: 18px; }
        .field label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.3px;
            text-transform: uppercase;
            margin-bottom: 8px;
            color: var(--text-muted);
        }
        .field-input { position: relative; }
        .field-input > svg.icon-left {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            width: 18px; height: 18px;
            color: var(--text-muted);
            pointer-events: none;
        }
        .field input {
            width: 100%;
            padding: 14px 14px 14px 44px;
            font-size: 15px;
            font-family: inherit;
            background: var(--input-bg);
            border: 1px solid var(--input-border);
            border-radius: 12px;
            color: var(--text);
            outline: none;
            transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field input::placeholder { color: var(--text-muted); opacity: 0.6; }
        .field input:focus {
            border-color: var(--accent);
            background: var(--input-focus);
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
        }
        .field input.has-error { border-color: var(--danger); }
        .field .pass-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            display: inline-flex;
            transition: color 0.2s, background 0.2s;
        }
        .field .pass-toggle:hover { color: var(--text); background: var(--border); }
        .field .error {
            color: var(--danger);
            font-size: 12.5px;
            margin-top: 6px;
        }

        /* ---------- Row: remember + forgot ---------- */
        .row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
            gap: 12px;
            flex-wrap: wrap;
        }
        .checkbox {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: var(--text-muted);
            cursor: pointer;
            user-select: none;
        }
        .checkbox input {
            width: 16px; height: 16px;
            accent-color: var(--accent);
            cursor: pointer;
        }
        .row a {
            font-size: 13px;
            color: var(--accent);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }
        .row a:hover { color: var(--accent-hover); text-decoration: underline; }

        /* ---------- Кнопка ---------- */
        .btn {
            width: 100%;
            padding: 14px 16px;
            font-size: 15px;
            font-weight: 600;
            font-family: inherit;
            background: linear-gradient(135deg, var(--accent), var(--accent-hover));
            color: #fff;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: transform 0.15s ease, box-shadow 0.25s ease, filter 0.15s;
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.28);
        }
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 12px 28px rgba(59, 130, 246, 0.38);
        }
        .btn:active { transform: translateY(0); }
        .btn:disabled { opacity: 0.7; cursor: wait; filter: saturate(0.8); }

        /* ---------- Alert (session status) ---------- */
        .alert {
            padding: 12px 14px;
            border-radius: 10px;
            font-size: 13px;
            margin-bottom: 20px;
            border: 1px solid;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        .alert-success {
            background: rgba(34, 197, 94, 0.10);
            border-color: rgba(34, 197, 94, 0.30);
            color: var(--success);
        }

        /* ---------- Подвал ---------- */
        .foot {
            text-align: center;
            margin-top: 28px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
            font-size: 12px;
            color: var(--text-muted);
        }
        .foot .dot { display: inline-block; width: 4px; height: 4px; border-radius: 50%; background: currentColor; margin: 0 8px; opacity: 0.5; vertical-align: middle; }

        /* ---------- Мобильная ---------- */
        @media (max-width: 480px) {
            .card { padding: 36px 24px 28px; border-radius: 16px; }
            .theme-toggle { top: 16px; right: 16px; }
        }
    </style>
</head>
<body>

<div class="orb orb-1"></div>
<div class="orb orb-2"></div>
<div class="orb orb-3"></div>

<button class="theme-toggle" onclick="toggleTheme()" aria-label="Переключить тему" title="Переключить тему">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="theme-icon"></svg>
</button>

<div class="card">
    <div class="brand">
        <div class="brand-logo">E</div>
        <h1>Панель управления</h1>
        <p>etis.kz · вход администратора</p>
    </div>

    @if (session('status'))
        <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>{{ session('status') }}</span>
        </div>
    @endif

    <form method="POST" action="{{ route('login') }}" id="loginForm" novalidate>
        @csrf

        <div class="field">
            <label for="email">Email</label>
            <div class="field-input">
                <svg class="icon-left" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input id="email"
                       type="email"
                       name="email"
                       value="{{ old('email') }}"
                       required
                       autofocus
                       autocomplete="username"
                       placeholder="admin@etis.kz"
                       class="{{ $errors->has('email') ? 'has-error' : '' }}">
            </div>
            @error('email')
                <div class="error">{{ $message }}</div>
            @enderror
        </div>

        <div class="field">
            <label for="password">Пароль</label>
            <div class="field-input">
                <svg class="icon-left" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input id="password"
                       type="password"
                       name="password"
                       required
                       autocomplete="current-password"
                       placeholder="••••••••"
                       class="{{ $errors->has('password') ? 'has-error' : '' }}">
                <button type="button" class="pass-toggle" onclick="togglePass()" aria-label="Показать пароль" title="Показать / скрыть">
                    <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
            </div>
            @error('password')
                <div class="error">{{ $message }}</div>
            @enderror
        </div>

        <div class="row">
            <label class="checkbox">
                <input type="checkbox" name="remember" value="1">
                <span>Запомнить меня</span>
            </label>
            @if (Route::has('password.request'))
                <a href="{{ route('password.request') }}">Забыли пароль?</a>
            @endif
        </div>

        <button type="submit" class="btn" id="loginBtn">
            <span>Войти в панель</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
    </form>

    <div class="foot">
        <span>© {{ date('Y') }} etis.kz</span>
        <span class="dot"></span>
        <span>Панель администратора</span>
    </div>
</div>

<script>
    // ---------- Тема (та же схема, что в админке: localStorage.etis-theme) ----------
    (function () {
        var saved = localStorage.getItem('etis-theme');
        if (saved !== 'light' && saved !== 'dark') {
            saved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        document.documentElement.setAttribute('data-theme', saved);
        renderThemeIcon(saved);
    })();

    function toggleTheme() {
        var cur = document.documentElement.getAttribute('data-theme') || 'dark';
        var next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('etis-theme', next);
        renderThemeIcon(next);
    }

    function renderThemeIcon(theme) {
        var el = document.getElementById('theme-icon');
        if (!el) return;
        if (theme === 'dark') {
            // солнце — переключит в свет
            el.innerHTML =
                '<circle cx="12" cy="12" r="5"></circle>' +
                '<line x1="12" y1="1" x2="12" y2="3"></line>' +
                '<line x1="12" y1="21" x2="12" y2="23"></line>' +
                '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>' +
                '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>' +
                '<line x1="1" y1="12" x2="3" y2="12"></line>' +
                '<line x1="21" y1="12" x2="23" y2="12"></line>' +
                '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>' +
                '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        } else {
            // луна — переключит в тьму
            el.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        }
    }

    // ---------- Показать/скрыть пароль ----------
    function togglePass() {
        var input = document.getElementById('password');
        var icon  = document.getElementById('eyeIcon');
        var show  = input.type === 'password';
        input.type = show ? 'text' : 'password';
        if (show) {
            icon.innerHTML =
                '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>' +
                '<line x1="1" y1="1" x2="23" y2="23"></line>';
        } else {
            icon.innerHTML =
                '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>' +
                '<circle cx="12" cy="12" r="3"></circle>';
        }
    }

    // ---------- Индикатор загрузки при отправке ----------
    document.getElementById('loginForm').addEventListener('submit', function () {
        var btn = document.getElementById('loginBtn');
        btn.disabled = true;
        btn.querySelector('span').textContent = 'Проверка…';
    });
</script>

</body>
</html>
