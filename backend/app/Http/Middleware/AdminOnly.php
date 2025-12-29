<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Auth;

class AdminOnly
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
        $user = Auth::guard('admin')->user();

        if (!$user || !($user instanceof Admin)) {
            return response()->json(['message' => 'Unauthorized. Admin access only.'], 403);
        }

        return $next($request);
    }
}
