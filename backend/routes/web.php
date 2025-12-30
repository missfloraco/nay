<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// الاحترافية: رابط تهيئة التخزين عند الرفع لأول مرة
Route::get('/init-storage', function () {
    try {
        Artisan::call('storage:link');
        return response()->json(['message' => 'تم إنشاء رابط التخزين بنجاح (Storage Link Created)']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});
