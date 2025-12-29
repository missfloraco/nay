<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SeoSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SeoSettingController extends Controller
{
    /**
     * Get all SEO settings
     */
    public function index()
    {
        $seoSettings = SeoSetting::all();
        return response()->json(['data' => $seoSettings]);
    }

    /**
     * Get SEO settings for a specific page
     */
    public function show($pageKey)
    {
        $seoSetting = SeoSetting::getByPageKey($pageKey);

        if (!$seoSetting) {
            return response()->json([
                'message' => 'SEO settings not found for this page'
            ], 404);
        }

        return response()->json(['data' => $seoSetting]);
    }

    /**
     * Update SEO settings for a specific page
     */
    public function update(Request $request, $pageKey)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'keywords' => 'nullable|string',
            'og_title' => 'nullable|string|max:255',
            'og_description' => 'nullable|string',
            'og_image' => 'nullable|string',
            'og_type' => 'nullable|string|max:50',
            'twitter_card' => 'nullable|string|max:50',
            'twitter_title' => 'nullable|string|max:255',
            'twitter_description' => 'nullable|string',
            'twitter_image' => 'nullable|string',
            'canonical_url' => 'nullable|string',
            'robots' => 'nullable|string|max:100',
            'schema_markup' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $seoSetting = SeoSetting::updateOrCreateForPage($pageKey, $request->all());

        return response()->json([
            'message' => 'SEO settings updated successfully',
            'data' => $seoSetting
        ]);
    }
}
