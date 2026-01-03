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
            // Allow vital routes (logout, billing, etc.)
            if ($this->isVitalRoute($request)) {
                return $next($request);
            }

            return response()->json([
                'message' => $tenant->status === 'disabled' ? 'الحساب معطل من قبل الإدارة' : 'انتهت صلاحية الحساب. يرجى التجديد للمتابعة.',
                'status' => $tenant->status
            ], 403);
        }

        return $next($request);
    }

    private function isVitalRoute(Request $request): bool
    {
        $allowedPatterns = [
            'api/app/user',
            'api/app/logout',
            'api/app/subscription/plans',
            'api/app/subscription/current',
            'api/app/subscription/request',
            'api/app/subscription/payments',
            'api/app/subscription/requests',
            'api/app/billing*',
            'api/app/support*',
            'api/app/preferences',
            'api/public/*'
        ];

        foreach ($allowedPatterns as $pattern) {
            if ($request->is($pattern)) {
                return true;
            }
        }

        return false;
    }
}
