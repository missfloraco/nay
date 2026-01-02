<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    protected $imageService;

    public function __construct(\App\Services\ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function update(Request $request)
    {
        $tenant = auth()->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('tenants')->ignore($tenant->id)],
            'whatsapp' => 'nullable|string|max:255',
            'country_code' => 'nullable|string|size:2',
            'new_password' => 'nullable|string|min:8',
            'avatar' => 'nullable|image|max:2048',
            'remove_avatar' => 'nullable|boolean'
        ]);

        $emailChanged = $tenant->email !== $data['email'];

        if ($emailChanged) {
            // Generate OTP for new email
            $code = random_int(100000, 999999);

            // Store pending change in cache for 30 minutes
            \Illuminate\Support\Facades\Cache::put('pending_email_change_' . $tenant->id, [
                'new_email' => $data['email'],
                'code' => $code
            ], 1800);

            // Send OTP to NEW email
            try {
                \Illuminate\Support\Facades\Mail::to($data['email'])->send(new \App\Mail\VerificationCodeMail($code));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to send verification email on update: ' . $e->getMessage());
                return response()->json(['message' => 'Failed to send verification email.'], 500);
            }

            // Don't update email yet, return requirement
            $requireVerification = true;
        } else {
            $requireVerification = false;
        }

        $tenant->name = $data['name'];

        if (array_key_exists('whatsapp', $data))
            $tenant->whatsapp = $data['whatsapp'];
        if (array_key_exists('country_code', $data))
            $tenant->country_code = $data['country_code'];

        if (!empty($data['new_password'])) {
            $tenant->password = Hash::make($data['new_password']);
        }

        // Handle Avatar
        if ($request->boolean('remove_avatar')) {
            $this->imageService->deleteIfExists($tenant->avatar_url);
            $tenant->avatar_url = null;
        } elseif ($request->hasFile('avatar')) {
            $this->imageService->deleteIfExists($tenant->avatar_url);
            $path = $this->imageService->storeOptimized($request->file('avatar'), "tenants/{$tenant->uid}/avatars");
            $tenant->avatar_url = '/storage/' . $path;
        }

        $tenant->save();
        $tenant->refresh();

        $bonusMessage = null;

        // Bonus Trial Logic
        if (!$tenant->trial_bonus_applied && !empty($tenant->whatsapp) && !empty($tenant->avatar_url)) {
            // Grant Bonus
            $tenant->trial_bonus_applied = true;
            $currentExpiry = $tenant->trial_expires_at ? \Carbon\Carbon::parse($tenant->trial_expires_at) : now();
            $tenant->trial_expires_at = $currentExpiry->addDays(7);
            $tenant->save();
            $bonusMessage = 'تهانينا! لقد حصلت على 7 أيام إضافية للفترة التجريبية لإكمال بيانات ملفك الشخصي. 🎉';
        } elseif ($tenant->trial_bonus_applied && (empty($tenant->whatsapp) || empty($tenant->avatar_url))) {
            // Revoke Bonus
            $tenant->trial_bonus_applied = false;
            $currentExpiry = $tenant->trial_expires_at ? \Carbon\Carbon::parse($tenant->trial_expires_at) : now();
            $tenant->trial_expires_at = $currentExpiry->subDays(7);
            $tenant->save();
        }

        return response()->json([
            'message' => $requireVerification ? 'يرجى تأكيد البريد الإلكتروني الجديد' : 'تم تحديث الملف الشخصي بنجاح',
            'bonus_message' => $bonusMessage,
            'user' => $tenant,
            'require_verification' => $requireVerification,
            'pending_email' => $requireVerification ? $data['email'] : null
        ]);
    }

    public function verifyEmailChange(Request $request)
    {
        $tenant = auth()->user();
        $request->validate([
            'code' => 'required|string|size:6'
        ]);

        $pending = \Illuminate\Support\Facades\Cache::get('pending_email_change_' . $tenant->id);

        if (!$pending || $pending['code'] != $request->code) {
            return response()->json(['message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية.'], 400);
        }

        // Update actual email
        $tenant->email = $pending['new_email'];
        $tenant->email_verified_at = now();
        $tenant->save();

        // Clear cache
        \Illuminate\Support\Facades\Cache::forget('pending_email_change_' . $tenant->id);

        return response()->json([
            'message' => 'تم تأكيد البريد الإلكتروني وتحديثه بنجاح',
            'user' => $tenant
        ]);
    }
    public function updatePreferences(Request $request)
    {
        $user = $request->user();
        $prefs = $user->settings ?: [];
        $prefs['dark_mode'] = $request->input('dark_mode');
        $user->settings = $prefs;
        $user->save();
        return response()->json(['message' => 'Preferences updated']);
    }
}
