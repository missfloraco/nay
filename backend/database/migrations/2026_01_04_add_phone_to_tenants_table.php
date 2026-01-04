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
        Schema::table('tenants', function (Blueprint $row) {
            if (!Schema::hasColumn('tenants', 'phone')) {
                $row->string('phone')->nullable()->unique()->after('email');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $row) {
            if (Schema::hasColumn('tenants', 'phone')) {
                $row->dropColumn('phone');
            }
        });
    }
};
