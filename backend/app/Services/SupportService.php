<?php

namespace App\Services;

use App\Models\SupportTicket;
use App\Models\SupportMessage;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

class SupportService
{
    /**
     * Get tickets based on role and filters.
     */
    public function getTickets($user, string $role, array $filters = [])
    {
        $query = SupportTicket::with([
            'tenant',
            'messages' => function ($q) {
                $q->latest();
            }
        ])->latest();

        if ($role === 'tenant') {
            $query->where('tenant_id', $user->id);
        }

        // Status Filter
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            if ($filters['status'] === 'archived') {
                $query->onlyTrashed();
            } else {
                $query->where('status', $filters['status']);
            }
        }

        return $query->get();
    }

    /**
     * Create a new ticket.
     */
    public function createTicket($user, array $data)
    {
        // Enforce single active ticket rule
        $existing = SupportTicket::where('tenant_id', $user->id)
            ->whereIn('status', ['open', 'in_progress'])
            ->first();

        if ($existing) {
            throw new \Exception('لديك تذكرة مفتوحة بالفعل. يرجى إغلاقها قبل إنشاء تذكرة جديدة.', 400);
        }

        return DB::transaction(function () use ($user, $data) {
            $ticket = SupportTicket::create([
                'tenant_id' => $user->id,
                'subject' => $data['subject'],
                'priority' => $data['priority'] ?? 'medium',
                'status' => 'open'
            ]);

            SupportMessage::create([
                'ticket_id' => $ticket->id,
                'message' => $data['message'],
                'is_admin_reply' => false
            ]);

            return $ticket;
        });
    }

    /**
     * Reply to a ticket.
     */
    public function replyToTicket(SupportTicket $ticket, string $message, bool $isAdmin)
    {
        $msg = SupportMessage::create([
            'ticket_id' => $ticket->id,
            'message' => $message,
            'is_admin_reply' => $isAdmin
        ]);

        if (!$isAdmin && in_array($ticket->status, ['resolved', 'closed'])) {
            $ticket->update(['status' => 'open']);
        }

        if ($isAdmin && $ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        return $msg;
    }

    /**
     * Update ticket status.
     */
    public function updateStatus(SupportTicket $ticket, string $status)
    {
        $ticket->update(['status' => $status]);
        return $ticket;
    }

    /**
     * Delete/Archive ticket.
     */
    public function deleteTicket(SupportTicket $ticket)
    {
        $ticket->delete();
    }

    /**
     * Restore ticket.
     */
    public function restoreTicket($ticketId)
    {
        $ticket = SupportTicket::withTrashed()->findOrFail($ticketId);
        $ticket->restore();
        return $ticket;
    }
}
