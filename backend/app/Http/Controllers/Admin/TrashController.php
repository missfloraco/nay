<?php

namespace App\Http\Controllers\Admin;

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
     * Get all trashed items (admin scope - all items)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$this->policy->viewAny($user)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $items = $this->trashService->getTrashedItems('admin');
            $stats = $this->trashService->getStats('admin');

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

            // Get the item to check authorization
            $modelClass = $this->trashService->getTrashableModels()[$request->type] ?? null;
            if (!$modelClass) {
                return response()->json(['error' => 'Invalid type'], 400);
            }

            $item = $modelClass::onlyTrashed()->find($request->id);
            if (!$item) {
                return response()->json(['error' => 'Item not found'], 404);
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
     * Empty trash (delete all trashed items)
     */
    public function emptyTrash(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$this->policy->emptyTrash($user)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $count = $this->trashService->emptyTrash('admin');

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
