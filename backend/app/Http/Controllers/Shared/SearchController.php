<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->query('q');

        if (!$query || strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $results = [];
        $lowerQuery = strtolower($query);

        // 1. Search Tenants
        // Check if user is admin to decide what data to show? 
        // For now this is a protected route, usually for Admin. 
        // If Tenant calls this, they shouldn't see other tenants?
        // Let's implement Admin-scoped search for now as it's the main use case.

        // Scope Check: Are we searching as Admin or Tenant?
        // We'll trust the route middleware or guard.

        $tenants = Tenant::where(function ($q) use ($query) {
            $q->where('name', 'LIKE', "%{$query}%")
                ->orWhere('email', 'LIKE', "%{$query}%");
        })
            ->limit(5)
            ->get();

        foreach ($tenants as $tenant) {
            $results[] = [
                'id' => $tenant->id,
                'title' => $tenant->name,
                'subtitle' => $tenant->email,
                'type' => 'tenant',
                'image' => $tenant->avatar_url ?? null,
                'url' => "/admin/tenants?id={$tenant->id}"
            ];
        }

        return response()->json(['results' => $results]);
    }
}
