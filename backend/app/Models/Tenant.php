<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUid;
use App\Traits\Filterable;

class Tenant extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes, HasUid, Filterable;

    const UID_PREFIX = 'TNT';

    // Filterable trait configuration
    protected $searchable = ['name', 'email', 'phone', 'whatsapp'];
    protected $sortable = ['id', 'name', 'email', 'created_at', 'status'];

    protected $fillable = [
        'uid',
        'name',
        'email',
        'phone',
        'password',
        'whatsapp',
        'avatar_url',
        'country_code',
        'currency_code',
        'settings',
        'subscription_started_at',
        'subscription_ends_at',
        'trial_expires_at',
        'ads_enabled',
        'trial_bonus_applied',
        'verification_code',
        'verification_code_expires_at',
        'email_verified_at',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'verification_code',
        'verification_code_expires_at',
    ];

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function currentSubscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>', now());
            })
            ->latestOfMany();
    }

    protected $casts = [
        'password' => 'hashed',
        'trial_expires_at' => 'datetime',
        'subscription_started_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'settings' => 'array',
        'ads_enabled' => 'boolean',
        'trial_bonus_applied' => 'boolean',
        'verification_code_expires_at' => 'datetime',
    ];

    /**
     * Get the tenant status dynamically.
     */
    public function getStatusAttribute($value)
    {
        // 1. Check active subscription first - this takes priority
        $activeSub = $this->activeSubscription;
        if ($activeSub && $activeSub->status === 'active') {
            if ($activeSub->ends_at === null || $activeSub->ends_at->isFuture()) {
                return 'active';
            }
        }

        // 2. Check if subscription expired based on tenant's subscription_ends_at
        if ($value === 'active' && $this->subscription_ends_at && $this->subscription_ends_at->isPast()) {
            return 'expired';
        }

        // 3. Return active if value is active and no expiration detected
        if ($value === 'active') {
            return 'active';
        }

        // 4. Check trial expiration
        if ($value === 'trial' || $value === 'pending') {
            if ($this->trial_expires_at && $this->trial_expires_at->isPast()) {
                return 'expired';
            }
        }

        return $value;
    }
}
