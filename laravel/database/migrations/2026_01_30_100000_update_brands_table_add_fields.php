<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->string('title')->nullable()->after('id');
            $table->string('slug')->nullable()->unique()->after('title');
            $table->longText('description')->nullable()->after('slug');
            $table->string('image')->nullable()->after('description');
            $table->integer('position')->default(0)->after('image');
            $table->tinyInteger('status')->default(0)->after('position');
        });
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            // Drop unique index first
            $table->dropUnique(['slug']);
            $table->dropColumn([
                'title',
                'slug',
                'description',
                'image',
                'position',
                'status',
            ]);
        });
    }
};
