<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\SubscriptionRequest;
use App\Models\Subscription;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Get all active pricing plans.
     */
    public function plans()
    {
        $plans = Plan::where('is_active', true)->get();
        return response()->json(['plans' => $plans]);
    }

    /**
     * Get the tenant's current subscription status.
     */
    public function current(Request $request)
    {
        $tenant = $request->user();
        $subscription = $tenant->currentSubscription()->with('plan')->first();

        return response()->json([
            'subscription' => $subscription,
            'pending_request' => SubscriptionRequest::where('tenant_id', $tenant->id)
                ->where('status', 'pending')
                ->with('plan')
                ->first()
        ]);
    }

    /**
     * Request a new subscription / upgrade.
     */
    public function requestUpgrade(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        $tenant = $request->user();

        // Prevent duplicate pending requests
        $existing = SubscriptionRequest::where('tenant_id', $tenant->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'لديك طلب اشتراك قيد المراجعة بالفعل.'], 400);
        }

        $subRequest = SubscriptionRequest::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $request->plan_id,
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        // Notify Admins about new subscription request
        $admins = \App\Models\Admin::all();
        $plan = \App\Models\Plan::find($request->plan_id);
        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\SystemNotification([
                'title' => 'طلب اشتراك جديد',
                'message' => 'طلب ' . $tenant->name . ' الترقية إلى باقة: ' . ($plan->name ?? 'غير معروف'),
                'level' => 'warning',
                'action_url' => '/admin/subscription-requests',
                'icon' => 'Zap'
            ]));
        }

        return response()->json([
            'request' => $subRequest,
            'message' => 'تم إرسال طلب الاشتراك بنجاح. سيتم التواصل معك قريباً لتفعيل الحساب.'
        ]);
    }

    /**
     * Get payment history for the tenant.
     */
    public function payments(Request $request)
    {
        $payments = $request->user()->payments()->latest()->get();
        return response()->json(['payments' => $payments]);
    }

    /**
     * Get subscription requests history.
     */
    public function requests(Request $request)
    {
        $requests = SubscriptionRequest::where('tenant_id', $request->user()->id)
            ->with('plan')
            ->latest()
            ->get();
        return response()->json(['requests' => $requests]);
    }
}
