<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Добавляет третье текстовое поле — eyebrow (плашка сверху) —
 * к таблице sliders. title/subtitle/position уже добавлены
 * миграцией 2026_07_20_180000_add_title_subtitle_position_to_sliders.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sliders', function (Blueprint $table) {
            if (! Schema::hasColumn('sliders', 'eyebrow')) {
                $table->string('eyebrow')->nullable()->after('id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sliders', function (Blueprint $table) {
            if (Schema::hasColumn('sliders', 'eyebrow')) {
                $table->dropColumn('eyebrow');
            }
        });
    }
};
