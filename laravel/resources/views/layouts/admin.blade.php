<!DOCTYPE html>
<html lang="ru" data-theme="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Etis — Админ-панель</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="shortcut icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" crossorigin="anonymous">
    <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.js"></script>
    <script src="{{asset('js/summernote-ru-RU.min.js')}}"></script>
    <script>(function(){var t=localStorage.getItem('etis-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light')})()</script>
    <style>
    :root,[data-theme="dark"]{--bg:#06111f;--panel:rgba(11,23,41,.96);--panel2:#0f2037;--border:rgba(130,156,196,.14);--text:#f4f8ff;--muted:#93a4c2;--blue:#3b82f6;--cyan:#38bdf8;--green:#22c55e;--red:#ef4444;--orange:#f59e0b;--input-bg:rgba(255,255,255,.045);--input-border:rgba(130,156,196,.15);--input-text:#fff;--sidebar-bg:rgba(6,17,31,.88);--topbar-bg:rgba(6,17,31,.80);--card-bg:linear-gradient(180deg,rgba(11,23,41,.96),rgba(8,18,33,.96));--card-sh:inset 0 1px 0 rgba(255,255,255,.035);--grid:rgba(255,255,255,.026);--sw:260px;--th:64px;--r:16px;--rs:10px}
    [data-theme="light"]{--bg:#f0f4f8;--panel:#fff;--panel2:#f7f9fc;--border:rgba(0,0,0,.08);--text:#0f1729;--muted:#5f6d85;--input-bg:#f4f7fb;--input-border:rgba(0,0,0,.10);--input-text:#0f1729;--sidebar-bg:rgba(255,255,255,.95);--topbar-bg:rgba(255,255,255,.90);--card-bg:linear-gradient(180deg,#fff,#fafcff);--card-sh:0 1px 3px rgba(0,0,0,.04);--grid:rgba(0,0,0,.03)}
    *,*::before,*::after{box-sizing:border-box}html,body{margin:0;min-height:100%}
    body{font-family:'Inter',system-ui,sans-serif;color:var(--text);line-height:1.5;background:radial-gradient(circle at 16% 12%,rgba(59,130,246,.14),transparent 32%),radial-gradient(circle at 92% 8%,rgba(56,189,248,.10),transparent 30%),var(--bg);background-attachment:fixed}
    [data-theme="light"] body{background:linear-gradient(135deg,#eef2f8,#f5f8fc 42%,#e9eef5)}
    body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.7),transparent 70%)}
    a{color:inherit;text-decoration:none}button{font-family:inherit}
    .E{min-height:100vh;padding-left:var(--sw);position:relative;z-index:1}
    .E-side{position:fixed;inset:0 auto 0 0;width:var(--sw);padding:16px 12px;background:var(--sidebar-bg);border-right:1px solid var(--border);backdrop-filter:blur(16px);z-index:30;display:flex;flex-direction:column;overflow-y:auto}
    .E-logo{display:flex;align-items:center;gap:10px;padding:0 8px 14px;border-bottom:1px solid var(--border);margin-bottom:14px}
    .E-logo-mark{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;flex-shrink:0;background:linear-gradient(135deg,#2563eb,#38bdf8);box-shadow:0 10px 24px rgba(37,99,235,.32)}
    .E-logo h1{margin:0;font-size:1.05rem;font-weight:800;letter-spacing:-.04em;line-height:1.05}.E-logo h1 b{color:var(--blue);font-weight:800}
    .E-logo small{display:block;margin-top:2px;font-size:.7rem;color:var(--muted)}
    .E-label{padding:0 10px;margin:12px 0 6px;color:var(--muted);text-transform:uppercase;font-size:.62rem;letter-spacing:.14em;font-weight:800;opacity:.7}
    .E-nav{display:grid;gap:3px}.E-nav a{min-height:42px;border-radius:13px;padding:0 10px;display:flex;align-items:center;gap:10px;color:var(--muted);border:1px solid transparent;transition:.2s;font-size:.84rem;font-weight:600}
    .E-nav a:hover{color:var(--text);background:rgba(255,255,255,.04);border-color:rgba(130,156,196,.08)}
    .E-nav a.act{background:linear-gradient(135deg,rgba(59,130,246,.20),rgba(56,189,248,.08));border-color:rgba(59,130,246,.26);color:var(--text);box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 10px 24px rgba(37,99,235,.08)}
    .E-ico{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;flex-shrink:0;background:rgba(255,255,255,.04);color:#8ab4ff;font-size:.78rem}
    .E-nav a.act .E-ico{background:linear-gradient(135deg,#2563eb,#38bdf8);color:#fff}
    [data-theme="light"] .E-nav a{color:#4a5568}[data-theme="light"] .E-nav a:hover{color:#0f1729;background:rgba(0,0,0,.03)}
    [data-theme="light"] .E-nav a.act{background:linear-gradient(135deg,rgba(59,130,246,.10),rgba(56,189,248,.05));border-color:rgba(59,130,246,.16);color:#1e40af}
    [data-theme="light"] .E-ico{background:rgba(0,0,0,.04);color:#4a6fa5}[data-theme="light"] .E-nav a.act .E-ico{background:linear-gradient(135deg,#2563eb,#38bdf8);color:#fff}
    .E-foot{margin-top:auto;border-radius:14px;padding:12px;border:1px solid rgba(59,130,246,.16);background:linear-gradient(180deg,rgba(59,130,246,.08),rgba(255,255,255,.02));color:var(--muted);font-size:.76rem;line-height:1.5}
    .E-foot strong{display:block;color:var(--text);margin-bottom:3px}[data-theme="light"] .E-foot{border-color:rgba(59,130,246,.10);background:linear-gradient(180deg,rgba(59,130,246,.05),#fff)}
    .E-top{height:var(--th);position:sticky;top:0;z-index:20;padding:0 22px;display:flex;align-items:center;justify-content:space-between;gap:14px;background:var(--topbar-bg);border-bottom:1px solid var(--border);backdrop-filter:blur(16px)}
    .E-top h2{margin:0;font-size:1.1rem;font-weight:800;letter-spacing:-.03em}.E-top-r{display:flex;align-items:center;gap:8px}
    .E-toggle{width:38px;height:38px;border-radius:11px;border:1px solid var(--border);background:var(--input-bg);color:var(--muted);cursor:pointer;display:grid;place-items:center;font-size:.95rem;transition:.2s;position:relative;overflow:hidden}
    .E-toggle:hover{border-color:rgba(59,130,246,.3);color:#fbbf24}
    .E-toggle .fa-sun,.E-toggle .fa-moon{position:absolute;transition:transform .4s cubic-bezier(.68,-.55,.27,1.55),opacity .3s}
    [data-theme="dark"] .E-toggle .fa-sun{transform:translateY(0);opacity:1}[data-theme="dark"] .E-toggle .fa-moon{transform:translateY(22px);opacity:0}
    [data-theme="light"] .E-toggle .fa-sun{transform:translateY(-22px);opacity:0}[data-theme="light"] .E-toggle .fa-moon{transform:translateY(0);opacity:1;color:#6366f1}
    .E-ava{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(135deg,#2563eb,#38bdf8);font-weight:800;color:#fff;font-size:.8rem}
    .E-out{width:36px;height:36px;border-radius:11px;border:1px solid rgba(239,68,68,.18);background:rgba(239,68,68,.07);color:#ffb4b4;cursor:pointer;display:grid;place-items:center;font-size:.78rem;transition:.2s}.E-out:hover{background:rgba(239,68,68,.15);color:#fff}[data-theme="light"] .E-out{color:#dc2626;background:rgba(239,68,68,.05)}
    .E-content{padding:22px}.E-footer{color:var(--muted);font-size:.74rem;padding:0 22px 22px}
    .container,.container-fluid{max-width:100%;padding:0}
    .card{background:var(--card-bg);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--card-sh);color:var(--text)}.card-body{padding:18px}
    .table{color:var(--text);margin-bottom:0;width:100%;border-collapse:collapse}
    .table th{color:var(--muted);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;padding:9px 12px;border-bottom:1px solid var(--border);border-top:none;background:transparent}
    .table td{padding:10px 12px;border-top:1px solid var(--border);vertical-align:middle}
    .table-bordered{border:none}.table-bordered th,.table-bordered td{border:none;border-bottom:1px solid var(--border)}
    .table tbody tr:hover{background:rgba(59,130,246,.03)}.table-responsive{overflow-x:auto}
    .btn{border-radius:var(--rs);font-weight:700;font-size:.82rem;padding:7px 14px;border:1px solid var(--border);background:var(--input-bg);color:var(--text);cursor:pointer;transition:.2s;display:inline-flex;align-items:center;gap:5px}.btn:hover{transform:translateY(-1px)}
    .btn-primary{background:linear-gradient(135deg,#2563eb,#38bdf8);border-color:rgba(59,130,246,.35);color:#fff;box-shadow:0 6px 20px rgba(37,99,235,.20)}.btn-primary:hover{color:#fff}
    .btn-success{background:linear-gradient(135deg,#16a34a,#34d399);border-color:rgba(34,197,94,.28);color:#fff}
    .btn-danger{background:rgba(239,68,68,.10);border-color:rgba(239,68,68,.22);color:#fca5a5}.btn-danger:hover{background:rgba(239,68,68,.18);color:#fff}
    .btn-info{background:rgba(59,130,246,.10);border-color:rgba(59,130,246,.22);color:#93c5fd}.btn-info:hover{background:rgba(59,130,246,.18);color:#fff}
    .btn-dark{background:rgba(255,255,255,.05);border-color:var(--border);color:var(--text)}
    .btn-sm{padding:4px 10px;font-size:.76rem;border-radius:8px}
    [data-theme="light"] .btn-danger{background:rgba(239,68,68,.05);color:#dc2626}[data-theme="light"] .btn-info{background:rgba(59,130,246,.05);color:#2563eb}
    .badge{padding:3px 9px;border-radius:7px;font-weight:700;font-size:.70rem}
    .badge-success{background:rgba(34,197,94,.14)!important;color:#4ade80}.badge-danger{background:rgba(239,68,68,.14)!important;color:#fca5a5}
    .badge-info{background:rgba(59,130,246,.14)!important;color:#93c5fd}.badge-secondary{background:rgba(130,156,196,.10)!important;color:var(--muted)}
    [data-theme="light"] .badge-success{color:#166534}[data-theme="light"] .badge-danger{color:#991b1b}
    .form-control{background:var(--input-bg);border:1px solid var(--input-border);color:var(--input-text);border-radius:var(--rs);padding:9px 12px;font-size:.86rem;transition:border .2s;width:100%}
    .form-control:focus{outline:none;border-color:rgba(59,130,246,.45);box-shadow:0 0 0 3px rgba(59,130,246,.10);background:var(--input-bg);color:var(--input-text)}
    .form-control::placeholder{color:var(--muted);opacity:.5}
    select.form-control{appearance:auto;background-color:var(--input-bg);color:var(--input-text)}
    select.form-control option{background:#0f2037;color:#f4f8ff}
    [data-theme="light"] select.form-control option{background:#fff;color:#0f1729}
    label,.admin__label{color:var(--text);font-weight:600;font-size:.86rem;margin-bottom:5px;display:block}.form-group{margin-bottom:14px}
    .alert{border-radius:var(--r);padding:12px 16px;font-weight:600;font-size:.86rem}
    .alert-success{border:1px solid rgba(34,197,94,.22);background:rgba(34,197,94,.08);color:#dcfce7}
    [data-theme="light"] .alert-success{background:rgba(34,197,94,.05);color:#166534}
    .text-danger{color:var(--red)!important;font-size:.8rem}.text-muted{color:var(--muted)!important}.text-gray-800{color:var(--text)!important}.text-dark{color:var(--text)!important}
    .font-weight-bold{font-weight:700!important}.h3{font-size:1.2rem!important;font-weight:800!important}.h5{font-size:.92rem!important}
    .mb-0{margin-bottom:0!important}.mb-3{margin-bottom:14px!important}.mb-4{margin-bottom:22px!important}.mt-4{margin-top:22px!important}
    .d-flex{display:flex!important}.d-sm-flex{display:flex!important}.align-items-center{align-items:center!important}.justify-content-between{justify-content:space-between!important}.justify-content-end{justify-content:flex-end!important}
    .row{display:flex;flex-wrap:wrap;margin:0 -7px}
    .col-md-2{flex:0 0 16.66%;max-width:16.66%;padding:0 7px}.col-md-3{flex:0 0 25%;max-width:25%;padding:0 7px}.col-md-4{flex:0 0 33.33%;max-width:33.33%;padding:0 7px}.col-md-5{flex:0 0 41.66%;max-width:41.66%;padding:0 7px}.col-md-6{flex:0 0 50%;max-width:50%;padding:0 7px}.col-md-8{flex:0 0 66.66%;max-width:66.66%;padding:0 7px}.col-md-12{flex:0 0 100%;max-width:100%;padding:0 7px}
    @media(max-width:768px){.col-md-2,.col-md-3,.col-md-4,.col-md-5,.col-md-6,.col-md-8{flex:0 0 100%;max-width:100%}}
    nav svg{height:20px}nav .hidden{display:block!important}
    .pagination{display:flex;gap:3px;list-style:none;padding:0;margin:14px 0 0;justify-content:center}
    .pagination .page-item .page-link{padding:5px 11px;border-radius:8px;background:var(--input-bg);border:1px solid var(--border);color:var(--text);font-size:.8rem;font-weight:600}.pagination .page-item.active .page-link{background:linear-gradient(135deg,#2563eb,#38bdf8);border-color:transparent;color:#fff}.pagination .page-item.disabled .page-link{opacity:.4;pointer-events:none}
    img{max-width:100%;height:auto}
    .loadingSpinner{position:fixed;inset:0;z-index:9999;background:rgba(6,17,31,.45);backdrop-filter:blur(3px);display:grid;place-items:center}[data-theme="light"] .loadingSpinner{background:rgba(255,255,255,.45)}
    .note-editor.note-frame{border:1px solid var(--input-border)!important;border-radius:12px!important;overflow:hidden;background:var(--input-bg)!important}
    .note-editor .note-toolbar{background:rgba(255,255,255,.03)!important;border-bottom:1px solid var(--border)!important;padding:6px 8px!important}
    .note-editor .note-toolbar .note-btn{background:rgba(255,255,255,.05)!important;border:1px solid var(--border)!important;color:var(--muted)!important;border-radius:7px!important;height:30px}
    .note-editor .note-toolbar .note-btn:hover{background:rgba(59,130,246,.12)!important;color:var(--text)!important}
    .note-editor .note-editing-area .note-editable{background:#fff!important;color:#111!important;padding:12px!important;min-height:110px;font-size:14px;line-height:1.7}
    .note-editor .note-editing-area .note-editable *{color:inherit!important}
    .note-editor .note-editing-area .note-codable{background:#1a1a2e!important;color:#93c5fd!important}
    .note-editor .note-statusbar{background:transparent!important;border-top:1px solid var(--border)!important}
    .note-placeholder{color:#999!important;padding:12px!important}
    .note-btn-group{display:inline-flex!important;gap:2px!important;margin:0!important}
    .note-dropdown-menu{background:var(--panel2)!important;border:1px solid var(--border)!important;border-radius:10px!important;padding:5px!important;box-shadow:0 10px 28px rgba(0,0,0,.35)!important}
    .note-dropdown-menu .note-dropdown-item{color:var(--text)!important;border-radius:6px;padding:5px 10px!important}
    .note-dropdown-menu .note-dropdown-item:hover{background:rgba(59,130,246,.12)!important}
    [x-ref="bar"]{background:linear-gradient(90deg,#3b82f6,#38bdf8)!important;height:3px!important}
    @media(max-width:860px){.E{padding-left:0}.E-side{position:static;width:auto;min-height:auto;border-right:none;border-bottom:1px solid var(--border)}.E-top{position:static;height:auto;padding:12px}.E-content{padding:12px}}
    </style>
    @livewireStyles
</head>
<body>
<div class="E">
    <aside class="E-side">
        <a href="{{ route('admin.dashboard') }}" class="E-logo">
            <div class="E-logo-mark"><svg viewBox="0 0 32 32" fill="none" width="22" height="22"><path d="M8 10h16M8 16h12M8 22h16" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg></div>
            <div><h1>Etis<b>.kz</b></h1><small>Панель управления</small></div>
        </a>
        <div class="E-label">Основное</div>
        <nav class="E-nav" id="enav">
            <a data-m="/admin" data-exact="1" href="{{ route('admin.dashboard') }}"><span class="E-ico"><i class="fas fa-th-large"></i></span>Дашборд</a>
            <a data-m="/admin/categories" href="{{ route('admin.categories') }}"><span class="E-ico"><i class="fas fa-sitemap"></i></span>Категории</a>
            <a data-m="/admin/product" href="{{ route('admin.products') }}"><span class="E-ico"><i class="fas fa-box-open"></i></span>Товары</a>
            <a data-m="/admin/brand" href="{{ route('admin.brands') }}"><span class="E-ico"><i class="fas fa-certificate"></i></span>Бренды</a>
            <a data-m="/admin/order" href="{{ route('admin.orders') }}"><span class="E-ico"><i class="fas fa-shopping-bag"></i></span>Заказы</a>
        </nav>
        <div class="E-label">Контент</div>
        <nav class="E-nav">
            <a data-m="/admin/article" href="{{ route('admin.articles') }}"><span class="E-ico"><i class="fas fa-newspaper"></i></span>Статьи</a>
            <a data-m="/admin/slide" href="{{ route('admin.slides') }}"><span class="E-ico"><i class="fas fa-images"></i></span>Слайды</a>
        </nav>
        <div class="E-foot"><strong>Etis.kz</strong>Управление каталогом и контентом.</div>
    </aside>
    <main style="min-height:100vh;position:relative">
        <header class="E-top">
            <h2>Админ-панель</h2>
            <div class="E-top-r">
                <button type="button" class="E-toggle" id="themeBtn" title="Тема"><i class="fas fa-sun"></i><i class="fas fa-moon"></i></button>
                <div class="E-ava">{{ mb_substr(Auth::user()->name ?? 'A', 0, 1) }}</div>
                <form method="POST" action="{{ route('logout') }}">@csrf<button class="E-out" type="submit" title="Выйти"><i class="fas fa-sign-out-alt"></i></button></form>
            </div>
        </header>
        <section class="E-content">{{ $slot }}</section>
        <footer class="E-footer">© {{ date('Y') }} Etis.kz</footer>
    </main>
</div>
@livewireScripts
@stack('script')
<script>
document.getElementById('themeBtn').onclick=function(){var h=document.documentElement,n=h.getAttribute('data-theme')==='dark'?'light':'dark';h.setAttribute('data-theme',n);localStorage.setItem('etis-theme',n)};
(function(){var p=location.pathname,ls=document.querySelectorAll('#enav a[data-m],.E-nav a[data-m]'),best=null,bLen=0;for(var i=0;i<ls.length;i++){var m=ls[i].getAttribute('data-m'),ex=ls[i].getAttribute('data-exact');ls[i].classList.remove('act');if(ex&&p==='/admin'){best=ls[i];bLen=999;continue}if(!ex&&p.indexOf(m)===0&&m.length>bLen){best=ls[i];bLen=m.length}}if(best)best.classList.add('act')})();
</script>
</body>
</html>
