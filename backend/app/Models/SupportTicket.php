<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUid;

class SupportTicket extends Model
{
    use HasFactory, SoftDeletes, HasUid;

    const UID_PREFIX = 'TKT';

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($ticket) {
            if ($ticket->isForceDeleting()) {
                // Cascading deletion for messages and notifications
                $ticket->messages()->delete();
                \App\Models\Notification::whereJsonContains('data->ticket_id', $ticket->id)
                    ->orWhereJsonContains('data->action_url', "/admin/support?ticket_id={$ticket->id}")
                    ->orWhereJsonContains('data->action_url', "/app/support/messages?ticket_id={$ticket->id}")
                    ->delete();
            }
        });
    }

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
