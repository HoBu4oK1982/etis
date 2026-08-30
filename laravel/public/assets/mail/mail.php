<?php
    // ✅ Anti-spam: Google reCAPTCHA (v2/v3)
    function env_value($key, $default = null)
    {
        $envPath = dirname(__DIR__, 3) . '/.env';
        if (!is_readable($envPath)) return $default;

        $content = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($content as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) continue;
            if (!str_contains($line, '=')) continue;
            [$k, $v] = explode('=', $line, 2);
            $k = trim($k);
            if ($k !== $key) continue;
            $v = trim($v);
            if ($v !== '' && ($v[0] === '"' || $v[0] === "'")) {
                $v = trim($v, "\"'");
            }
            return $v;
        }

        return $default;
    }

    $token = $_POST['g-recaptcha-response'] ?? '';
    $actionExpected = $_POST['recaptcha_action'] ?? 'callback';
    $secret = env_value('NOCAPTCHA_SECRET') ?: env_value('RECAPTCHA_SECRET_KEY');

    if (!$token || !$secret) {
        http_response_code(422);
        echo 'recaptcha_required';
        exit;
    }

    $verifyPayload = http_build_query([
        'secret' => $secret,
        'response' => $token,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? null,
    ]);

    $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $verifyPayload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 6,
    ]);

    $raw = curl_exec($ch);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($raw === false || $curlErr) {
        http_response_code(422);
        echo 'recaptcha_unavailable';
        exit;
    }

    $data = json_decode($raw, true) ?: [];
    if (empty($data['success'])) {
        http_response_code(422);
        echo 'recaptcha_failed';
        exit;
    }

    // ✅ v3: если Google вернул score/action — проверяем мягко
    if (isset($data['score'])) {
        $action = $data['action'] ?? '';
        $score = (float) ($data['score'] ?? 0);
        if ($actionExpected && $action !== $actionExpected) {
            http_response_code(422);
            echo 'recaptcha_action_mismatch';
            exit;
        }
        if ($score < 0.3) {
            http_response_code(422);
            echo 'recaptcha_low_score';
            exit;
        }
    }

    $to = 'olegdata82@mail.ru, pandbox@mail.ru';
    $subject = 'Заявка с сайта https://etis.kz';
    $message = '
    <html>
        <head>
            <title>'.$subject.'</title>
            </head>
        <body>
            <p>Имя: '.$_POST['name'].'</p>
            <p>Номер телефона: '.$_POST['phone'].'</p>
        </body>
    </html>';
    $headers  = "Content-type:text/html;charset=\"utf-8\"\n";
    $headers .= "From:ETIS <no-reply@etis.kz>\r\n";
    mail($to, "=?UTF-8?B?".base64_encode($subject)."?=", $message, $headers);
?>
