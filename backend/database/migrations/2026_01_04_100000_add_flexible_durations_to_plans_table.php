<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->string('billing_type')->default('recurring')->after('slug'); // recurring, lifetime, fixed_term

            // Lifetime
            $table->decimal('lifetime_price', 10, 2)->nullable()->after('yearly_price');
            $table->decimal('offer_lifetime_price', 10, 2)->nullable()->after('lifetime_price');

            // Fixed Term
            $table->decimal('fixed_term_price', 10, 2)->nullable()->after('offer_lifetime_price');
            $table->decimal('offer_fixed_term_price', 10, 2)->nullable()->after('fixed_term_price');
            $table->integer('fixed_term_duration')->nullable()->after('offer_fixed_term_price');
            $table->string('fixed_term_unit')->nullable()->after('fixed_term_duration'); // months, years
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn([
                'billing_type',
                'lifetime_price',
                'offer_lifetime_price',
                'fixed_term_price',
                'offer_fixed_term_price',
                'fixed_term_duration',
                'fixed_term_unit'
            ]);
        });
    }
};
