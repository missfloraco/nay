<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use Illuminate\Support\Facades\Hash;

class TestTenantsSeeder extends Seeder
{
    public function run()
    {
        $countries = ['PS', 'SA', 'AE', 'EG', 'JO', 'LB', 'SY', 'IQ', 'KW', 'QA'];
        $statuses = ['active', 'trial', 'expired'];

        for ($i = 1; $i <= 50; $i++) {
            Tenant::create([
                'name' => "مشترك تجريبي {$i}",
                'email' => "test{$i}@example.com",
                'password' => Hash::make('password'),
                'whatsapp' => '+970' . rand(500000000, 599999999),
                'country_code' => $countries[array_rand($countries)],
                'status' => $statuses[array_rand($statuses)],
                'trial_expires_at' => now()->addDays(rand(1, 30)),
                'ads_enabled' => rand(0, 1) == 1,
                'created_at' => now()->subDays(rand(1, 365)),
            ]);
        }
    }
}
