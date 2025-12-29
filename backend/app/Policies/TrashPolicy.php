<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Model;

class TrashPolicy
{
    /**
     * Determine if the user can view any trashed items
     */
    public function viewAny($user): bool
    {
        // Both admin and tenant can view trash
        return $user instanceof Admin || $user instanceof Tenant;
    }

    /**
     * Determine if the user can restore a trashed item
     */
    public function restore($user, Model $item): bool
    {
        // Admin can restore anything
        if ($user instanceof Admin) {
            return true;
        }

        // Tenant can only restore own items
        if ($user instanceof Tenant) {
            return $this->belongsToTenant($item, $user->id);
        }

        return false;
    }

    /**
     * Determine if the user can force delete a trashed item
     */
    public function forceDelete($user, Model $item): bool
    {
        // Admin can force delete anything
        if ($user instanceof Admin) {
            return true;
        }

        // Tenant can only force delete own items
        if ($user instanceof Tenant) {
            return $this->belongsToTenant($item, $user->id);
        }

        return false;
    }

    /**
     * Determine if the user can empty trash
     */
    public function emptyTrash($user): bool
    {
        // Both admin and tenant can empty their own trash
        return $user instanceof Admin || $user instanceof Tenant;
    }

    /**
     * Determine if the user can perform bulk actions
     */
    public function bulkActions($user): bool
    {
        // Both admin and tenant can perform bulk actions on their own items
        return $user instanceof Admin || $user instanceof Tenant;
    }

    /**
     * Check if item belongs to tenant
     */
    private function belongsToTenant(Model $item, int $tenantId): bool
    {
        // If it's the tenant's own record
        if ($item instanceof Tenant) {
            return $item->id === $tenantId;
        }

        // If item has tenant_id
        if (isset($item->tenant_id)) {
            return $item->tenant_id === $tenantId;
        }

        return false;
    }
}
