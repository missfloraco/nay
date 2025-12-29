<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Ad;
use Illuminate\Http\Request;

class BrandingController extends Controller
{
    /**
     * Get system-wide branding and dynamic ads.
     */
    public function index()
    {
        $ads = Ad::active()->get()->groupBy('placement')->map(function ($items) {
            $ad = $items->first();
            if ($ad->type === 'image') {
                $trackingUrl = url('/api/public/ads/' . $ad->id . '/click');
                return '<a href="' . $trackingUrl . '" target="_blank" class="block w-full h-full ad-tracked" data-ad-id="' . $ad->id . '"><img src="' . $ad->content . '" class="w-full h-full object-cover mx-auto" alt="' . $ad->name . '"></a>';
            }
            return '<div class="ad-tracked w-full h-full" data-ad-id="' . $ad->id . '">' . $ad->content . '</div>';
        })->toArray();

        $placements = ['ad_landing_top', 'ad_landing_footer', 'ad_footer_leaderboard', 'ad_sidebar_square'];
        $bundled = $ads;
        foreach ($placements as $p) {
            if (!isset($bundled[$p]) || empty($bundled[$p])) {
                $bundled[$p] = Setting::get($p);
            }
        }

        return response()->json(array_merge([
            'app_name' => Setting::get('app_name', env('APP_NAME', 'NaySaaS')),
            'primary_color' => Setting::get('primary_color', '#2a8cff'),
            'secondary_color' => Setting::get('secondary_color', '#ffc108'),
            'accent_color1' => Setting::get('accent_color1', '#02aa94'),
            'accent_color2' => Setting::get('accent_color2', '#fb005e'),
            'logo_url' => Setting::get('logo_url'),
            'favicon_url' => Setting::get('favicon_url'),
            'font_family' => Setting::get('font_family', 'Default'),
            'custom_font_file' => Setting::get('custom_font_file'),
            'custom_heading_font_file' => Setting::get('custom_heading_font_file'),
            'custom_font_url' => Setting::get('custom_font_url'),
            'custom_heading_font_url' => Setting::get('custom_heading_font_url'),
            'company_name' => Setting::get('company_name', 'MissFlora'),
            'company_link' => Setting::get('company_link'),
            'translations' => [
                'login_title' => 'مرحباً بعودتك',
                'login_subtitle' => 'سجل دخولك للمتابعة',
            ],
            'adblock_enabled' => Ad::where('placement', 'config_adblock')->first()?->is_active ?? false,
        ], $bundled));
    }
}
