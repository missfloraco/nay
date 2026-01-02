<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Script;
use Illuminate\Support\Facades\Validator;

class ScriptController extends Controller
{
    public function index(Request $request)
    {
        $query = Script::latest();

        if ($request->has('trashed')) {
            $query->onlyTrashed();
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        // Handle mapping 'head' to 'header' if sent by frontend
        if ($request->location === 'head') {
            $request->merge(['location' => 'header']);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'location' => 'required|string',
            'loadingStrategy' => 'nullable|string',
            'content' => 'required|string',
            'isActive' => 'boolean',
            'environment' => 'nullable|string',
            'trigger' => 'nullable|string',
            'pages' => 'nullable',
            'deviceAttributes' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'بيانات غير صالحة', 'errors' => $validator->errors()], 422);
        }

        $script = Script::create($request->all());

        return response()->json($script, 201);
    }

    public function show($id)
    {
        $script = Script::findOrFail($id);
        return response()->json($script);
    }

    public function update(Request $request, $id)
    {
        $script = Script::findOrFail($id);

        // Handle mapping 'head' to 'header' if sent by frontend
        if ($request->location === 'head') {
            $request->merge(['location' => 'header']);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string',
            'location' => 'sometimes|string',
            'loadingStrategy' => 'nullable|string',
            'content' => 'sometimes|string',
            'isActive' => 'boolean',
            'environment' => 'sometimes|string',
            'trigger' => 'sometimes|string',
            'pages' => 'nullable',
            'deviceAttributes' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'بيانات غير صالحة', 'errors' => $validator->errors()], 422);
        }

        $script->update($request->all());

        return response()->json($script);
    }

    public function destroy($id)
    {
        $script = Script::withTrashed()->findOrFail($id);

        if ($script->trashed()) {
            $script->forceDelete();
            return response()->json(['message' => 'تم حذف السكربت نهائياً']);
        }

        $script->delete();
        return response()->json(['message' => 'تم نقل السكربت إلى سلة المحذوفات']);
    }

    /**
     * Restore a soft-deleted script.
     */
    public function restore($id)
    {
        $script = Script::onlyTrashed()->findOrFail($id);
        $script->restore();

        return response()->json(['message' => 'تم استعادة السكربت بنجاح', 'script' => $script]);
    }

    public function toggleStatus($id)
    {
        $script = Script::findOrFail($id);
        $script->isActive = !$script->isActive;
        $script->save();

        return response()->json($script);
    }
}
