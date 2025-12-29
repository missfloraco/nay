<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Services\TrashService;
use App\Policies\TrashPolicy;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TrashController extends Controller
{
    protected TrashService $trashService;
    protected TrashPolicy $policy;

    public function __construct(TrashService $trashService, TrashPolicy $policy)
    {
        $this->trashService = $trashService;
        $this->policy = $policy;
    }

    /**
     * Get all trashed items (tenant scope - own items only)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$this->policy->viewAny($user)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $tenantId = $user->id;
            $items = $this->trashService->getTrashedItems('tenant', $tenantId);
            $stats = $this->trashService->getStats('tenant', $tenantId);

            return response()->json([
                'data' => $items,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch trashed items',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a trashed item
     */
    public function restore(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string',
            'id' => 'required|integer',
        ]);

        try {
            $user = $request->user();

            $modelClass = $this->trashService->getTrashableModels()[$request->type] ?? null;
            if (!$modelClass) {
                return response()->json(['error' => 'Invalid type'], 400);
            }

            $item = $modelClass::onlyTrashed()->find($request->id);
            if (!$item) {
                return response()->json(['error' => 'Item not found'], 404);
            }

            // Check if item belongs to tenant
            if (!$this->trashService->canAccessItem($item, 'tenant', $user->id)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            if (!$this->policy->restore($user, $item)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $this->trashService->restoreItem($request->type, $request->id);

            return response()->json([
                'message' => 'Item restored successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to restore item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete a trashed item
     */
    public function forceDelete(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string',
            'id' => 'required|integer',
        ]);

        try {
            $user = $request->user();

            $modelClass = $this->trashService->getTrashableModels()[$request->type] ?? null;
            if (!$modelClass) {
                return response()->json(['error' => 'Invalid type'], 400);
            }

            $item = $modelClass::onlyTrashed()->find($request->id);
            if (!$item) {
                return response()->json(['error' => 'Item not found'], 404);
            }

            // Check if item belongs to tenant
            if (!$this->trashService->canAccessItem($item, 'tenant', $user->id)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            if (!$this->policy->forceDelete($user, $item)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $this->trashService->forceDeleteItem($request->type, $request->id);

            return response()->json([
                'message' => 'Item permanently deleted'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk restore items
     */
    public function bulkRestore(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.type' => 'required|string',
            'items.*.id' => 'required|integer',
        ]);

        try {
            $user = $request->user();

            if (!$this->policy->bulkActions($user)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Verify all items belong to tenant
            foreach ($request->items as $itemData) {
                $modelClass = $this->trashService->getTrashableModels()[$itemData['type']] ?? null;
                if ($modelClass) {
                    $item = $modelClass::onlyTrashed()->find($itemData['id']);
                    if ($item && !$this->trashService->canAccessItem($item, 'tenant', $user->id)) {
                        return response()->json(['error' => 'Unauthorized access to some items'], 403);
                    }
                }
            }

            $result = $this->trashService->bulkRestore($request->items);

            return response()->json([
                'message' => "Restored {$result['success']} items",
                'success' => $result['success'],
                'failed' => $result['failed'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to bulk restore',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk force delete items
     */
    public function bulkForceDelete(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.type' => 'required|string',
            'items.*.id' => 'required|integer',
        ]);

        try {
            $user = $request->user();

            if (!$this->policy->bulkActions($user)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Verify all items belong to tenant
            foreach ($request->items as $itemData) {
                $modelClass = $this->trashService->getTrashableModels()[$itemData['type']] ?? null;
                if ($modelClass) {
                    $item = $modelClass::onlyTrashed()->find($itemData['id']);
                    if ($item && !$this->trashService->canAccessItem($item, 'tenant', $user->id)) {
                        return response()->json(['error' => 'Unauthorized access to some items'], 403);
                    }
                }
            }

            $result = $this->trashService->bulkForceDelete($request->items);

            return response()->json([
                'message' => "Permanently deleted {$result['success']} items",
                'success' => $result['success'],
                'failed' => $result['failed'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to bulk delete',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Empty trash (delete all trashed items for this tenant)
     */
    public function emptyTrash(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$this->policy->emptyTrash($user)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $count = $this->trashService->emptyTrash('tenant', $user->id);

            return response()->json([
                'message' => "Permanently deleted {$count} items",
                'count' => $count,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to empty trash',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
