<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUid;

class Subscription extends Model
{
    use SoftDeletes, HasUid;

    const UID_PREFIX = 'SUB';
    protected $fillable = [
        'uid',
        'tenant_id',
        'plan_id',
        'status',
        'started_at',
        'ends_at',
        'trial_ends_at',
        'payment_method',
        'payment_reference',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ends_at' => 'datetime',
        'trial_ends_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function isTrial()
    {
        return $this->status === 'trial';
    }
    public function isActive()
    {
        return $this->status === 'active';
    }
    public function isExpired()
    {
        return $this->status === 'expired';
    }
    public function isRestricted()
    {
        return $this->status === 'restricted';
    }
    public function isSuspended()
    {
        return $this->status === 'suspended';
    }
}
