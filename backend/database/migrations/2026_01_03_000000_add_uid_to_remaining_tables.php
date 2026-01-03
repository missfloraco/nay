<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = ['plans', 'subscriptions', 'subscription_requests', 'scripts']; // scripts might be singular or plural, looked like plural in migration file

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'uid')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->string('uid', 20)->nullable()->after('id')->index();
                });

                // Populate existing records with random UIDs explicitly to avoid unique violations on potential future unique constraints
                // We use DB facade for raw speed and simplicity
                $records = \Illuminate\Support\Facades\DB::table($table)->whereNull('uid')->get();
                foreach ($records as $record) {
                    // Determine prefix
                    $prefix = 'GEN';
                    if ($table === 'plans')
                        $prefix = 'PLN';
                    if ($table === 'subscriptions')
                        $prefix = 'SUB';
                    if ($table === 'subscription_requests')
                        $prefix = 'SRQ';
                    if ($table === 'scripts')
                        $prefix = 'SCR';

                    $random = str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT);
                    \Illuminate\Support\Facades\DB::table($table)
                        ->where('id', $record->id)
                        ->update(['uid' => $prefix . '-' . $random]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['plans', 'subscriptions', 'subscription_requests', 'scripts'];
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'uid')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('uid');
                });
            }
        }
    }
};
