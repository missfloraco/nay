<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUid;
use Illuminate\Notifications\DatabaseNotification as BaseNotification;

class Notification extends BaseNotification
{
    use SoftDeletes, HasUid;

    const UID_PREFIX = 'NOT';
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    /**
     * Get the simplified data for the frontend.
     */
    public function toArray()
    {
        $payload = $this->data;

        return [
            'id' => $this->id,
            'uid' => $this->uid,
            'type' => $this->type,
            'title' => $payload['title'] ?? null,
            'message' => $payload['message'] ?? null,
            'level' => $payload['level'] ?? 'info',
            'action_url' => $payload['action_url'] ?? null,
            'icon' => $payload['icon'] ?? null,
            'is_read' => !is_null($this->read_at),
            'created_at' => $this->created_at->toIso8601String(),
            'created_human' => $this->created_at->diffForHumans(),
            'metadata' => $payload // preserve full payload in metadata just in case
        ];
    }
}
