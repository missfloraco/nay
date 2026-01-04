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

        // 1. Logic-driven notifications (Trial, etc.) - Only for Tenants
        if ($user instanceof \App\Models\Tenant) {
            $this->checkForTrialExpiry($user);
        }

        $notifications = $user->notifications()
            ->latest()
            ->paginate(20);

        // Granular counts for sidebar badges
        $unreadCounts = [
            'total' => $user->unreadNotifications()->count(),
            'support' => $user->unreadNotifications()
                ->where(fn($q) => $q->whereJsonContains('data->notification_type', 'new_support_ticket')
                    ->orWhereJsonContains('data->notification_type', 'ticket_reply')
                    ->orWhereJsonContains('data->notification_type', 'ticket_resolved'))
                ->count(),
            'billing' => $user->unreadNotifications()
                ->where(fn($q) => $q->whereJsonContains('data->notification_type', 'payment_extension')
                    ->orWhereJsonContains('data->notification_type', 'subscription_approved')
                    ->orWhereJsonContains('data->notification_type', 'subscription_rejected')
                    ->orWhereJsonContains('data->notification_type', 'new_subscription_request')
                    ->orWhereJsonContains('data->notification_type', 'trial_expiry'))
                ->count(),
            'tenants' => $user->unreadNotifications()
                ->where(fn($q) => $q->whereJsonContains('data->notification_type', 'new_registration')
                    ->orWhereJsonContains('data->notification_type', 'account_activated')
                    ->orWhereJsonContains('data->notification_type', 'account_disabled'))
                ->count(),
        ];

        return response()->json([
            'notifications' => $notifications->items(),
            'unread_count' => $unreadCounts['total'],
            'unread_counts' => $unreadCounts,
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
        $user->unreadNotifications()->update(['read_at' => now()]);

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
     * Remove all notifications from storage.
     */
    public function deleteAll(Request $request)
    {
        $user = $request->user();
        $user->notifications()->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Check for trial expiry and notify user.
     */
    private function checkForTrialExpiry($user)
    {
        if ($user->status !== 'trial' || !$user->trial_expires_at) {
            return;
        }

        $expiresAt = \Carbon\Carbon::parse($user->trial_expires_at);
        if (!$expiresAt->isFuture() || $expiresAt->diffInHours(now()) > 24) {
            return;
        }

        // Use cache for high-frequency preventions
        $cacheKey = "trial_expiry_notified_{$user->id}";
        if (\Cache::has($cacheKey)) {
            return;
        }

        // Robust DB check using metadata instead of fragile text matching
        $exists = $user->notifications()
            ->whereJsonContains('data->notification_type', 'trial_expiry')
            ->exists();

        if (!$exists) {
            $user->notify(new \App\Notifications\SystemNotification([
                'notification_type' => 'trial_expiry',
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
