<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Добавляет к таблице categories два коротких текстовых поля:
 *   - subtitle          — подзаголовок (одна строка)
 *   - short_description — минитекст / короткое описание (несколько строк)
 *
 * description (существующее поле) остаётся под длинный HTML-контент
 * страницы категории. Новые поля нужны для карточек-плиток
 * (Hero-стрип, обзор родителя, meta-фрагменты).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            if (! Schema::hasColumn('categories', 'subtitle')) {
                $table->string('subtitle')->nullable()->after('title');
            }
            if (! Schema::hasColumn('categories', 'short_description')) {
                $table->string('short_description', 500)->nullable()->after('subtitle');
            }
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'short_description')) {
                $table->dropColumn('short_description');
            }
            if (Schema::hasColumn('categories', 'subtitle')) {
                $table->dropColumn('subtitle');
            }
        });
    }
};
