<?php

namespace App\Services;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class ImageService
{
    protected $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Consolidate image processing (WebP conversion, Resizing, Compression)
     */
    public function storeOptimized(UploadedFile $file, string $directory, string $disk = 'public'): string
    {
        // Handle SVGs specifically (skip optimization/conversion to preserve vector)
        if ($file->getClientOriginalExtension() === 'svg' || $file->getMimeType() === 'image/svg+xml') {
            $filename = Str::random(40) . '.svg';
            $path = $directory . '/' . $filename;
            Storage::disk($disk)->put($path, file_get_contents($file->getRealPath()));
            return $path;
        }

        $image = $this->manager->read($file);

        // Resize if too large (maintain aspect ratio)
        $image->scaleDown(width: 1200, height: 1200);

        // Encode as WebP with 80% quality
        $encoded = $image->toWebp(80);

        // Generate filename
        $filename = Str::random(40) . '.webp';
        $path = $directory . '/' . $filename;

        // Store in disk
        Storage::disk($disk)->put($path, $encoded->toString());

        return $path;
    }

    /**
     * Delete an old image if it exists
     */
    public function deleteIfExists(?string $url, string $disk = 'public'): void
    {
        if (!$url)
            return;

        $path = str_replace('/storage/', '', $url);
        if (Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
    }
}
