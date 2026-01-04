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

        // Auto-mark ALL support notifications as read when visiting the support center
        // This clears the sidebar badge for "Support"
        $request->user()->unreadNotifications()
            ->where(function ($q) {
                $q->whereJsonContains('data->notification_type', 'new_support_ticket')
                    ->orWhereJsonContains('data->notification_type', 'ticket_reply');
            })
            ->update(['read_at' => now()]);

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

        // Delete related messages and notifications first
        $ticket->messages()->delete();
        \App\Models\Notification::whereJsonContains('data->ticket_id', $ticket->id)
            ->orWhereJsonContains('data->action_url', "/admin/support?ticket_id={$ticket->id}")
            ->delete();

        $ticket->forceDelete();

        return response()->json(['message' => 'Ticket deleted permanently']);
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
