<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Services\SupportService;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    protected $service;

    public function __construct(SupportService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['status']);
        $tickets = $this->service->getTickets($request->user(), 'tenant', $filters);
        return response()->json(['data' => $tickets]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent'
        ]);

        $ticket = $this->service->createTicket($request->user(), $data);
        return response()->json($ticket, 201);
    }

    public function show($id)
    {
        // Ensure tenant owns the ticket
        $ticket = SupportTicket::withTrashed()->where('tenant_id', auth()->id())
            ->with(['messages'])
            ->findOrFail($id);

        return response()->json($ticket);
    }

    public function getActiveTicket()
    {
        // Logic for 'active' ticket being the most recent open one
        $ticket = SupportTicket::where('tenant_id', auth()->id())
            ->whereIn('status', ['open', 'in_progress'])
            ->with('messages')
            ->latest()
            ->first();

        return response()->json(['active_ticket' => $ticket]);
    }

    public function reply(Request $request, $id)
    {
        $request->validate(['message' => 'required|string']);

        $ticket = SupportTicket::where('tenant_id', auth()->id())->findOrFail($id);

        $this->service->replyToTicket($ticket, $request->message, false);

        return response()->json(['message' => 'Reply sent successfully']);
    }

    public function destroy($id)
    {
        $ticket = SupportTicket::where('tenant_id', auth()->id())->findOrFail($id);
        $this->service->deleteTicket($ticket);
        return response()->json(['message' => 'Ticket deleted successfully']);
    }

    public function notifications()
    {
        // For Tenant: Count tickets where the last message is from Admin (waiting for user/action required)
        $tickets = SupportTicket::where('tenant_id', auth()->id())
            ->whereIn('status', ['open', 'in_progress', 'resolved'])
            ->with([
                'messages' => function ($q) {
                    $q->latest()->limit(1);
                }
            ])
            ->get();

        $count = $tickets->filter(function ($ticket) {
            $lastMsg = $ticket->messages->first();
            // User needs to see it if the last message was from Admin OR status is resolved
            return ($lastMsg && $lastMsg->is_admin_reply) || $ticket->status === 'resolved';
        })->count();

        return response()->json(['count' => $count]);
    }
}
