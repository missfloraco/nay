<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TenantController extends Controller
{
    /**
     * Display a listing of the tenants with pagination, search, and sorting.
     */
    public function index(Request $request)
    {
        $query = Tenant::applyFilters($request)
            ->applySort($request);

        if ($request->has('trashed')) {
            $query->onlyTrashed();
        }

        $result = $query->paginateData($request);

        return response()->json($result);
    }

    /**
     * Store a newly created tenant in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string'],
            'admin_email' => ['required', 'email', 'unique:tenants,email'],
            'admin_password' => ['required', 'string', 'min:8'],
            'status' => ['nullable', 'string', 'in:active,trial'],
            'trial_expires_at' => ['nullable', 'date'],
            'subscription_ends_at' => ['nullable', 'date'],
            'ads_enabled' => ['nullable', 'boolean'],
        ]);

        $status = $data['status'] ?? 'trial';

        $tenant = Tenant::create([
            'name' => $data['name'],
            'email' => $data['admin_email'],
            'password' => Hash::make($data['admin_password']),
            'status' => $status,
            'trial_expires_at' => $data['trial_expires_at'] ?? ($status === 'trial' ? now()->addDays(7) : null),
            'subscription_started_at' => $status === 'active' ? now() : null,
            'subscription_ends_at' => $data['subscription_ends_at'] ?? ($status === 'active' ? now()->addMonth() : null),
            'ads_enabled' => $data['ads_enabled'] ?? true,
        ]);

        return response()->json([
            'message' => 'Tenant created successfully',
            'data' => $tenant
        ]);
    }

    /**
     * Update the specified tenant in storage.
     */
    public function update(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:tenants,email,' . $tenant->id],
            'whatsapp' => ['nullable', 'string', 'max:255'],
            'country_code' => ['nullable', 'string', 'size:2'],
            'admin_password' => ['nullable', 'string', 'min:8'],
            'avatar' => ['nullable', 'image', 'max:2048'],
            'remove_avatar' => ['nullable', 'boolean'],
            'trial_expires_at' => ['nullable', 'date'],
            'subscription_ends_at' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'in:active,trial,disabled,expired,pending'],
            'ads_enabled' => ['nullable', 'boolean'],
        ]);

        $tenant->name = $data['name'];
        $tenant->email = $data['email'];
        $tenant->whatsapp = $data['whatsapp'] ?? $tenant->whatsapp;
        $tenant->country_code = $data['country_code'] ?? $tenant->country_code;

        if (array_key_exists('trial_expires_at', $data)) {
            $tenant->trial_expires_at = $data['trial_expires_at'];
        }

        if (array_key_exists('subscription_ends_at', $data)) {
            $tenant->subscription_ends_at = $data['subscription_ends_at'];
        }

        if (array_key_exists('status', $data)) {
            $tenant->status = $data['status'];
        }

        if (array_key_exists('ads_enabled', $data)) {
            $tenant->ads_enabled = (bool) $data['ads_enabled'];
        }

        if (!empty($data['admin_password'])) {
            $tenant->password = Hash::make($data['admin_password']);
        }

        // Handle Avatar
        $imageService = app(\App\Services\ImageService::class);
        if ($request->boolean('remove_avatar')) {
            $imageService->deleteIfExists($tenant->avatar_url);
            $tenant->avatar_url = null;
        } elseif ($request->hasFile('avatar')) {
            $imageService->deleteIfExists($tenant->avatar_url);
            $path = $imageService->storeOptimized($request->file('avatar'), "tenants/{$tenant->uid}/avatars");
            $tenant->avatar_url = '/storage/' . $path;
        }

        $tenant->save();

        return response()->json([
            'message' => 'Tenant updated successfully',
            'data' => $tenant
        ]);
    }

    /**
     * Remove the specified tenant from storage.
     */
    public function destroy($id)
    {
        $tenant = Tenant::withTrashed()->findOrFail($id);

        if ($tenant->trashed()) {
            $tenant->forceDelete();
            return response()->json(['message' => 'Tenant permanently deleted']);
        }

        $tenant->delete();
        return response()->json(['message' => 'Tenant moved to trash']);
    }

    /**
     * Restore a soft-deleted tenant.
     */
    public function restore($id)
    {
        $tenant = Tenant::onlyTrashed()->findOrFail($id);
        $tenant->restore();

        return response()->json(['message' => 'Tenant restored successfully', 'data' => $tenant]);
    }

    /**
     * Handle specialized actions on tenants.
     */
    public function handleAction(Request $request, $id, $action)
    {
        $tenant = Tenant::findOrFail($id);

        if ($action === 'activate') {
            $tenant->status = 'active';
            $tenant->trial_expires_at = null;
            if (!$tenant->subscription_started_at) {
                $tenant->subscription_started_at = now();
            }
            if (!$tenant->subscription_ends_at) {
                $tenant->subscription_ends_at = now()->addMonth();
            }
        } elseif ($action === 'disable') {
            $tenant->status = 'disabled';
        } elseif ($action === 'enable') {
            $tenant->status = 'active';
            $tenant->trial_expires_at = null;
            if (!$tenant->subscription_started_at) {
                $tenant->subscription_started_at = now();
            }
            if (!$tenant->subscription_ends_at) {
                $tenant->subscription_ends_at = now()->addMonth();
            }
        } elseif ($action === 'impersonate') {
            // Generate short-lived token for impersonation
            $token = $tenant->createToken('impersonation_token')->plainTextToken;
            return response()->json(['token' => $token]);
        } else {
            return response()->json(['message' => 'Invalid action'], 400);
        }

        $tenant->save();
        return response()->json([
            'message' => "Tenant action {$action} successful",
            'data' => $tenant
        ]);
    }
}
