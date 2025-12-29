<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $row) {
            $row->id();
            $row->string('key')->unique();
            $row->text('value')->nullable();
            $row->string('group')->default('general');
            $row->timestamps();
        });

        // Insert some default settings
        DB::table('settings')->insert([
            ['key' => 'app_name', 'value' => 'NaySaaS', 'group' => 'branding', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'primary_color', 'value' => '#2a8cff', 'group' => 'branding', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'secondary_color', 'value' => '#ffc108', 'group' => 'branding', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'logo_url', 'value' => null, 'group' => 'branding', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'favicon_url', 'value' => null, 'group' => 'branding', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
