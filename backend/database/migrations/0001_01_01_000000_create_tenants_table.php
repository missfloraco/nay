<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('uid')->unique();
            $table->string('name');
            $table->string('owner_name')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('whatsapp')->nullable();
            $table->string('domain')->unique();
            $table->string('logo_url')->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('country_code', 2)->default('PS');
            $table->string('currency_code', 3)->default('ILS');
            $table->boolean('tax_enabled')->default(false);
            $table->decimal('tax_percentage', 5, 2)->default(0);
            $table->enum('status', ['pending', 'trial', 'active', 'expired', 'disabled'])->default('pending');
            $table->timestamp('trial_expires_at')->nullable();
            $table->boolean('onboarding_completed')->default(false);
            $table->string('app_type')->default('pos');
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
