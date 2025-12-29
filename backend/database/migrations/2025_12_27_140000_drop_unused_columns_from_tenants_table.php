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
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'logo_url',
                'domain',
                'tax_percentage',
                'tax_enabled',
                'onboarding_completed',
                'app_type'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('logo_url')->nullable();
            $table->string('domain')->unique()->nullable();
            $table->decimal('tax_percentage', 5, 2)->default(0);
            $table->boolean('tax_enabled')->default(false);
            $table->boolean('onboarding_completed')->default(false);
            $table->string('app_type')->nullable();
        });
    }
};
