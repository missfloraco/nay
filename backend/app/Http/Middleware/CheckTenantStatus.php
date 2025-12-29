<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTenantStatus
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !$user->tenant) {
            return $next($request);
        }

        $tenant = $user->tenant;

        // 1. Check Activation Gate
        if ($tenant->status === 'pending') {
            return response()->json([
                'message' => 'بانتظار تفعيل الحساب من قبل الإدارة',
                'status' => 'pending'
            ], 403);
        }

        // 2. Check Trial/Status Lock
        if (in_array($tenant->status, ['expired', 'disabled'])) {
            return response()->json([
                'message' => 'الحساب معطل أو انتهت فترة التجربة',
                'status' => $tenant->status
            ], 403);
        }

        return $next($request);
    }
}
