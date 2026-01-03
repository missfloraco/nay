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
        $settingKey = null;
        if ($model instanceof \App\Models\Admin)
            $settingKey = 'prefix_admin';
        if ($model instanceof \App\Models\Tenant)
            $settingKey = 'prefix_tenant';
        if ($model instanceof \App\Models\SupportTicket)
            $settingKey = 'prefix_ticket';

        $prefix = null;
        if ($settingKey) {
            $prefix = \App\Models\Setting::get($settingKey);
        }

        if (!$prefix) {
            $prefix = defined('static::UID_PREFIX') ? static::UID_PREFIX : 'GEN';
        }

        $prefix = Str::upper(Str::limit($prefix, 3, ''));

        // Generate random 6-digit number to minimize race conditions
        do {
            // Generate 6 random digits
            $sequence = str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT);
            $uid = "{$prefix}-{$sequence}";

            // Check if this specific UID already exists
            $existsQuery = static::query();
            if (method_exists(static::class, 'withTrashed')) {
                $existsQuery = static::withTrashed();
            }
            $exists = $existsQuery->where('uid', $uid)->exists();

        } while ($exists);

        return $uid;
    }
}
