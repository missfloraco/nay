<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\SupportTicket;
use App\Models\Tenant;

class TrashService
{
    /**
     * Get all trashable models (models using SoftDeletes)
     */
    public function getTrashableModels(): array
    {
        return [
            'tenants' => Tenant::class,
            'support_tickets' => SupportTicket::class,
            // Add more models as needed
        ];
    }

    /**
     * Get trashed items based on role and scope
     * 
     * @param string $role 'admin' or 'tenant'
     * @param int|null $tenantId For tenant scope
     * @return array
     */
    public function getTrashedItems(string $role, ?int $tenantId = null): array
    {
        $items = [];
        $models = $this->getTrashableModels();

        foreach ($models as $type => $modelClass) {
            $query = $modelClass::onlyTrashed();

            // Apply tenant scope for tenant users
            if ($role === 'tenant' && $tenantId) {
                // For Tenant model itself
                if ($type === 'tenants') {
                    $query->where('id', $tenantId);
                }
                // For models belonging to tenant
                elseif (method_exists($modelClass, 'tenant')) {
                    $query->where('tenant_id', $tenantId);
                }
            }

            $trashedRecords = $query->get();

            foreach ($trashedRecords as $record) {
                $items[] = [
                    'id' => $record->id,
                    'type' => $type,
                    'display_name' => $this->getDisplayName($record, $type),
                    'deleted_at' => $record->deleted_at->toISOString(),
                    'deleted_by' => $this->getDeletedBy($record),
                ];
            }
        }

        // Sort by deleted_at descending
        usort($items, function ($a, $b) {
            return strtotime($b['deleted_at']) - strtotime($a['deleted_at']);
        });

        return $items;
    }

    /**
     * Get display name for a trashed item
     */
    private function getDisplayName(Model $model, string $type): string
    {
        // Try common name fields
        if (isset($model->name)) {
            return $model->name;
        }
        if (isset($model->title)) {
            return $model->title;
        }
        if (isset($model->subject)) {
            return $model->subject;
        }
        if (isset($model->email)) {
            return $model->email;
        }

        // Fallback
        return ucfirst($type) . ' #' . $model->id;
    }

    /**
     * Get who deleted the item (if tracked)
     */
    private function getDeletedBy(Model $model): ?array
    {
        if (isset($model->deleted_by_type) && isset($model->deleted_by_id)) {
            return [
                'id' => $model->deleted_by_id,
                'type' => $model->deleted_by_type,
            ];
        }

        return null;
    }

    /**
     * Restore a trashed item
     * 
     * @param string $type Model type
     * @param int $id Model ID
     * @return bool
     */
    public function restoreItem(string $type, int $id): bool
    {
        $modelClass = $this->getModelClass($type);

        if (!$modelClass) {
            throw new \Exception("Invalid model type: {$type}");
        }

        $item = $modelClass::onlyTrashed()->find($id);

        if (!$item) {
            throw new \Exception("Item not found");
        }

        return $item->restore();
    }

    /**
     * Permanently delete a trashed item
     * 
     * @param string $type Model type
     * @param int $id Model ID
     * @return bool
     */
    public function forceDeleteItem(string $type, int $id): bool
    {
        $modelClass = $this->getModelClass($type);

        if (!$modelClass) {
            throw new \Exception("Invalid model type: {$type}");
        }

        $item = $modelClass::onlyTrashed()->find($id);

        if (!$item) {
            throw new \Exception("Item not found");
        }

        return $item->forceDelete();
    }

    /**
     * Bulk restore items
     * 
     * @param array $items Array of ['type' => string, 'id' => int]
     * @return array ['success' => int, 'failed' => int]
     */
    public function bulkRestore(array $items): array
    {
        $success = 0;
        $failed = 0;

        foreach ($items as $item) {
            try {
                $this->restoreItem($item['type'], $item['id']);
                $success++;
            } catch (\Exception $e) {
                $failed++;
            }
        }

        return ['success' => $success, 'failed' => $failed];
    }

    /**
     * Bulk force delete items
     * 
     * @param array $items Array of ['type' => string, 'id' => int]
     * @return array ['success' => int, 'failed' => int]
     */
    public function bulkForceDelete(array $items): array
    {
        $success = 0;
        $failed = 0;

        foreach ($items as $item) {
            try {
                $this->forceDeleteItem($item['type'], $item['id']);
                $success++;
            } catch (\Exception $e) {
                $failed++;
            }
        }

        return ['success' => $success, 'failed' => $failed];
    }

    /**
     * Empty trash (delete all trashed items)
     * 
     * @param string $role 'admin' or 'tenant'
     * @param int|null $tenantId For tenant scope
     * @return int Number of items deleted
     */
    public function emptyTrash(string $role, ?int $tenantId = null): int
    {
        $count = 0;
        $models = $this->getTrashableModels();

        foreach ($models as $type => $modelClass) {
            $query = $modelClass::onlyTrashed();

            // Apply tenant scope
            if ($role === 'tenant' && $tenantId) {
                if ($type === 'tenants') {
                    $query->where('id', $tenantId);
                } elseif (method_exists($modelClass, 'tenant')) {
                    $query->where('tenant_id', $tenantId);
                }
            }

            $count += $query->forceDelete();
        }

        return $count;
    }

    /**
     * Get trash statistics
     * 
     * @param string $role 'admin' or 'tenant'
     * @param int|null $tenantId For tenant scope
     * @return array
     */
    public function getStats(string $role, ?int $tenantId = null): array
    {
        $items = $this->getTrashedItems($role, $tenantId);

        $byType = [];
        foreach ($items as $item) {
            $type = $item['type'];
            $byType[$type] = ($byType[$type] ?? 0) + 1;
        }

        return [
            'total' => count($items),
            'byType' => $byType,
        ];
    }

    /**
     * Get model class from type string
     */
    private function getModelClass(string $type): ?string
    {
        $models = $this->getTrashableModels();
        return $models[$type] ?? null;
    }

    /**
     * Check if user can access trashed item
     * 
     * @param Model $item The trashed item
     * @param string $role User role
     * @param int|null $tenantId Tenant ID for tenant users
     * @return bool
     */
    public function canAccessItem(Model $item, string $role, ?int $tenantId = null): bool
    {
        // Admin can access everything
        if ($role === 'admin') {
            return true;
        }

        // Tenant can only access own items
        if ($role === 'tenant' && $tenantId) {
            // Check if it's the tenant's own record
            if ($item instanceof Tenant) {
                return $item->id === $tenantId;
            }

            // Check if item belongs to tenant
            if (isset($item->tenant_id)) {
                return $item->tenant_id === $tenantId;
            }
        }

        return false;
    }
}
