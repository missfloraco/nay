<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Subscription;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PhoneAuthController extends Controller
{
    /**
     * Handle initial phone registration request.
     * This prepares the user for OTP (Future) or completes registration.
     */
    public function register(Request $request)
    {
        // 1. Validate Inputs
        // NOTE: If using 'propaganistas/laravel-phone', validation would be:
        // 'phone' => 'required|phone:SA,AE,EG,JO,MA,KW|unique:tenants,phone'
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:tenants,email',
            'phone' => ['required', 'string', 'unique:tenants,phone', 'regex:/^\+[1-9]\d{1,14}$/'], // E.164 Validation
            'password' => 'required|string|min:8',
            'country_code' => 'required|string|size:2|in:SA,AE,EG,JO,MA,KW,BH,QA,OM,PS,LB,SY,IQ,DZ,TN,LY,SD,YE,SO,MR,DJ,KM',
        ], [
            'phone.regex' => 'رقم الهاتف يجب أن يكون بالتنسيق الدولي (مثلاً: +966...)',
            'phone.unique' => 'رقم الهاتف هذا مسجل بالفعل.',
            'email.unique' => 'البريد الإلكتروني هذا مسجل بالفعل.',
        ]);

        try {
            DB::beginTransaction();

            $trialDays = (int) Setting::get('trial_period_days', 7);

            // 2. Create Tenant
            $tenant = Tenant::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'country_code' => $validated['country_code'],
                'status' => 'trial',
                'trial_expires_at' => now()->addDays($trialDays),
                'ads_enabled' => true,
                'email_verified_at' => now(), // Auto-verify for this example or prepare for OTP
            ]);

            // 3. Create Initial Subscription
            Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => 1, // Default trial plan
                'status' => 'trial',
                'started_at' => now(),
                'trial_ends_at' => now()->addDays($trialDays),
            ]);

            DB::commit();

            // 4. Generate Token for Auto-Login
            $token = $tenant->createToken('phone_auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'تم إنشاء الحساب بنجاح! جاري تحويلك للوحة التحكم.',
                'user' => $tenant,
                'token' => $token
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Registration Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى لاحقاً.'
            ], 500);
        }
    }

    /**
     * Check if phone is available (Real-time frontend check)
     */
    public function checkPhoneAvailability(Request $request)
    {
        $request->validate(['phone' => 'required|string']);
        $exists = Tenant::where('phone', $request->phone)->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'رقم الهاتف مسجل مسبقاً' : 'رقم الهاتف متاح'
        ]);
    }
}
