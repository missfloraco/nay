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

            // Create or update subscription
            Subscription::updateOrCreate(
                ['tenant_id' => $tenant->id],
                [
                    'plan_id' => $plan->id,
                    'status' => 'active',
                    'started_at' => now(),
                    'ends_at' => $plan->billing_cycle === 'monthly' ? now()->addMonth() : now()->addYear(),
                    'payment_method' => 'manual',
                    'payment_reference' => $request->payment_reference
                ]
            );

            // Update tenant status if needed
            $tenant->update(['status' => 'active']);

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
        return response()->json(['message' => 'تم رفض الطلب']);
    }
}
