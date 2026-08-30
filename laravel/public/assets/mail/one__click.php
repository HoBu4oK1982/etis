<?php
    $to = 'olegdata82@mail.ru';
    $subject = 'Заявка с сайта https://pandbox.kz';
    $message = '
    <html>
        <head>
            <title>'.$subject.'</title>
            </head>
        <body>
            <p>Имя: '.$_POST['name'].'</p>
            <p>Номер телефона: '.$_POST['phone'].'</p>
            <p>Отправлено с товара: '.$_POST['product'].'</p>
        </body>
    </html>';
    $headers  = "Content-type:text/html;charset=\"utf-8\"\n";
    $headers .= "From:Pand Box <no-repeat@newweb.kz>\r\n";
    mail($to, "=?UTF-8?B?".base64_encode($subject)."?=", $message, $headers);
?>
