<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index()
    {
        return response()->json(['plans' => Plan::all()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:plans,slug',
            'monthly_price' => 'required|numeric|min:0',
            'yearly_price' => 'required|numeric|min:0',
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
            'monthly_price' => 'sometimes|required|numeric|min:0',
            'yearly_price' => 'sometimes|required|numeric|min:0',
            'currency' => 'sometimes|required|string|size:3',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $plan->update($validated);

        return response()->json(['plan' => $plan, 'message' => 'تم تحديث الخطة بنجاح']);
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();
        return response()->json(['message' => 'تم حذف الخطة بنجاح']);
    }
}
