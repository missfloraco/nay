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
        Schema::table('notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('notifications', 'uid')) {
                $table->string('uid')->nullable()->unique()->after('id');
            }
        });

        // Initialize UIDs for existing notifications
        \App\Models\Notification::withTrashed()->whereNull('uid')->get()->each(function ($n) {
            $n->uid = \App\Models\Notification::generateUid($n);
            $n->save();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('uid');
        });
    }
};
