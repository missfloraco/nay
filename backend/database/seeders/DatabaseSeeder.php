<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Models\Tenant;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin
        Admin::create([
            'name' => 'Super Admin',
            'email' => 'admin@nay.com',
            'password' => Hash::make('password'),
        ]);

        // Create Demo Tenant (Also works as a user now)
        Tenant::create([
            'uid' => 'TNT-' . str_pad(1, 6, '0', STR_PAD_LEFT),
            'name' => 'Demo',
            'email' => 'tenant@nay.com',
            'password' => Hash::make('password'),
            'domain' => 'demo', // Simplified local domain
            'status' => 'active',
            'onboarding_completed' => true,
        ]);

        // Run Settings & Ads Seeders
        $this->call([
            SettingsSeeder::class,
            AdSeeder::class
        ]);
    }
}
