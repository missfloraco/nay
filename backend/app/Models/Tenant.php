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
    protected $searchable = ['name', 'email', 'whatsapp'];
    protected $sortable = ['id', 'name', 'email', 'created_at', 'status'];

    protected $fillable = [
        'uid',
        'name',
        'email',
        'password',
        'whatsapp',
        'avatar_url',
        'country_code',
        'currency_code',
        'status',
        'trial_expires_at',
        'settings',
        'subscription_started_at',
        'subscription_ends_at',
        'ads_enabled',
        'trial_bonus_applied',
        'verification_code',
        'verification_code_expires_at',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
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
        if ($value === 'active' && $this->subscription_ends_at && $this->subscription_ends_at->isPast()) {
            return 'expired';
        }

        if ($value === 'active') {
            return 'active';
        }

        if ($value === 'trial' || $value === 'pending') {
            if ($this->trial_expires_at && $this->trial_expires_at->isPast()) {
                return 'expired';
            }
        }

        return $value;
    }
}
