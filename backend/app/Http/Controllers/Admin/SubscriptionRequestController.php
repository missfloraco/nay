<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionRequest;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubscriptionRequestController extends Controller
{
    public function index()
    {
        $requests = SubscriptionRequest::with(['tenant', 'plan'])
            ->latest()
            ->get();
        return response()->json(['requests' => $requests]);
    }

    public function approve(Request $request, SubscriptionRequest $subRequest)
    {
        DB::beginTransaction();
        try {
            $subRequest->update([
                'status' => 'approved',
                'admin_notes' => $request->admin_notes
            ]);

            $tenant = $subRequest->tenant;
            $plan = $subRequest->plan;

            $endsAt = null;
            if ($subRequest->billing_cycle === 'monthly') {
                $endsAt = now()->addMonth();
            } else if ($subRequest->billing_cycle === 'yearly') {
                $endsAt = now()->addYear();
            } else if ($subRequest->billing_cycle === 'fixed_term') {
                $duration = $plan->fixed_term_duration ?: 1;
                $unit = $plan->fixed_term_unit === 'years' ? 'addYears' : 'addMonths';
                $endsAt = now()->$unit($duration);
            } else if ($subRequest->billing_cycle === 'lifetime') {
                $endsAt = null; // Lifetime means no expiration
            }

            // Create or update subscription
            Subscription::updateOrCreate(
                ['tenant_id' => $tenant->id],
                [
                    'plan_id' => $plan->id,
                    'status' => 'active',
                    'started_at' => now(),
                    'ends_at' => $endsAt,
                    'trial_ends_at' => null, // Clear trial period
                    'payment_method' => 'manual',
                    'payment_reference' => $request->payment_reference
                ]
            );

            // Update tenant status and dates - clear trial period
            $tenant->update([
                'status' => 'active',
                'subscription_started_at' => now(),
                'subscription_ends_at' => $endsAt,
                'trial_expires_at' => null // Clear trial expiration
            ]);

            // Notify Tenant about approval
            $tenant->notify(new \App\Notifications\SystemNotification([
                'title' => 'تم تفعيل اشتراكك',
                'message' => 'تهانينا! تم الموافقة على طلب اشتراكك في باقة ' . ($plan->name ?? '') . ' بنجاح.',
                'level' => 'success',
                'action_url' => '/app/settings',
                'icon' => 'CheckCircle'
            ]));

            DB::commit();
            return response()->json(['message' => 'تم الموافقة على الاشتراك بنجاح']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'حدث خطأ أثناء الموافقة'], 500);
        }
    }

    public function reject(Request $request, SubscriptionRequest $subRequest)
    {
        $subRequest->update([
            'status' => 'rejected',
            'admin_notes' => $request->admin_notes
        ]);

        // Notify Tenant about rejection
        $tenant = $subRequest->tenant;
        $tenant->notify(new \App\Notifications\SystemNotification([
            'title' => 'تم رفض طلب الاشتراك',
            'message' => 'نعتذر، لقد تم رفض طلب اشتراكك. السبب: ' . ($request->admin_notes ?? 'غير محدد'),
            'level' => 'error',
            'action_url' => '/app/plans',
            'icon' => 'XCircle'
        ]));

        return response()->json(['message' => 'تم رفض الطلب']);
    }
}
