<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'message',
        'is_admin_reply',
        'attachment_url'
    ];

    public function ticket()
    {
        return $this->belongsTo(SupportTicket::class, 'ticket_id');
    }
}
