<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant;
use Illuminate\Support\Facades\Auth;

class TenantOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::guard('tenant')->user();

        if (!$user || !($user instanceof Tenant)) {
            return response()->json(['message' => 'Unauthorized. Tenant access only.'], 403);
        }

        return $next($request);
    }
}
