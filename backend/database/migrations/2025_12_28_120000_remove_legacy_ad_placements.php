<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Ad;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Suppress errors if table doesn't exist or model fails
        try {
            Ad::whereIn('placement', ['ad_content_top', 'ad_content_bottom'])->delete();
        } catch (\Exception $e) {
            // Log or ignore
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Placements were removed from system logic, no need to restore data
    }
};
