<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    protected $imageService;

    public function __construct(\App\Services\ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index()
    {
        // Internal data-fix: Ensure all admins have UIDs for storage paths
        $admins = \App\Models\Admin::whereNull('uid')->orWhere('uid', '')->get();
        foreach ($admins as $admin) {
            $prefix = \App\Models\Admin::UID_PREFIX;
            $admin->uid = "{$prefix}-" . str_pad((string) $admin->id, 6, '0', STR_PAD_LEFT);
            $admin->save();
        }

        return response()->json(Setting::getAllGrouped());
    }

    public function update(Request $request)
    {
        $rules = [
            'app_name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'company_link' => 'nullable|url|max:255',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'custom_font_url' => 'nullable|url|max:2048',
            'custom_heading_font_url' => 'nullable|url|max:2048',
        ];

        if ($request->hasFile('logo_url')) {
            $rules['logo_url'] = 'file|mimes:jpeg,png,jpg,gif,svg,webp|max:2048';
        }

        if ($request->hasFile('favicon_url')) {
            $rules['favicon_url'] = 'file|mimes:ico,png,jpg,jpeg,svg|max:512';
        }

        if ($request->hasFile('custom_font_file')) {
            $rules['custom_font_file'] = [
                'file',
                'max:10240',
                function ($attribute, $value, $fail) {
                    $allowedExtensions = ['ttf', 'woff', 'woff2', 'otf'];
                    $extension = strtolower($value->getClientOriginalExtension());

                    if (!in_array($extension, $allowedExtensions)) {
                        $fail('يجب أن يكون ملف الخط بإحدى الصيغ التالية: ttf, woff, woff2, otf');
                    }
                },
            ];
        }

        $request->validate($rules);

        $admin = auth()->user();
        $uid = $admin ? $admin->uid : 'system';
        $storagePath = "admins/{$uid}/identity";

        // 1. Process Assets (Logo)
        if ($request->hasFile('logo_url')) {
            // Delete old
            $this->imageService->deleteIfExists(Setting::get('logo_url'));
            // Store optimized
            $path = $this->imageService->storeOptimized($request->file('logo_url'), $storagePath);
            Setting::set('logo_url', '/storage/' . $path, 'branding');
        } elseif ($request->input('remove_logo_url') === '1') {
            $this->imageService->deleteIfExists(Setting::get('logo_url'));
            Setting::set('logo_url', null, 'branding');
        }

        // 2. Process Assets (Favicon)
        if ($request->hasFile('favicon_url')) {
            // Delete old
            $this->imageService->deleteIfExists(Setting::get('favicon_url'));
            // Store optimized
            $path = $this->imageService->storeOptimized($request->file('favicon_url'), $storagePath);
            Setting::set('favicon_url', '/storage/' . $path, 'branding');
        } elseif ($request->input('remove_favicon_url') === '1') {
            $this->imageService->deleteIfExists(Setting::get('favicon_url'));
            Setting::set('favicon_url', null, 'branding');
        }

        // 3. Process Assets (Font File)
        if ($request->hasFile('custom_font_file')) {
            $oldFont = Setting::get('custom_font_file');
            if ($oldFont) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldFont));
            }
            $file = $request->file('custom_font_file');
            $extension = $file->getClientOriginalExtension();
            $filename = \Illuminate\Support\Str::random(40) . '.' . $extension;
            $path = $file->storeAs($storagePath . '/fonts', $filename, 'public');
            Setting::set('custom_font_file', '/storage/' . $path, 'branding');
        } elseif ($request->input('remove_custom_font_file') === '1') {
            $oldFont = Setting::get('custom_font_file');
            if ($oldFont) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldFont));
            }
            Setting::set('custom_font_file', null, 'branding');
        }

        // Custom Heading Font
        if ($request->hasFile('custom_heading_font_file')) {
            // Delete old one
            $oldFont = Setting::get('custom_heading_font_file');
            if ($oldFont) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldFont));
            }
            $file = $request->file('custom_heading_font_file');
            $extension = $file->getClientOriginalExtension();
            $filename = \Illuminate\Support\Str::random(40) . '-heading.' . $extension;
            $path = $file->storeAs($storagePath . '/fonts', $filename, 'public');
            Setting::set('custom_heading_font_file', '/storage/' . $path, 'branding');
        } elseif ($request->input('remove_custom_heading_font_file') === '1') {
            $oldFont = Setting::get('custom_heading_font_file');
            if ($oldFont) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldFont));
            }
            Setting::set('custom_heading_font_file', null, 'branding');
        }

        // 4. Process Regular Key-Value Settings - WHITELISTED for security
        $allowedKeys = [
            'app_name',
            'company_name',
            'company_link',
            'primary_color',
            'secondary_color',
            'custom_heading_font_url',
            // Content Protection (Granular)
            'protect_right_click_admin',
            'protect_right_click_app',
            'protect_right_click_landing',
            'protect_selection_admin',
            'protect_selection_app',
            'protect_selection_landing',
            'protect_drag_admin',
            'protect_drag_app',
            'protect_drag_landing',
            'protect_copy_paste_admin',
            'protect_copy_paste_app',
            'protect_copy_paste_landing',
            'protect_devtools_admin',
            'protect_devtools_app',
            'protect_devtools_landing',
        ];

        $data = $request->only($allowedKeys);

        foreach ($data as $key => $value) {
            Setting::set($key, $value, 'branding');
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => Setting::getAllGrouped()
        ]);
    }
}
