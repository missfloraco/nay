<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Services\SupportService;
use App\Services\ImageService;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    protected $service;
    protected $imageService;

    public function __construct(SupportService $service, ImageService $imageService)
    {
        $this->service = $service;
        $this->imageService = $imageService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['status']);
        $tickets = $this->service->getTickets($request->user(), 'tenant', $filters);

        // Auto-mark support notifications as read when visiting this page
        $request->user()->unreadNotifications()
            ->where('type', 'App\Notifications\TicketNotification')
            ->get()
            ->each(function ($n) {
                $n->markAsRead(); });

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

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $path = $this->imageService->storeOptimized($request->file('image'), 'support-uploads');
            return response()->json([
                'url' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['message' => 'No image uploaded'], 422);
    }
}
