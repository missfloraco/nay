<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUid;

class SupportTicket extends Model
{
    use HasFactory, SoftDeletes, HasUid;

    const UID_PREFIX = 'TCK';

    protected $fillable = [
        'uid',
        'tenant_id',
        'subject',
        'status',
        'priority'
    ];

    public function messages()
    {
        return $this->hasMany(SupportMessage::class, 'ticket_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
