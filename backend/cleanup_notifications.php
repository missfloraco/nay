<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tenant;

echo "Starting cleanup...\n";

Tenant::all()->each(function ($tenant) {
    $duplicates = $tenant->notifications()
        ->where('data', 'like', '%ينتهي الاشتراك التجريبي قريباً%')
        ->get();

    if ($duplicates->count() > 1) {
        $toDelete = $duplicates->skip(1);
        echo "Deleting " . $toDelete->count() . " duplicates for tenant: " . $tenant->name . "\n";
        $toDelete->each->delete();
    }
});

echo "Cleanup finished.\n";
