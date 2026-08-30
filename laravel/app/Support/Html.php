<?php

namespace App\Support;

/**
 * Чистка HTML, приехавшего из админки.
 *
 * Контент в базе часто сохранён редактором целиком, вместе с обёрткой
 * <html><body>…</body></html>. В Livewire это не бросалось в глаза
 * (blade выводил через {!! !!}), а Next.js печатает короткое описание
 * как обычный текст — и теги вылезают прямо в карточку товара.
 */
final class Html
{
    /**
     * HTML → плоский текст.
     * <br> и </p> превращаются в пробел, остальные теги вырезаются,
     * html-сущности раскодируются, пробелы схлопываются.
     */
    public static function toText(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        $text = preg_replace('~<\s*br\s*/?\s*>~i', ' ', $html);
        $text = preg_replace('~</\s*(p|div|li|tr|h[1-6])\s*>~i', ' ', $text);
        $text = strip_tags((string) $text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // Неразрывные пробелы из Word/Summernote тоже схлопываем
        $text = str_replace("\xC2\xA0", ' ', $text);
        $text = preg_replace('~\s+~u', ' ', $text);

        $text = trim((string) $text);

        return $text === '' ? null : $text;
    }

    /**
     * Оставляем разметку, но убираем документную обёртку и опасные теги.
     * Используется там, где HTML выводится как есть (описание товара,
     * SEO-текст категории).
     */
    public static function clean(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        // Скрипты и стили вырезаем вместе с содержимым
        $clean = preg_replace('~<\s*(script|style)[^>]*>.*?<\s*/\s*\1\s*>~is', '', $html);

        // Документная обёртка и служебные теги — только сами теги,
        // внутренний контент сохраняем
        $clean = preg_replace(
            '~</?\s*(html|head|body|meta|link|title|!DOCTYPE)[^>]*>~i',
            '',
            (string) $clean
        );

        $clean = trim((string) $clean);

        return $clean === '' ? null : $clean;
    }
}
