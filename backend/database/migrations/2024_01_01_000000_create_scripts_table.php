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
        Schema::create('scripts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['script', 'pixel', 'meta']);
            $table->enum('location', ['header', 'body', 'footer']);
            $table->text('content');
            $table->boolean('isActive')->default(true);
            $table->enum('environment', ['production', 'development', 'staging'])->default('production');
            $table->enum('trigger', ['all', 'specific_pages'])->default('all');
            $table->json('pages')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scripts');
    }
};
