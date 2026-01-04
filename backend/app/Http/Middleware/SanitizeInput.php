<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $input = $request->all();

            // Fields that are ALLOWED to have HTML/Scripts (Admin only)
            $except = [
                'content',
                'custom_head_code',
                'seo_meta_tags',
                'custom_css',
                'script_code'
            ];

            $isAdmin = auth()->guard('admin')->check();

            array_walk_recursive($input, function (&$value, $key) use ($except, $isAdmin) {
                if (is_string($value)) {
                    // Only allow raw HTML/Scripts if the user is an ADMIN
                    if ($isAdmin && in_array($key, $except)) {
                        return; // Skip sanitization for these specific admin-only fields
                    }

                    // Remove null bytes
                    $value = str_replace(chr(0), '', $value);
                    // Trim
                    $value = trim($value);
                    // Strip tags for security (Anti-XSS Defense in Depth)
                    $value = strip_tags($value);
                }
            });

            $request->merge($input);
        } catch (\Throwable $e) {
            // Log error but continue request to avoid breaking the app
            \Illuminate\Support\Facades\Log::error("Sanitization error: " . $e->getMessage());
        }

        return $next($request);
    }
}
