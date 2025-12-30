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

        // Start with a base guess based on latest ID to maintain rough sequentiality
        $query = static::query();

        if (method_exists(static::class, 'withTrashed')) {
            $query = static::withTrashed();
        }

        $lastRecord = $query->latest('id')->first();
        $nextNumber = $lastRecord ? ($lastRecord->id + 1) : 1;

        do {
            $sequence = str_pad((string) $nextNumber, 6, '0', STR_PAD_LEFT);
            $uid = "{$prefix}-{$sequence}";

            // Check if this specific UID already exists
            // We use a fresh query clone for the check
            $existsQuery = static::query();
            if (method_exists(static::class, 'withTrashed')) {
                $existsQuery = static::withTrashed();
            }
            $exists = $existsQuery->where('uid', $uid)->exists();

            if ($exists) {
                $nextNumber++;
            }
        } while ($exists);

        return $uid;
    }
}
