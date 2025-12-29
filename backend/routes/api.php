<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\Tenant;
use App\Http\Controllers\Admin\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('public')->group(function () {
    Route::get('/settings/branding', [App\Http\Controllers\Admin\BrandingController::class, 'index']);

    Route::get('/ads/active', [App\Http\Controllers\Admin\AdController::class, 'getActiveAds']);
    Route::post('/ads/{id}/impression', [App\Http\Controllers\Admin\AdController::class, 'trackImpression']);
    Route::get('/ads/{id}/click', [App\Http\Controllers\Admin\AdController::class, 'trackClick']);

    Route::get('/tenant-info', function (Request $request) {
        // Since we removed domains, this endpoint might be redundant or needs a different logic.
        // For now, we'll return a generic response or null since there's no domain to check.
        // If the frontend expects this to check subdomain, that feature is now effectively disabled.
        return response()->json(['name' => 'NaySaaS'], 200);
    });

    // Texts/Translations Endpoint
    Route::get('/texts/{locale}', function ($locale) {
        // In a real app, this would load from lang files or DB
        // For now, return basic structure to satisfy frontend
        return response()->json([
            'auth' => [
                'login' => [
                    'title' => 'تسجيل الدخول',
                    'subtitle' => 'مرحباً بك مجدداً! سجل دخولك للمتابعة',
                    'email_label' => 'البريد الإلكتروني',
                    'password_label' => 'كلمة المرور',
                    'submit' => 'تسجيل الدخول',
                ],
                // Add more as needed
            ]
        ]);
    });

    // SEO Settings Endpoint (Public - for landing page)
    Route::get('/seo/{pageKey}', [App\Http\Controllers\Admin\SeoSettingController::class, 'show']);
});

// Admin Authentication Routes
Route::prefix('admin')->group(function () {

    // Login
    Route::post('/login', function (Request $request) {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::guard('admin')->attempt($credentials)) {
            $request->session()->regenerate();
            return response()->json(['user' => Auth::guard('admin')->user()], 200);
        }

        return response()->json(['message' => 'The provided credentials do not match our records.'], 401);
    })->middleware('throttle:6,1');

    // Protected Admin Routes (with rate limiting)
    Route::middleware(['auth:sanctum,admin', 'admin.only', 'throttle:60,1'])->group(function () {
        Route::get('/user', function (Request $request) {
            return response()->json(['user' => $request->user()]);
        });

        Route::get('/tenants', [App\Http\Controllers\Admin\TenantController::class, 'index'])->name('admin.tenants.index');
        Route::post('/tenants', [App\Http\Controllers\Admin\TenantController::class, 'store'])->name('admin.tenants.store');
        Route::put('/tenants/{id}', [App\Http\Controllers\Admin\TenantController::class, 'update'])->name('admin.tenants.update');
        Route::delete('/tenants/{id}', [App\Http\Controllers\Admin\TenantController::class, 'destroy'])->name('admin.tenants.destroy');
        Route::post('/tenants/{id}/{action}', [App\Http\Controllers\Admin\TenantController::class, 'handleAction'])->name('admin.tenants.action');

        // Trash Management Routes
        Route::prefix('trash')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\TrashController::class, 'index']);
            Route::post('/restore', [App\Http\Controllers\Admin\TrashController::class, 'restore']);
            Route::delete('/force', [App\Http\Controllers\Admin\TrashController::class, 'forceDelete']);
            Route::post('/bulk-restore', [App\Http\Controllers\Admin\TrashController::class, 'bulkRestore']);
            Route::delete('/bulk-force', [App\Http\Controllers\Admin\TrashController::class, 'bulkForceDelete']);
            Route::delete('/empty', [App\Http\Controllers\Admin\TrashController::class, 'emptyTrash']);
        });

        // Support Tickets Routes
        Route::prefix('support/tickets')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\SupportController::class, 'index']);
            Route::get('/{id}', [App\Http\Controllers\Admin\SupportController::class, 'show']);
            Route::post('/{id}/reply', [App\Http\Controllers\Admin\SupportController::class, 'reply']);
            Route::patch('/{id}/status', [App\Http\Controllers\Admin\SupportController::class, 'updateStatus']);
            Route::delete('/{id}', [App\Http\Controllers\Admin\SupportController::class, 'destroy']);
            Route::post('/{id}/restore', [App\Http\Controllers\Admin\SupportController::class, 'restore']);
        });

        Route::get('/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index']);
        Route::get('/settings', [App\Http\Controllers\Admin\SettingsController::class, 'index']);
        Route::post('/settings', [App\Http\Controllers\Admin\SettingsController::class, 'update']);
        Route::post('/profile', [App\Http\Controllers\Admin\ProfileController::class, 'update'])->middleware('throttle:5,1');
        Route::delete('support/tickets/{id}/force', [App\Http\Controllers\Admin\SupportController::class, 'forceDelete']);
        Route::get('/notifications/support', [App\Http\Controllers\Admin\SupportController::class, 'notifications']);

        // SEO Management Routes
        Route::get('/seo', [App\Http\Controllers\Admin\SeoSettingController::class, 'index']);
        Route::put('/seo/{pageKey}', [App\Http\Controllers\Admin\SeoSettingController::class, 'update']);

        // Ads Management Routes
        Route::post('ads/toggle-adblock', [App\Http\Controllers\Admin\AdController::class, 'toggleAdBlock']);
        Route::post('ads/upload', [App\Http\Controllers\Admin\AdController::class, 'uploadImage'])->middleware('throttle:5,1');
        Route::apiResource('ads', App\Http\Controllers\Admin\AdController::class);

        // Manual Payments
        Route::post('/payments', [PaymentController::class, 'store']);
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::get('/tenants/{tenant}/payments', [PaymentController::class, 'getTenantPayments']);
        Route::put('/payments/{payment}', [PaymentController::class, 'update']);
        Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);

        Route::post('/preferences', function (Request $request) {
            $user = $request->user();
            $prefs = $user->settings ?: [];
            $prefs['dark_mode'] = $request->input('dark_mode');
            $user->settings = $prefs;
            $user->save();
            return response()->json(['message' => 'Preferences updated']);
        });

        Route::post('/logout', function (Request $request) {
            if ($request->user()) {
                $request->user()->currentAccessToken()->delete();
            }
            Auth::guard('admin')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return response()->json(['message' => 'Logged out']);
        });

        Route::get('/search', [App\Http\Controllers\Shared\SearchController::class, 'search'])->middleware('throttle:15,1');
    });
});

// Tenant Authentication Routes
Route::prefix('app')->group(function () {
    // ... (Login/Register remain same) ...
    // Login
    Route::post('/login', function (Request $request) {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::guard('tenant')->attempt($credentials)) {
            $request->session()->regenerate();

            // Check status
            $tenant = Auth::guard('tenant')->user();
            if ($tenant->status === 'disabled') {
                Auth::guard('tenant')->logout();
                return response()->json(['message' => 'Account is disabled.'], 403);
            }

            return response()->json([
                'user' => Auth::guard('tenant')->user(),
                'token' => Auth::guard('tenant')->user()->createToken('tenant_token')->plainTextToken
            ], 200);
        }

        return response()->json(['message' => 'The provided credentials do not match our records.'], 401);
    })->middleware('throttle:6,1');

    // Register
    Route::post('/register', function (Request $request) {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:tenants'],
            'password' => ['required', 'string', 'min:8'],
            'country' => ['nullable', 'string', 'size:2'],
        ]);

        $tenant = \App\Models\Tenant::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'country_code' => $data['country'] ?? 'PS',
            'status' => 'trial',
            'trial_expires_at' => now()->addDays(7),
        ]);

        Auth::guard('tenant')->login($tenant);
        $request->session()->regenerate();

        return response()->json([
            'user' => $tenant,
            'token' => $tenant->createToken('tenant_token')->plainTextToken
        ], 201);
    })->middleware('throttle:3,1'); // stricter for registration

    // Forgot Password Placeholder
    Route::post('/forgot-password', function (Request $request) {
        $request->validate(['email' => 'required|email']);
        // TODO: Implement actual logic in a separate controller for security
        return response()->json(['message' => 'إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رابطاً لإعادة تعيين كلمة المرور قريباً.']);
    })->middleware('throttle:3,1');

    // Protected Tenant Routes
    Route::middleware(['auth:sanctum,tenant', 'tenant.only'])->group(function () {
        Route::get('/user', function (Request $request) {
            return response()->json([
                'user' => $request->user(),
                // For frontend compatibility, mapping tenant to 'user' and 'tenant'
                'tenant' => $request->user()
            ]);
        });

        Route::post('/profile', [App\Http\Controllers\Tenant\ProfileController::class, 'update'])->middleware('throttle:5,1');

        // Trash Management Routes
        Route::prefix('trash')->group(function () {
            Route::get('/', [App\Http\Controllers\Tenant\TrashController::class, 'index']);
            Route::post('/restore', [App\Http\Controllers\Tenant\TrashController::class, 'restore']);
            Route::delete('/force', [App\Http\Controllers\Tenant\TrashController::class, 'forceDelete']);
            Route::post('/bulk-restore', [App\Http\Controllers\Tenant\TrashController::class, 'bulkRestore']);
            Route::delete('/bulk-force', [App\Http\Controllers\Tenant\TrashController::class, 'bulkForceDelete']);
            Route::delete('/empty', [App\Http\Controllers\Tenant\TrashController::class, 'emptyTrash']);
        });

        // Support Tickets Routes
        Route::prefix('support')->group(function () {
            Route::get('/tickets', [App\Http\Controllers\Tenant\SupportController::class, 'index']);
            Route::post('/tickets', [App\Http\Controllers\Tenant\SupportController::class, 'store']);
            Route::get('/active-ticket', [App\Http\Controllers\Tenant\SupportController::class, 'getActiveTicket']);
            Route::get('/tickets/{id}', [App\Http\Controllers\Tenant\SupportController::class, 'show']);
            Route::post('/tickets/{id}/reply', [App\Http\Controllers\Tenant\SupportController::class, 'reply']);
            Route::delete('/tickets/{id}', [App\Http\Controllers\Tenant\SupportController::class, 'destroy']);
            Route::get('/notifications/support', [App\Http\Controllers\Tenant\SupportController::class, 'notifications']);
        });

        Route::post('/preferences', function (Request $request) {
            $user = $request->user();
            $prefs = $user->settings ?: [];
            $prefs['dark_mode'] = $request->input('dark_mode');
            $user->settings = $prefs;
            $user->save();
            return response()->json(['message' => 'Preferences updated']);
        });

        Route::post('/logout', function (Request $request) {
            if ($request->user()) {
                // Revoke current token (important for impersonation exit)
                $token = $request->user()->currentAccessToken();
                if ($token) {
                    $token->delete();
                }
            }
            Auth::guard('tenant')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return response()->json(['message' => 'Logged out']);
        });
    });
});
