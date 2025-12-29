<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ads', function (Blueprint $column) {
            $column->id();
            $column->string('name'); // Admin name
            $column->string('placement')->index(); // slug: landing_top, sidebar_square, etc.
            $column->enum('type', ['script', 'image', 'html'])->default('script');
            $column->text('content')->nullable(); // Script code or Image URL
            $column->string('redirect_url')->nullable(); // For image ads
            $column->boolean('is_active')->default(true);
            $column->json('stats')->nullable(); // { impressions: 0, clicks: 0 }
            $column->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ads');
    }
};
