<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionRequest extends Model
{
    protected $fillable = [
        'tenant_id',
        'plan_id',
        'status',
        'notes',
        'admin_notes',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
}
