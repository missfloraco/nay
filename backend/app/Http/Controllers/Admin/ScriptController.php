<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Script;
use Illuminate\Support\Facades\Validator;

class ScriptController extends Controller
{
    public function index()
    {
        $scripts = Script::latest()->get();
        return response()->json($scripts);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:script,pixel,meta',
            'location' => 'required|in:header,body,footer',
            'content' => 'required|string',
            'isActive' => 'boolean',
            'environment' => 'required|in:production,development,staging',
            'trigger' => 'required|in:all,specific_pages',
            'pages' => 'nullable|array',
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

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:script,pixel,meta',
            'location' => 'sometimes|in:header,body,footer',
            'content' => 'sometimes|string',
            'isActive' => 'boolean',
            'environment' => 'sometimes|in:production,development,staging',
            'trigger' => 'sometimes|in:all,specific_pages',
            'pages' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'بيانات غير صالحة', 'errors' => $validator->errors()], 422);
        }

        $script->update($request->all());

        return response()->json($script);
    }

    public function destroy($id)
    {
        $script = Script::findOrFail($id);
        $script->delete();
        return response()->json(['message' => 'تم حذف السكربت بنجاح']);
    }

    public function toggleStatus($id)
    {
        $script = Script::findOrFail($id);
        $script->isActive = !$script->isActive;
        $script->save();

        return response()->json($script);
    }
}
