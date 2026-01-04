<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketNotification extends Notification
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
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'notification_type' => $this->options['notification_type'] ?? 'ticket_default',
            'ticket_id' => $this->options['ticket_id'] ?? null,
            'title' => $this->options['title'] ?? 'تحديث التذكرة',
            'message' => $this->options['message'],
            'level' => $this->options['level'] ?? 'info',
            'action_url' => $this->options['action_url'] ?? null,
            'icon' => $this->options['icon'] ?? 'MessageSquare',
        ];
    }
}
