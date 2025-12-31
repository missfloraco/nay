<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUid;

class Ad extends Model
{
    use SoftDeletes, HasUid;

    const UID_PREFIX = 'ADV';

    protected $fillable = [
        'uid',
        'name',
        'placement',
        'type',
        'content',
        'redirect_url',
        'is_active',
        'stats'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'stats' => 'array'
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($ad) {
            if (!$ad->stats) {
                $ad->stats = ['impressions' => 0, 'clicks' => 0];
            }
        });
    }

    /**
     * Get active ads for a specific placement.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForPlacement($query, $placement)
    {
        return $query->where('placement', $placement);
    }
}
