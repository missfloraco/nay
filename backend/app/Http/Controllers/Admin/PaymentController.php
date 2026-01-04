<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PaymentController extends Controller
{
    /**
     * Get all payments with pagination, search, and sorting.
     */
    public function index(Request $request)
    {
        $query = Payment::with('tenant:id,name,email');

        if ($request->has('trashed')) {
            $query->onlyTrashed();
        }

        $result = $query->applyFilters($request)
            ->applySort($request)
            ->paginateData($request);

        return response()->json($result);
    }

    /**
     * Store a newly created payment and extend subscription.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'amount' => 'nullable|numeric|min:0',
            'subscription_end_date' => 'required|date|after:today',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $tenant = Tenant::findOrFail($validated['tenant_id']);

        // 1. Create Payment Record
        $payment = Payment::create([
            'tenant_id' => $tenant->id,
            'amount' => $validated['amount'], // Nullable - allows free extensions
            'currency' => 'ILS',
            'status' => 'completed',
            'payment_method' => $validated['payment_method'],
            'paid_at' => now(),
            'transaction_id' => 'MAN-' . strtoupper(uniqid()),
            'notes' => $validated['notes'] ?? null,
        ]);

        // 2. Update Tenant Subscription
        $newEnd = Carbon::parse($validated['subscription_end_date']);

        $tenant->subscription_ends_at = $newEnd;
        $tenant->status = 'active'; // Reactivate
        $tenant->save();

        // Notify Tenant about status/extension
        $tenant->notify(new \App\Notifications\SystemNotification([
            'notification_type' => 'payment_extension',
            'payment_id' => $payment->id,
            'title' => 'تحديث الاشتراك',
            'message' => 'تم تسجيل دفعة جديدة وتمديد اشتراكك بنجاح حتى تاريخ: ' . $newEnd->format('Y-m-d'),
            'level' => 'success',
            'action_url' => '/app/billing?tab=payments',
            'icon' => 'CheckCircle'
        ]));

        return response()->json([
            'message' => 'Payment recorded and subscription extended successfully.',
            'data' => [
                'payment' => $payment,
                'tenant' => $tenant,
                'new_subscription_end' => $newEnd->toIso8601String()
            ]
        ]);
    }

    /**
     * Get payments for a specific tenant.
     */
    public function getTenantPayments(Tenant $tenant)
    {
        $payments = $tenant->payments()->latest()->get();
        return response()->json(['data' => $payments]);
    }

    /**
     * Update an existing payment.
     */
    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'paid_at' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $payment->update([
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'paid_at' => $validated['paid_at'],
            'notes' => $validated['notes'],
        ]);

        return response()->json(['message' => 'Payment updated successfully.', 'data' => $payment]);
    }

    /**
     * Delete a payment.
     */
    public function destroy($id)
    {
        $payment = Payment::withTrashed()->findOrFail($id);

        if ($payment->trashed()) {
            // Clean up related notifications before permanent deletion
            \Illuminate\Support\Facades\DB::table('notifications')
                ->whereJsonContains('data->payment_id', $payment->id)
                ->delete();
            $payment->forceDelete();
            return response()->json(['message' => 'Payment permanently deleted']);
        }

        $payment->delete();
        return response()->json(['message' => 'Payment moved to trash']);
    }

    /**
     * Restore a soft-deleted payment.
     */
    public function restore($id)
    {
        $payment = Payment::onlyTrashed()->findOrFail($id);
        $payment->restore();

        return response()->json(['message' => 'Payment restored successfully', 'data' => $payment]);
    }
}
