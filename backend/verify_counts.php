<?php

use App\Models\Tenant;
use App\Http\Controllers\Shared\NotificationController;
use Illuminate\Http\Request;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = Tenant::first();
if (!$user) {
    die("No tenant found for testing.\n");
}

$controller = new NotificationController();
$request = Request::create('/notifications', 'GET');
$request->setUserResolver(fn() => $user);

$response = $controller->index($request);
$data = $response->getData(true);

echo "Unread Counts Breakdown:\n";
print_r($data['unread_counts'] ?? 'NOT FOUND');
echo "\nTotal Unread: " . ($data['unread_count'] ?? '0') . "\n";
