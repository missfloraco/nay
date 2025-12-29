<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait HasUid
{
    /**
     * Boot the trait.
     */
    protected static function bootHasUid()
    {
        static::creating(function (Model $model) {
            if (empty($model->uid)) {
                $model->uid = self::generateUid($model);
            }
        });
    }

    /**
     * Generate the UID.
     */
    protected static function generateUid(Model $model): string
    {
        $prefix = defined('static::UID_PREFIX') ? static::UID_PREFIX : 'GEN';
        $prefix = Str::upper(Str::limit($prefix, 3, ''));

        // Get the last record to determine the next sequence
        // Check if model uses SoftDeletes trait before calling withTrashed()
        $query = static::query();
        
        if (method_exists(static::class, 'withTrashed')) {
            $query = static::withTrashed();
        }
        
        $lastRecord = $query->latest('id')->first();

        $nextId = $lastRecord ? ($lastRecord->id + 1) : 1;

        // Ensure 6 digits
        $sequence = str_pad((string) $nextId, 6, '0', STR_PAD_LEFT);

        return "{$prefix}-{$sequence}";
    }
}
