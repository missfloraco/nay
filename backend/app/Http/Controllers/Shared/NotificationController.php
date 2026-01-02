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

        // Auto-check for Trial Expiry (Notify 24h before) - moved to a more controlled check
        $this->checkForTrialExpiry($user);

        $notifications = $user->notifications()
            ->latest()
            ->paginate(20);

        return response()->json([
            'notifications' => $notifications->map(function ($notif) {
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

    /**
     * Check for trial expiry and notify user.
     */
    private function checkForTrialExpiry($user)
    {
        if (!($user instanceof \App\Models\Tenant) || $user->status !== 'trial' || !$user->trial_expires_at) {
            return;
        }

        $expiresAt = \Carbon\Carbon::parse($user->trial_expires_at);
        if (!$expiresAt->isFuture() || $expiresAt->diffInHours(now()) > 24) {
            return;
        }

        // Use cache to prevent hammering the DB every few seconds
        $cacheKey = "trial_expiry_notified_{$user->id}";
        if (\Cache::has($cacheKey)) {
            return;
        }

        // Robust check in DB too
        $exists = $user->notifications()
            ->where('type', \App\Notifications\SystemNotification::class)
            ->where('data', 'like', '%ينتهي الاشتراك التجريبي قريباً%')
            ->exists();

        if (!$exists) {
            $user->notify(new \App\Notifications\SystemNotification([
                'title' => 'ينتهي الاشتراك التجريبي قريباً',
                'message' => 'باقي أقل من 24 ساعة على انتهاء الفترة التجريبية. اشترك الآن للمتابعة.',
                'level' => 'warning',
                'action_url' => '/app/plans',
                'icon' => 'Clock'
            ]));
        }

        // Cache for 12 hours
        \Cache::put($cacheKey, true, now()->addHours(12));
    }
}
