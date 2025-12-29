<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ad extends Model
{
    protected $fillable = [
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
