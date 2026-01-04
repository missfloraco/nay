<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use App\Rules\NotDisposableEmail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;

class AuthController extends Controller
{
    /**
     * Handle incoming registration request.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:tenants',
                new NotDisposableEmail,
            ],
            'password' => ['required', 'string', 'min:8'],
            'country' => ['nullable', 'string', 'size:2'],
            'phone' => ['required', 'string', 'unique:tenants,phone', 'regex:/^\+[1-9]\d{1,14}$/'],
        ]);

        $code = random_int(100000, 999999);

        // Store registration data in Cache for 30 minutes
        $registrationData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password, // Raw password, will hash on create
            'country' => $request->country ?? 'PS',
            'code' => $code
        ];

        \Illuminate\Support\Facades\Cache::put('temp_reg_' . $request->email, $registrationData, 1800);

        try {
            \Illuminate\Support\Facades\Mail::to($request->email)->send(new \App\Mail\VerificationCodeMail($code));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send verification email: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send verification email.'], 500);
        }

        return response()->json([
            'message' => 'Please verify your email to complete registration.',
            'require_verification' => true,
            'email' => $request->email
        ], 200);
    }

    /**
     * Complete registration after OTP verification.
     */
    public function completeRegistration(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6']
        ]);

        $cachedData = \Illuminate\Support\Facades\Cache::get('temp_reg_' . $request->email);

        if (!$cachedData || $cachedData['code'] != $request->code) {
            return response()->json(['message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية.'], 400);
        }

        // Check if user already exists independently of cache to prevent duplicates
        if (Tenant::where('email', $cachedData['email'])->exists()) {
            \Illuminate\Support\Facades\Cache::forget('temp_reg_' . $request->email);
            return response()->json([
                'message' => 'هذا الحساب مسجل بالفعل. يمكنك تسجيل الدخول مباشرة.',
                'action' => 'login'
            ], 409); // Conflict
        }

        $maxRetries = 3;
        $attempt = 0;
        $tenant = null;

        while ($attempt < $maxRetries) {
            try {
                // Create actual Tenant record
                $trialDays = (int) \App\Models\Setting::get('trial_period_days', 7);

                $tenant = Tenant::create([
                    'name' => $cachedData['name'],
                    'email' => $cachedData['email'],
                    'phone' => $cachedData['phone'],
                    'password' => Hash::make($cachedData['password']),
                    'country_code' => $cachedData['country'] ?? 'PS',
                    'status' => 'trial',
                    'trial_expires_at' => now()->addDays($trialDays),
                    'ads_enabled' => true,
                    'email_verified_at' => now(),
                ]);

                // Create initial trial subscription
                \App\Models\Subscription::create([
                    'tenant_id' => $tenant->id,
                    'plan_id' => 1, // Default to lowest plan
                    'status' => 'trial',
                    'started_at' => now(),
                    'trial_ends_at' => now()->addDays($trialDays),
                ]);

                // Clear cache
                \Illuminate\Support\Facades\Cache::forget('temp_reg_' . $request->email);

                event(new Registered($tenant));

                // If successful, break the loop
                break;

            } catch (\Illuminate\Database\QueryException $e) {
                // Check for integrity constraint violation (Duplicate Entry)
                if ($e->errorInfo[1] == 1062) {
                    // Determine if it is Email or UID
                    if (str_contains($e->getMessage(), 'tenants_email_unique')) {
                        return response()->json(['message' => 'البريد الإلكتروني مسجل بالفعل.'], 409);
                    }
                    if (str_contains($e->getMessage(), 'uid_unique')) {
                        // UID Collision - Retry
                        $attempt++;
                        if ($attempt >= $maxRetries) {
                            \Illuminate\Support\Facades\Log::error('Failed to generate unique UID after ' . $maxRetries . ' attempts.');
                            return response()->json(['message' => 'حدث خطأ مؤقت، يرجى المحاولة مرة أخرى.'], 500);
                        }
                        continue; // Try again
                    }
                    return response()->json(['message' => 'هذا الحساب مسجل بالفعل.'], 409);
                }
                throw $e;
            }
        }

        // Notify Admins about new registration
        $admins = \App\Models\Admin::all();
        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\SystemNotification([
                'title' => 'مستخدم جديد',
                'message' => 'قام ' . $tenant->name . ' بإنشاء حساب جديد على المنصة.',
                'level' => 'info',
                'action_url' => '/admin/tenants?search=' . $tenant->email,
                'icon' => 'UserPlus'
            ]));
        }

        Auth::guard('tenant')->login($tenant);

        return response()->json([
            'user' => $tenant,
            'token' => $tenant->createToken('tenant_token')->plainTextToken,
            'message' => 'Registration successful.'
        ], 201);
    }

    /**
     * Resend registration OTP.
     */
    public function resendOTP(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $cachedData = \Illuminate\Support\Facades\Cache::get('temp_reg_' . $request->email);

        if (!$cachedData) {
            return response()->json(['message' => 'جلسة التسجيل انتهت. يرجى البدء من جديد.'], 404);
        }

        $code = random_int(100000, 999999);
        $cachedData['code'] = $code;
        \Illuminate\Support\Facades\Cache::put('temp_reg_' . $request->email, $cachedData, 1800);

        try {
            \Illuminate\Support\Facades\Mail::to($request->email)->send(new \App\Mail\VerificationCodeMail($code));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send email.'], 500);
        }

        return response()->json(['message' => 'تم إرسال رمز تحقق جديد.']);
    }

    /**
     * Handle incoming login request.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::guard('tenant')->attempt($credentials)) {
            $request->session()->regenerate();

            $tenant = Auth::guard('tenant')->user();

            if ($tenant->status === 'disabled') {
                Auth::guard('tenant')->logout();
                return response()->json(['message' => 'Account is disabled.'], 403);
            }

            return response()->json([
                'user' => $tenant,
                'token' => $tenant->createToken('tenant_token')->plainTextToken
            ], 200);
        }

        return response()->json(['message' => 'The provided credentials do not match our records.'], 401);
    }

    /**
     * Handle logout request.
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        Auth::guard('tenant')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }
    /**
     * Handle forgot password request.
     */
    /**
     * Handle forgot password request (OTP generation).
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:tenants,email']);

        $email = $request->email;
        $code = random_int(100000, 999999);

        // Store OTP in cache for 15 minutes
        \Illuminate\Support\Facades\Cache::put('password_reset_OTP_' . $email, $code, 900);

        try {
            // Reusing VerificationCodeMail for simplicity, or create a specific ResetPasswordCodeMail
            // Ideally, create a new mail class for better context, but for now we use the existing one or generic message.
            // Using logic to send email:
            \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\VerificationCodeMail($code));
        } catch (\Exception $e) {
            return response()->json(['message' => 'فشل إرسال البريد الإلكتروني.'], 500);
        }

        return response()->json([
            'message' => 'تم إرسال رمز التحقق إلى بريدك الإلكتروني.',
            'require_otp' => true,
            'email' => $email
        ]);
    }

    /**
     * Verify the reset code before allowing password change.
     */
    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ]);

        $cachedCode = \Illuminate\Support\Facades\Cache::get('password_reset_OTP_' . $request->email);

        if (!$cachedCode || $cachedCode != $request->code) {
            return response()->json(['message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية.'], 400);
        }

        return response()->json(['message' => 'Code verified']);
    }

    /**
     * Reset password using code.
     */
    public function resetPasswordWithCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:tenants,email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed'
        ]);

        $cachedCode = \Illuminate\Support\Facades\Cache::get('password_reset_OTP_' . $request->email);

        if (!$cachedCode || $cachedCode != $request->code) {
            return response()->json(['message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية.'], 400);
        }

        $tenant = Tenant::where('email', $request->email)->first();
        if (!$tenant) {
            return response()->json(['message' => 'المستخدم غير موجود.'], 404);
        }

        $tenant->update([
            'password' => Hash::make($request->password)
        ]);

        // Clear cache
        \Illuminate\Support\Facades\Cache::forget('password_reset_OTP_' . $request->email);

        return response()->json(['message' => 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.']);
    }
}

