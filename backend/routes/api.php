<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Response;
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


    // Texts/Translations Endpoint
    Route::get('/texts/{locale}', function ($locale) {
        // In a real app, this would load from lang files or DB
        // For now, return basic structure to satisfy frontend
        return response()->json([
            'AUTH' => [
                'LOGIN' => [
                    'TITLE' => 'تسجيل الدخول',
                    'SUBTITLE' => 'مرحباً بك مجدداً! سجل دخولك للمتابعة',
                    'EMAIL_LABEL' => 'البريد الإلكتروني',
                    'PASSWORD_LABEL' => 'كلمة المرور',
                    'SUBMIT' => 'تسجيل الدخول',
                ],
                'REGISTER' => [
                    'TITLE' => 'إنشاء حساب جديد',
                    'SUBTITLE' => 'ابدأ رحلتك معنا اليوم',
                    'EMAIL_LABEL' => 'البريد الإلكتروني',
                    'PASSWORD_LABEL' => 'كلمة المرور',
                    'SUBMIT' => 'تسجيل حساب',
                    'FULL_NAME_LABEL' => 'الاسم الكامل',
                    'FULL_NAME_PLACEHOLDER' => 'الاسم الكامل',
                    'COUNTRY_LABEL' => 'الدولة',
                ],
                'VERIFICATION' => [
                    'TITLE' => 'تأكيد الحساب',
                    'SUBTITLE' => 'يرجى إدخال رمز التحقق الذي تم إرساله إلى بريدك الإلكتروني',
                    'SUBMIT' => 'تأكيد الحساب',
                    'EMAIL_LABEL' => 'البريد الإلكتروني',
                    'PASSWORD_LABEL' => 'كلمة المرور',
                    'FULL_NAME_LABEL' => 'الاسم الكامل',
                    'COUNTRY_LABEL' => 'الدولة',
                ],
                'FORGOT_PASSWORD' => [
                    'TITLE' => 'نسيت كلمة المرور؟',
                    'SUBTITLE' => 'أدخل بريدك الإلكتروني لاستعادة حسابك',
                    'EMAIL_LABEL' => 'البريد الإلكتروني',
                    'SUBMIT' => 'إرسال رابط الاستعادة',
                ],
                'RESET-OTP' => [
                    'TITLE' => 'تأكيد الرمز',
                    'SUBTITLE' => 'أدخل الرمز الذي وصلك للمتابعة',
                    'SUBMIT' => 'تحقق من الرمز',
                ],
                'RESET-PASSWORD' => [
                    'TITLE' => 'تعيين كلمة المرور',
                    'SUBTITLE' => 'أنشئ كلمة مرور قوية لحسابك',
                    'PASSWORD_LABEL' => 'كلمة المرور الجديدة',
                    'PASSWORD_PLACEHOLDER' => 'أدخل كلمة المرور الجديدة',
                    'SUBMIT' => 'تغيير كلمة المرور',
                ],
            ]
        ]);
    });

    // SEO Settings Endpoint (Public - for landing page)
    Route::get('/seo/{pageKey}', [App\Http\Controllers\Admin\SeoSettingController::class, 'show']);

    // Public Plans Endpoint
    Route::get('/plans', [App\Http\Controllers\Tenant\SubscriptionController::class, 'plans']);
});

// Unified Login Route (Admin & Tenant)
Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required'],
    ]);

    // 1. Try Admin (Session-based)
    if (Auth::guard('admin')->attempt($credentials)) {
        $request->session()->regenerate();
        return response()->json([
            'type' => 'admin',
            'user' => Auth::guard('admin')->user()
        ]);
    }

    // 2. Try Tenant (Token-based)
    $tenant = Tenant::where('email', $request->email)->first();
    if ($tenant && Hash::check($request->password, $tenant->password)) {
        $status = $tenant->status; // Uses the accessor in Tenant model which checks dates

        if ($status === 'disabled') {
            return response()->json(['message' => 'حسابك معطل. يرجى الاتصال بالدعم.'], 403);
        }

        if ($status === 'expired') {
            return response()->json(['message' => 'انتهت صلاحية حسابك. يرجى تجديد الاشتراك للمتابعة.'], 403);
        }

        Auth::guard('tenant')->login($tenant);
        $token = $tenant->createToken('tenant_token')->plainTextToken;

        return response()->json([
            'type' => 'tenant',
            'user' => $tenant,
            'token' => $token
        ]);
    }

    return response()->json(['message' => 'بيانات الدخول غير صحيحة.'], 401);
})->middleware('throttle:10,1');

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
        Route::post('/tenants/{id}/restore', [App\Http\Controllers\Admin\TenantController::class, 'restore'])->name('admin.tenants.restore');
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

        // Support Upload
        Route::post('support/upload', [App\Http\Controllers\Admin\SupportController::class, 'uploadImage'])->middleware('throttle:10,1');

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
        Route::post('ads/{id}/restore', [App\Http\Controllers\Admin\AdController::class, 'restore']);
        Route::apiResource('ads', App\Http\Controllers\Admin\AdController::class);

        // Manual Payments
        Route::post('/payments', [PaymentController::class, 'store']);
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::get('/tenants/{tenant}/payments', [PaymentController::class, 'getTenantPayments']);
        Route::put('/payments/{payment}', [PaymentController::class, 'update']);
        Route::post('/payments/{id}/restore', [PaymentController::class, 'restore']);
        Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);

        Route::post('/preferences', [App\Http\Controllers\Admin\ProfileController::class, 'updatePreferences']);

        // Notification Management
        Route::prefix('notifications')->group(function () {
            Route::get('/', [App\Http\Controllers\Shared\NotificationController::class, 'index']);
            Route::post('/{id}/read', [App\Http\Controllers\Shared\NotificationController::class, 'markAsRead']);
            Route::post('/read-all', [App\Http\Controllers\Shared\NotificationController::class, 'markAllAsRead']);
            Route::delete('/{id}', [App\Http\Controllers\Shared\NotificationController::class, 'destroy']);
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

        // Scripts Management
        Route::post('scripts/{id}/restore', [App\Http\Controllers\Admin\ScriptController::class, 'restore']);
        Route::apiResource('scripts', App\Http\Controllers\Admin\ScriptController::class);
        Route::post('scripts/{id}/toggle', [App\Http\Controllers\Admin\ScriptController::class, 'toggleStatus']);

        // Subscription System
        Route::post('plans/{id}/restore', [App\Http\Controllers\Admin\PlanController::class, 'restore']);
        Route::apiResource('plans', App\Http\Controllers\Admin\PlanController::class);
        Route::get('/subscription-requests', [App\Http\Controllers\Admin\SubscriptionRequestController::class, 'index']);
        Route::post('/subscription-requests/{subRequest}/approve', [App\Http\Controllers\Admin\SubscriptionRequestController::class, 'approve']);
        Route::post('/subscription-requests/{subRequest}/reject', [App\Http\Controllers\Admin\SubscriptionRequestController::class, 'reject']);
    });
});



// Tenant Authentication Routes
Route::prefix('app')->group(function () {
    // ... (Login/Register remain same) ...
    // Login
    Route::post('/login', [App\Http\Controllers\Tenant\AuthController::class, 'login'])->middleware('throttle:6,1');

    // Register
    Route::post('/register', [App\Http\Controllers\Tenant\AuthController::class, 'register'])->middleware('throttle:3,1');
    Route::post('/register/complete', [App\Http\Controllers\Tenant\AuthController::class, 'completeRegistration'])->middleware('throttle:5,1');
    Route::post('/register/resend-otp', [App\Http\Controllers\Tenant\AuthController::class, 'resendOTP'])->middleware('throttle:3,1');

    // Forgot Password
    Route::post('/forgot-password', [App\Http\Controllers\Tenant\AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
    Route::post('/forgot-password/verify', [App\Http\Controllers\Tenant\AuthController::class, 'verifyResetCode'])->middleware('throttle:5,1');
    Route::post('/forgot-password/reset', [App\Http\Controllers\Tenant\AuthController::class, 'resetPasswordWithCode'])->middleware('throttle:5,1');

    // Protected Tenant Routes
    Route::middleware(['auth:sanctum,tenant', 'tenant.only', 'tenant.status', 'subscription.check'])->group(function () {


        Route::get('/user', function (Request $request) {
            return response()->json([
                'user' => $request->user(),
                // For frontend compatibility, mapping tenant to 'user' and 'tenant'
                'tenant' => $request->user()
            ]);
        });

        Route::post('/profile', [App\Http\Controllers\Tenant\ProfileController::class, 'update'])->middleware('throttle:5,1');
        Route::post('/profile/verify-email', [App\Http\Controllers\Tenant\ProfileController::class, 'verifyEmailChange'])->middleware('throttle:5,1');

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
            Route::post('/upload', [App\Http\Controllers\Tenant\SupportController::class, 'uploadImage'])->middleware('throttle:10,1');
        });

        Route::post('/preferences', [App\Http\Controllers\Tenant\ProfileController::class, 'updatePreferences']);

        // Subscriptions
        Route::get('/subscription/plans', [App\Http\Controllers\Tenant\SubscriptionController::class, 'plans']);
        Route::get('/subscription/current', [App\Http\Controllers\Tenant\SubscriptionController::class, 'current']);
        Route::post('/subscription/request', [App\Http\Controllers\Tenant\SubscriptionController::class, 'requestUpgrade']);
        Route::get('/subscription/payments', [App\Http\Controllers\Tenant\SubscriptionController::class, 'payments']);
        Route::get('/subscription/requests', [App\Http\Controllers\Tenant\SubscriptionController::class, 'requests']);

        // Notification Management
        Route::prefix('notifications')->group(function () {
            Route::get('/', [App\Http\Controllers\Shared\NotificationController::class, 'index']);
            Route::post('/{id}/read', [App\Http\Controllers\Shared\NotificationController::class, 'markAsRead']);
            Route::post('/read-all', [App\Http\Controllers\Shared\NotificationController::class, 'markAllAsRead']);
            Route::delete('/{id}', [App\Http\Controllers\Shared\NotificationController::class, 'destroy']);
        });

        Route::post('/logout', [App\Http\Controllers\Tenant\AuthController::class, 'logout']);
    });
});
