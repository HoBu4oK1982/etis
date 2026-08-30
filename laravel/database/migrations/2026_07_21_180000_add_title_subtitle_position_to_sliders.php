<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Расширяем таблицу sliders до формата, ожидаемого API v1.
 *
 * Оригинальная миграция (2025_06_11_193241_create_sliders_table) создала только:
 *   id / image / link / status / timestamps
 *
 * HomeController::index() сортирует слайдер по position, а SliderResource
 * отдаёт фронту title, subtitle, position. Без этих трёх колонок GET /api/v1/home
 * падает с QueryException:
 *   SQLSTATE[42S22]: Column not found: 1054 Unknown column 'position' in 'ORDER BY'
 *
 * Из-за этого главная страница Next.js вываливалась в FALLBACK_HOME_DATA
 * (захардкоженные 6 категорий с иконками — вместо реальных из БД).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sliders', function (Blueprint $table) {
            // Добавляем недостающие колонки одним разом, каждую — только если её ещё нет
            // (на случай, если проект уже частично поправлен вручную).
            if (! Schema::hasColumn('sliders', 'title')) {
                $table->string('title')->nullable()->after('id');
            }
            if (! Schema::hasColumn('sliders', 'subtitle')) {
                $table->string('subtitle')->nullable()->after('title');
            }
            if (! Schema::hasColumn('sliders', 'position')) {
                $table->unsignedInteger('position')->default(0)->after('status');
                $table->index('position');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sliders', function (Blueprint $table) {
            if (Schema::hasColumn('sliders', 'position')) {
                $table->dropIndex(['position']);
                $table->dropColumn('position');
            }
            if (Schema::hasColumn('sliders', 'subtitle')) {
                $table->dropColumn('subtitle');
            }
            if (Schema::hasColumn('sliders', 'title')) {
                $table->dropColumn('title');
            }
        });
    }
};
