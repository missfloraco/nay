<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use Illuminate\Http\Request;

class AdController extends Controller
{
    protected $imageService;

    public function __construct(\App\Services\ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Ad::where('placement', '!=', 'config_adblock');

        if ($request->has('trashed')) {
            $query->onlyTrashed();
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'placement' => 'required|string|max:100',
            'type' => 'required|in:script,image,html',
            'content' => 'required|string',
            'redirect_url' => 'nullable|url|max:2048',
            'is_active' => 'boolean'
        ]);

        $ad = Ad::create($validated);

        return response()->json(['message' => 'Ad created successfully', 'ad' => $ad], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $ad = Ad::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'placement' => 'sometimes|string|max:100',
            'type' => 'sometimes|in:script,image,html',
            'content' => 'sometimes|string',
            'redirect_url' => 'nullable|url|max:2048',
            'is_active' => 'boolean'
        ]);

        $ad->update($validated);

        return response()->json(['message' => 'Ad updated successfully', 'ad' => $ad]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $ad = Ad::withTrashed()->findOrFail($id);

        if ($ad->trashed()) {
            $ad->forceDelete();
            return response()->json(['message' => 'Ad permanently deleted']);
        }

        $ad->delete();
        return response()->json(['message' => 'Ad moved to trash']);
    }

    /**
     * Restore a soft-deleted ad.
     */
    public function restore($id)
    {
        $ad = Ad::onlyTrashed()->findOrFail($id);
        $ad->restore();

        return response()->json(['message' => 'Ad restored successfully', 'ad' => $ad]);
    }

    /**
     * Fetch active ads for frontend.
     */
    public function getActiveAds()
    {
        $ads = Ad::active()->where('placement', '!=', 'config_adblock')->get()->groupBy('placement');
        return response()->json($ads);
    }

    /**
     * Track an impression.
     */
    public function trackImpression(Request $request, $id)
    {
        $ad = Ad::findOrFail($id);
        $stats = $ad->stats ?? ['impressions' => 0, 'clicks' => 0];
        $stats['impressions']++;
        $ad->stats = $stats;
        $ad->save();

        return response()->json(['success' => true]);
    }

    /**
     * Track a click and redirect.
     */
    public function trackClick($id)
    {
        $ad = Ad::findOrFail($id);
        $stats = $ad->stats ?? ['impressions' => 0, 'clicks' => 0];
        $stats['clicks']++;
        $ad->stats = $stats;
        $ad->save();

        if ($ad->redirect_url) {
            return redirect()->away($ad->redirect_url);
        }

        return response()->json(['message' => 'No redirect URL defined'], 404);
    }

    public function toggleAdBlock(Request $request)
    {
        $enabled = $request->boolean('enabled');
        Ad::updateOrCreate(
            ['placement' => 'config_adblock'],
            [
                'name' => 'AdBlock Settings',
                'type' => 'html',
                'content' => $enabled ? 'true' : 'false',
                'is_active' => $enabled
            ]
        );
        return response()->json(['success' => true]);
    }

    /**
     * Upload an ad image.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $this->imageService->storeOptimized($request->file('image'), 'ads');
            return response()->json([
                'url' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['message' => 'No image uploaded'], 422);
    }
}
