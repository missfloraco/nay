<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index(Request $request)
    {
        $query = Plan::query();

        if ($request->has('trashed')) {
            $query->onlyTrashed();
        }

        return response()->json(['plans' => $query->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:plans,slug',
            'billing_type' => 'required|string|in:recurring,lifetime,fixed_term',
            'monthly_price' => 'nullable|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'lifetime_price' => 'nullable|numeric|min:0',
            'offer_lifetime_price' => 'nullable|numeric|min:0',
            'fixed_term_price' => 'nullable|numeric|min:0',
            'offer_fixed_term_price' => 'nullable|numeric|min:0',
            'fixed_term_duration' => 'nullable|integer|min:1',
            'fixed_term_unit' => 'nullable|string|in:months,years',
            'offer_monthly_price' => 'nullable|numeric|min:0',
            'offer_yearly_price' => 'nullable|numeric|min:0',
            'offer_start' => 'nullable|date',
            'offer_end' => 'nullable|date|after:offer_start',
            'currency' => 'required|string|size:3',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $plan = Plan::create($validated);

        return response()->json(['plan' => $plan, 'message' => 'تم إنشاء الخطة بنجاح'], 201);
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:plans,slug,' . $plan->id,
            'billing_type' => 'sometimes|required|string|in:recurring,lifetime,fixed_term',
            'monthly_price' => 'nullable|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'lifetime_price' => 'nullable|numeric|min:0',
            'offer_lifetime_price' => 'nullable|numeric|min:0',
            'fixed_term_price' => 'nullable|numeric|min:0',
            'offer_fixed_term_price' => 'nullable|numeric|min:0',
            'fixed_term_duration' => 'nullable|integer|min:1',
            'fixed_term_unit' => 'nullable|string|in:months,years',
            'offer_monthly_price' => 'nullable|numeric|min:0',
            'offer_yearly_price' => 'nullable|numeric|min:0',
            'offer_start' => 'nullable|date',
            'offer_end' => 'nullable|date|after:offer_start',
            'currency' => 'sometimes|required|string|size:3',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $plan->update($validated);

        return response()->json(['plan' => $plan, 'message' => 'تم تحديث الخطة بنجاح']);
    }

    public function destroy($id)
    {
        $plan = Plan::withTrashed()->findOrFail($id);

        if ($plan->trashed()) {
            $plan->forceDelete();
            return response()->json(['message' => 'تم حذف الخطة نهائياً']);
        }

        $plan->delete();
        return response()->json(['message' => 'تم نقل الخطة إلى سلة المحذوفات']);
    }

    /**
     * Restore a soft-deleted plan.
     */
    public function restore($id)
    {
        $plan = Plan::onlyTrashed()->findOrFail($id);
        $plan->restore();

        return response()->json(['message' => 'تم استعادة الخطة بنجاح', 'plan' => $plan]);
    }
}
