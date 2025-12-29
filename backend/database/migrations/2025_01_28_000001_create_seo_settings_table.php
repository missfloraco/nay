<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('seo_settings', function (Blueprint $table) {
            $table->id();
            $table->string('page_key', 50)->unique()->comment('Unique identifier for the page (e.g., landing, about)');

            // Basic SEO
            $table->string('title', 255)->nullable();
            $table->text('description')->nullable();
            $table->text('keywords')->nullable();

            // Open Graph (Facebook)
            $table->string('og_title', 255)->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image')->nullable();
            $table->string('og_type', 50)->default('website');

            // Twitter Card
            $table->string('twitter_card', 50)->default('summary_large_image');
            $table->string('twitter_title', 255)->nullable();
            $table->text('twitter_description')->nullable();
            $table->string('twitter_image')->nullable();

            // Technical SEO
            $table->string('canonical_url')->nullable();
            $table->string('robots', 100)->default('index,follow');

            // Structured Data
            $table->json('schema_markup')->nullable()->comment('JSON-LD structured data');

            // Status
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_settings');
    }
};
