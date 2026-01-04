<?php

namespace App\Http\Controllers\Admin;

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
        $tickets = $this->service->getTickets($request->user(), 'admin', $filters);

        // Auto-mark support notifications as read when visiting this page
        $request->user()->unreadNotifications()
            ->where('type', 'App\Notifications\TicketNotification')
            ->get()
            ->each(function ($n) {
                $n->markAsRead();
            });

        return response()->json(['data' => $tickets]);
    }

    public function show($id)
    {
        $ticket = SupportTicket::withTrashed()->with(['tenant', 'messages'])->findOrFail($id);
        return response()->json($ticket);
    }

    public function reply(Request $request, $id)
    {
        $request->validate(['message' => 'required|string']);
        $ticket = SupportTicket::findOrFail($id);

        $this->service->replyToTicket($ticket, $request->message, true);

        return response()->json(['message' => 'Reply sent successfully']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:open,in_progress,resolved,closed']);
        $ticket = SupportTicket::findOrFail($id);

        $this->service->updateStatus($ticket, $request->status);

        return response()->json(['message' => 'Status updated successfully']);
    }

    public function destroy($id)
    {
        $ticket = SupportTicket::findOrFail($id);
        $this->service->deleteTicket($ticket);
        return response()->json(['message' => 'Ticket archived successfully']);
    }

    public function restore($id)
    {
        $this->service->restoreTicket($id);
        return response()->json(['message' => 'Ticket restored successfully']);
    }

    public function forceDelete($id)
    {
        $ticket = SupportTicket::withTrashed()->findOrFail($id);

        // Delete related messages first if no cascade
        $ticket->messages()->delete();
        $ticket->forceDelete();

        return response()->json(['message' => 'Ticket deleted permanently']);
    }

    public function notifications()
    {
        // Count tickets where the last message is from the tenant (waiting for admin)
        // We filter for active statuses only
        $tickets = SupportTicket::whereIn('status', ['open', 'in_progress', 'resolved'])
            ->whereHas('messages', function ($q) {
                // Optimize: check if the VERY LAST message is NOT admin reply
                // This is hard to do purely in SQL efficiently without window functions or join logic
                // For now, fetching recent tickets and filtering in collection is acceptable for reasonable volume
            })
            ->with([
                'messages' => function ($q) {
                    $q->latest()->limit(1);
                }
            ])
            ->get();

        $count = $tickets->filter(function ($ticket) {
            $lastMsg = $ticket->messages->first();
            return $lastMsg && !$lastMsg->is_admin_reply;
        })->count();

        return response()->json(['count' => $count]);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $path = $this->imageService->storeOptimized($request->file('image'), "admins/{$request->user()->uid}/support");
            return response()->json([
                'url' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['message' => 'No image uploaded'], 422);
    }
}
