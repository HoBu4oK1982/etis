<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>Личный кабинет ETIS.KZ</title></head>
<body style="font-family:Arial,sans-serif;color:#0a1628;line-height:1.55">
  <h2>Здравствуйте, {{ $customerName }}!</h2>
  <p>Для вашего заказа создан личный кабинет ETIS.KZ.</p>
  <p><strong>Логин:</strong> {{ $email }}<br><strong>Временный пароль:</strong> {{ $temporaryPassword }}</p>
  <p>Войдите на <a href="https://etis.kz/login">etis.kz/login</a> и замените пароль в профиле.</p>
</body>
</html>
