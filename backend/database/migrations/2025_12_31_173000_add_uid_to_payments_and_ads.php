<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('uid')->nullable()->unique()->after('id');
        });

        Schema::table('ads', function (Blueprint $table) {
            $table->string('uid')->nullable()->unique()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('uid');
        });

        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn('uid');
        });
    }
};
