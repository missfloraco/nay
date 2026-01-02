<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\DatabaseNotification as BaseNotification;

class Notification extends BaseNotification
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id',
        'type',
        'data',
        'read_at',
    ];

    /**
     * Get the simplified data for the frontend.
     */
    public function toArray()
    {
        $data = parent::toArray();
        $payload = is_string($this->data) ? json_decode($this->data, true) : $this->data;
        
        return array_merge($data, [
            'title' => $payload['title'] ?? null,
            'message' => $payload['message'] ?? null,
            'level' => $payload['level'] ?? 'info', // success, error, info, warning
            'action_url' => $payload['action_url'] ?? null,
            'icon' => $payload['icon'] ?? null,
            'is_read' => !is_null($this->read_at),
            'created_human' => $this->created_at->diffForHumans(),
        ]);
    }
}
