<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    protected $imageService;

    public function __construct(\App\Services\ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('admins')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'avatar' => 'nullable|image|max:2048',
            'remove_avatar' => 'nullable|boolean'
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        if ($request->boolean('remove_avatar')) {
            $this->imageService->deleteIfExists($user->avatar_url);
            $user->avatar_url = null;
        } elseif ($request->hasFile('avatar')) {
            $this->imageService->deleteIfExists($user->avatar_url);
            $path = $this->imageService->storeOptimized($request->file('avatar'), 'avatars');
            $user->avatar_url = '/storage/' . $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}
