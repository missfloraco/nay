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
        ]);

        $code = random_int(100000, 999999);

        $tenant = Tenant::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'country_code' => $request->country ?? 'PS',
            'status' => 'trial',
            'trial_expires_at' => now()->addDays(7),
            'ads_enabled' => true,
            'verification_code' => $code,
            'verification_code_expires_at' => now()->addMinutes(15),
        ]);

        event(new Registered($tenant));

        try {
            \Illuminate\Support\Facades\Mail::to($tenant->email)->send(new \App\Mail\VerificationCodeMail($code));
        } catch (\Exception $e) {
            // Log error but don't fail registration
            \Illuminate\Support\Facades\Log::error('Failed to send verification email: ' . $e->getMessage());
        }

        Auth::guard('tenant')->login($tenant);

        return response()->json([
            'user' => $tenant,
            'token' => $tenant->createToken('tenant_token')->plainTextToken,
            'message' => 'Registration successful. Please check your email for the verification code.'
        ], 201);
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
     * Resend verification code.
     */
    public function sendVerificationEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        $code = random_int(100000, 999999);
        $user = $request->user();
        $user->verification_code = $code;
        $user->verification_code_expires_at = now()->addMinutes(15);
        $user->save();

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\VerificationCodeMail($code));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send email.'], 500);
        }

        return response()->json(['message' => 'Verification code sent!']);
    }

    /**
     * Verify the email using the code.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        if ($user->verification_code !== $request->code) {
            return response()->json(['message' => 'Invalid verification code.'], 400);
        }

        if ($user->verification_code_expires_at && $user->verification_code_expires_at->isPast()) {
            return response()->json(['message' => 'Verification code expired.'], 400);
        }

        if ($user->markEmailAsVerified()) {
            $user->verification_code = null;
            $user->verification_code_expires_at = null;
            $user->save();
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email verified successfully!']);
    }
}
