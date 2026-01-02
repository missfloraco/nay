<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SystemNotification extends Notification
{
    use Queueable;

    protected $options;

    /**
     * Create a new notification instance.
     * 
     * @param array $options [title, message, level, action_url, icon]
     */
    public function __construct(array $options)
    {
        $this->options = $options;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->options['title'] ?? 'تنبيه النظام',
            'message' => $this->options['message'],
            'level' => $this->options['level'] ?? 'info',
            'action_url' => $this->options['action_url'] ?? null,
            'icon' => $this->options['icon'] ?? 'Bell',
        ];
    }
}
