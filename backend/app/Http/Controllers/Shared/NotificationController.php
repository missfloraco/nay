<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->latest()
            ->paginate(20);

        return response()->json([
            'notifications' => $notifications->map(function ($notif) {
                // Laravel's DatabaseNotification has a toArray method that we custom defined in App\Models\Notification
                // But wait, $user->notifications() returns DatabaseNotification model instances.
                // To use our custom Notification model, we can either configure the relationship or manually transform.
                $payload = is_string($notif->data) ? json_decode($notif->data, true) : $notif->data;

                return [
                    'id' => $notif->id,
                    'type' => $notif->type,
                    'title' => $payload['title'] ?? null,
                    'message' => $payload['message'] ?? null,
                    'level' => $payload['level'] ?? 'info', // success, error, info, warning
                    'action_url' => $payload['action_url'] ?? null,
                    'icon' => $payload['icon'] ?? null,
                    'is_read' => !is_null($notif->read_at),
                    'created_at' => $notif->created_at,
                    'created_human' => $notif->created_at->diffForHumans(),
                ];
            }),
            'unread_count' => $user->unreadNotifications()->count(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'total' => $notifications->total(),
            ]
        ]);
    }

    /**
     * Mark the specified notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $notification = $user->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        $user->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $notification = $user->notifications()->findOrFail($id);
        $notification->delete();

        return response()->json(['success' => true]);
    }
}
