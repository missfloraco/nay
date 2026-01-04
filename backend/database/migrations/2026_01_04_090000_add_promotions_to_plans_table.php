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
        Schema::table('plans', function (Blueprint $table) {
            $table->decimal('offer_monthly_price', 10, 2)->after('yearly_price')->nullable();
            $table->decimal('offer_yearly_price', 10, 2)->after('offer_monthly_price')->nullable();
            $table->dateTime('offer_start')->after('offer_yearly_price')->nullable();
            $table->dateTime('offer_end')->after('offer_start')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['offer_monthly_price', 'offer_yearly_price', 'offer_start', 'offer_end']);
        });
    }
};
