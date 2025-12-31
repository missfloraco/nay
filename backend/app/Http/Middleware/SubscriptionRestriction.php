<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SubscriptionRestriction
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $request->user();

        // If not a tenant (e.g. admin or public), skip
        if (!$tenant || !($tenant instanceof \App\Models\Tenant)) {
            return $next($request);
        }

        $subscription = $tenant->currentSubscription;
        $status = $subscription ? $subscription->status : $tenant->status;

        // 1. Suspended -> Block all except vital routes
        if ($status === 'suspended') {
            if ($this->isVitalRoute($request)) {
                return $next($request);
            }
            return response()->json([
                'message' => 'تم تعليق حسابك تماماً. يرجى التواصل مع الإدارة.',
                'subscription_status' => 'suspended'
            ], 403);
        }

        // 2. Expired / Restricted -> Read-only
        if (in_array($status, ['expired', 'restricted', 'archived'])) {
            if ($request->isMethod('GET') || $this->isVitalRoute($request)) {
                return $next($request);
            }
            return response()->json([
                'message' => 'انتهت صلاحية اشتراكك. يرجى اختيار خطة لتفعيل الحساب.',
                'subscription_status' => $status
            ], 403);
        }

        return $next($request);
    }

    /**
     * Routes that should always be accessible.
     */
    private function isVitalRoute(Request $request): bool
    {
        $allowedPatterns = [
            'app/user',
            'app/logout',
            'app/settings',
            'app/support*',
            'app/preferences'
        ];

        foreach ($allowedPatterns as $pattern) {
            if ($request->is($pattern)) {
                return true;
            }
        }

        return false;
    }
}
