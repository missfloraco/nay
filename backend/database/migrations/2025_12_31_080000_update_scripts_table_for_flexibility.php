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
        Schema::table('scripts', function (Blueprint $table) {
            // Change enums to strings for better flexibility with defaults
            $table->string('type')->default('script')->change();
            $table->string('location')->default('header')->change();
            $table->string('environment')->default('production')->change();
            $table->string('trigger')->default('all')->change();

            // Add missing fields from UI
            $table->string('loadingStrategy')->nullable()->after('location');
            $table->json('deviceAttributes')->nullable()->after('pages');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scripts', function (Blueprint $table) {
            $table->dropColumn(['loadingStrategy', 'deviceAttributes']);
        });
    }
};
