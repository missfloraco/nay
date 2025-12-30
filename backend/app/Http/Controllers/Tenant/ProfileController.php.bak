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

        $tenant->name = $data['name'];
        $tenant->email = $data['email'];
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
            'message' => 'تم تحديث الملف الشخصي بنجاح',
            'bonus_message' => $bonusMessage,
            'user' => $tenant
        ]);
    }
}
