import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import AdminLayout from './adminlayout';
import { formatDate } from '@/shared/utils/helpers';
import { MessageSquare, Send, CheckCircle, Clock, Info, Trash2, X, ChevronLeft, AlertCircle, Archive, LifeBuoy, History, Plus, Shield, Link } from 'lucide-react';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import InputField from '@/shared/ui/forms/input-field';

const SupportTickets = () => {
    const queryClient = useQueryClient();
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { showSuccess, showError, showConfirm } = useFeedback();

    // Tickets List Query
    const { data: ticketsData, isLoading: isLoadingList } = useQuery({
        queryKey: ['admin-tickets', statusFilter],
        queryFn: async () => {
            return await api.get(`/admin/support/tickets?status=${statusFilter}`) as any;
        },
        refetchInterval: 10000
    });

    // Clear selection when filter changes to prevent stuck states
    useEffect(() => {
        // eslint-disable-next-line
        setSelectedTicketId(null);
    }, [statusFilter]);

    // Ticket Details & Chat Query
    const { data: selectedTicket, isLoading: isLoadingChat, error: chatError } = useQuery({
        queryKey: ['admin-ticket', selectedTicketId],
        queryFn: async () => {
            if (!selectedTicketId) return null;
            return await api.get(`/admin/support/tickets/${selectedTicketId}`) as any;
        },
        enabled: !!selectedTicketId,
        refetchInterval: 5000,
        retry: 1
    });

    // Handle Query Errors
    useEffect(() => {
        if (chatError && selectedTicketId) {
            showError('فشل تحميل بيانات التذكرة. قد تكون محذوفة أو غير موجودة.');
            // eslint-disable-next-line
            setSelectedTicketId(null);
        }
    }, [chatError, selectedTicketId]);

    // Mutations
    const replyMutation = useMutation({
        mutationFn: (data: { message: string }) => api.post(`/admin/support/tickets/${selectedTicketId}/reply`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ticket', selectedTicketId] });
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
            queryClient.invalidateQueries({ queryKey: ['admin-notifications-count'] });
            setChatMessage('');
        },
        onError: () => showError('فشل إرسال الرد')
    });

    const updateStatusMutation = useMutation({
        mutationFn: (data: { status: string }) => api.patch(`/admin/support/tickets/${selectedTicketId}/status`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ticket', selectedTicketId] });
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
            queryClient.invalidateQueries({ queryKey: ['admin-notifications-count'] });
            showSuccess('تم تحديث حالة التذكرة');
        }
    });

    const deleteTicketMutation = useMutation({
        mutationFn: () => api.delete(`/admin/support/tickets/${selectedTicketId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
            queryClient.invalidateQueries({ queryKey: ['admin-notifications-count'] });
            showSuccess('تم نقل التذكرة للأرشيف بنجاح');
            setSelectedTicketId(null);
        },
        onError: () => showError('فشل أرشفة التذكرة')
    });

    const restoreTicketMutation = useMutation({
        mutationFn: () => api.post(`/admin/support/tickets/${selectedTicketId}/restore`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ticket', selectedTicketId] });
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
            showSuccess('تم استعادة التذكرة بنجاح');
        },
        onError: () => showError('فشل استعادة التذكرة')
    });

    const forceDeleteMutation = useMutation({
        mutationFn: () => api.delete(`/admin/support/tickets/${selectedTicketId}/force`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
            queryClient.invalidateQueries({ queryKey: ['admin-notifications-count'] });
            showSuccess('تم حذف التذكرة نهائياً');
            setSelectedTicketId(null);
        },
        onError: () => showError('فشل حذف التذكرة نهائياً')
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        replyMutation.mutate({ message: chatMessage });
    };

    const getStatusColor = (status: string, isDeleted: boolean = false) => {
        if (isDeleted) return 'bg-red-100/50 text-red-700 border-red-200';
        switch (status) {
            case 'open': return 'bg-blue-100/50 text-blue-700 border-blue-200';
            case 'in_progress': return 'bg-yellow-100/50 text-yellow-700 border-yellow-200';
            case 'resolved': return 'bg-green-100/50 text-green-700 border-green-200';
            case 'closed': return 'bg-gray-100/50 text-gray-700 border-gray-200';
            default: return 'bg-gray-100/50 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: string, isDeleted: boolean = false) => {
        if (isDeleted) return 'مؤرشفة';
        const labels: Record<string, string> = {
            'all': 'الكل',
            'open': 'مفتوحة',
            'in_progress': 'قيد المعالجة',
            'resolved': 'محلولة',
            'closed': 'مغلقة',
            'archived': 'الأرشيف'
        };
        return labels[status] || status;
    };

    const getPriorityLabel = (priority: string) => {
        const labels: Record<string, string> = {
            'low': 'منخفضة',
            'medium': 'متوسطة',
            'high': 'عالية',
            'urgent': 'عاجلة'
        };
        return labels[priority] || priority;
    };

    // Helper to split date and time for display
    const renderTimestamp = (dateString: string) => {
        const full = formatDate(dateString, true);
        const parts = full.split('|');
        if (parts.length < 3) return <span>{full}</span>;

        return (
            <div className="flex flex-col items-end gap-0">
                <span className="leading-tight">{parts[0].trim()} | {parts[1].trim()}</span>
                <span className="font-black text-[10px] opacity-60 leading-tight">{parts[2].trim()}</span>
            </div>
        );
    };

    return (
        <AdminLayout
            title="إدارة رسائل الدعم"
            noPadding={true}
            leftSidebarContent={
                <div className="flex flex-col h-full bg-white dark:bg-dark-900 overflow-hidden -m-6">
                    {/* Management Sidebar */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Management Header (Visible when selected) */}
                        {selectedTicketId ? (
                            <div className="p-6 bg-gray-50/50 dark:bg-dark-800/50 border-b-2 border-gray-100 dark:border-dark-700 space-y-5 animate-in fade-in duration-500">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">إدارة التذكرة</span>
                                        <h4 className="text-lg font-black text-primary mb-1"># {selectedTicketId}</h4>
                                        <p className="text-xs font-bold text-gray-800 truncate">مع: {selectedTicket?.tenant?.name || '...'}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTicketId(null)}
                                        className="p-2 bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-all shadow-sm"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">تحديث الحالة</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => updateStatusMutation.mutate({ status })}
                                                    disabled={!!selectedTicket?.deleted_at}
                                                    className={`px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all border-2 ${selectedTicket?.status === status
                                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10'
                                                        : 'bg-white dark:bg-dark-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700'
                                                        } ${selectedTicket?.deleted_at ? 'opacity-50 grayscale' : ''}`}
                                                >
                                                    {getStatusLabel(status)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedTicket?.deleted_at ? (
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => restoreTicketMutation.mutate()}
                                                disabled={restoreTicketMutation.isPending}
                                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 text-white rounded-xl font-black text-[11px] hover:bg-green-700 transition-all shadow-xl shadow-green-100 group active:scale-[0.98]"
                                            >
                                                <CheckCircle className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                                استعادة من الأرشيف
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const confirmed = await showConfirm({
                                                        title: 'حذف نهائي',
                                                        message: 'هل أنت متأكد من حذف هذه التذكرة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
                                                        isDestructive: true
                                                    });
                                                    if (confirmed) {
                                                        forceDeleteMutation.mutate();
                                                    }
                                                }}
                                                disabled={forceDeleteMutation.isPending}
                                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-100 text-red-600 rounded-xl font-black text-[11px] hover:bg-red-200 transition-all border border-red-200 group active:scale-[0.98]"
                                            >
                                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                حذف نهائي
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                const confirmed = await showConfirm({
                                                    title: 'أرشفة التذكرة',
                                                    message: 'هل أنت متأكد من نقل هذه التذكرة للأرشيف؟',
                                                    isDestructive: true
                                                });
                                                if (confirmed) {
                                                    deleteTicketMutation.mutate();
                                                }
                                            }}
                                            disabled={deleteTicketMutation.isPending}
                                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 text-white rounded-xl font-black text-[11px] hover:bg-red-700 transition-all shadow-xl shadow-red-100 group active:scale-[0.98]"
                                        >
                                            <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                            أرشفة التذكرة
                                        </button>
                                    )}

                                    <div className="grid grid-cols-1 gap-3 bg-white dark:bg-dark-800 p-4 rounded-2xl border border-gray-100 dark:border-dark-700 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">الأولوية</span>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${selectedTicket?.priority === 'urgent' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-dark-700 text-gray-700 dark:text-gray-300'}`}>
                                                {getPriorityLabel(selectedTicket?.priority || '')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-gray-50 dark:border-dark-700 pt-3">
                                            <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">التاريخ</span>
                                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{formatDate(selectedTicket?.created_at).split('|')[1]?.trim() || ''}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 border-b border-gray-100 dark:border-dark-800 bg-gray-50/10 dark:bg-dark-800/20">

                                <nav className="space-y-1">
                                    {[
                                        { id: 'all', label: 'الكل', icon: MessageSquare, color: 'text-gray-400' },
                                        { id: 'open', label: 'مفتوحة', icon: AlertCircle, color: 'text-blue-500' },
                                        { id: 'in_progress', label: 'قيد المعالجة', icon: Clock, color: 'text-yellow-500' },
                                        { id: 'resolved', label: 'محلولة', icon: CheckCircle, color: 'text-green-500' },
                                        { id: 'closed', label: 'مغلقة', icon: X, color: 'text-gray-500' },
                                        { id: 'archived', label: 'الأرشيف', icon: Archive, color: 'text-red-400' },
                                    ].map((item) => {
                                        const isActive = statusFilter === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setStatusFilter(item.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-xs relative group
                                                ${isActive
                                                        ? 'bg-primary/10 dark:bg-primary/20 text-primary ring-1 ring-primary/20 dark:ring-primary/40 shadow-lg shadow-primary/5'
                                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800/50 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                            >
                                                <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : item.color}`} />
                                                <span className={`flex-1 text-right ${isActive ? 'text-primary' : ''}`}>{item.label}</span>
                                                {isActive && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        )}

                        {/* Ticket List Section */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4 bg-gray-50/10 dark:bg-dark-900/20">
                            {isLoadingList && !ticketsData ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400 font-bold">
                                    <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-400 rounded-full mb-4" />
                                    <span className="text-[9px] uppercase tracking-widest font-black">جاري التحديث...</span>
                                </div>
                            ) : ticketsData?.data?.length === 0 ? (
                                <div className="text-center py-24 text-gray-300">
                                    <MessageSquare className="w-10 h-10 mx-auto mb-6 opacity-20" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em]">لا توجد تذاكر</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {ticketsData?.data?.map((ticket: any) => (
                                        <div
                                            key={ticket.id}
                                            onClick={() => setSelectedTicketId(ticket.id)}
                                            className={`p-5 rounded-[28px] cursor-pointer transition-all border-2 group relative overflow-hidden ${selectedTicketId === ticket.id
                                                ? 'bg-white dark:bg-dark-800 border-primary shadow-2xl shadow-primary/5 scale-[1.02]'
                                                : 'bg-white dark:bg-dark-900 border-transparent hover:border-gray-100 dark:hover:border-dark-800 shadow-sm'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">#{ticket.id}</span>
                                                    <h4 className={`font-black text-[13px] line-clamp-1 transition-colors ${selectedTicketId === ticket.id ? 'text-primary' : 'text-gray-900 dark:text-gray-100 group-hover:text-primary'}`}>
                                                        {ticket.subject}
                                                    </h4>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center bg-gray-50/50 dark:bg-dark-800/50 p-3 rounded-2xl border border-gray-100/50 dark:border-dark-700/50">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-7 h-7 shrink-0 rounded-xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-700 flex items-center justify-center font-black text-[10px] text-primary shadow-sm group-hover:rotate-6 transition-transform">
                                                        {ticket.tenant?.name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 truncate">{ticket.tenant?.name}</span>
                                                </div>
                                                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shrink-0 ${getStatusColor(ticket.status, !!ticket.deleted_at)}`}>
                                                    {getStatusLabel(ticket.status, !!ticket.deleted_at)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col h-full bg-white dark:bg-dark-900 overflow-hidden relative">
                {!selectedTicketId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center bg-gray-50/20 dark:bg-dark-800/20">
                        <div className="relative mb-6">
                            <MessageSquare className="w-24 h-24 opacity-5" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-primary/20 animate-ping" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-300">اختر تذكرة لبدء المتابعة</h3>
                        <p className="mt-2 text-sm max-w-sm">سيظهر محتوى المحادثة والردود هنا بمجرد اختيار تذكرة من القائمة الجانبية</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-gray-50/30 dark:bg-dark-800/30 no-scrollbar">
                            {isLoadingChat && !selectedTicket ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">جاري تحميل المحادثة...</p>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {selectedTicket?.messages?.map((msg: any) => (
                                        <div
                                            key={msg.id}
                                            className={`flex animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[75%] rounded-[32px] px-8 py-6 shadow-sm relative transition-all hover:shadow-md ${msg.is_admin_reply
                                                    ? 'bg-gradient-to-br from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70 text-white rounded-tr-none shadow-xl shadow-primary/30'
                                                    : 'bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-100 border-2 border-gray-100 dark:border-dark-700 rounded-tl-none ring-1 ring-dark-950/50 dark:ring-white/5'
                                                    }`}
                                            >
                                                {!msg.is_admin_reply && (
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
                                                            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رسالة العميل</span>
                                                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{selectedTicket?.tenant?.name}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-bold">{msg.message}</p>
                                                <div className={`text-[9px] mt-4 flex items-center justify-end gap-3 font-black uppercase tracking-tighter ${msg.is_admin_reply ? 'text-primary-foreground/70' : 'text-gray-400 dark:text-gray-500'}`}>
                                                    <div className="flex items-center gap-1.5 order-2">
                                                        {msg.is_admin_reply ? (
                                                            <CheckCircle className="w-3.5 h-3.5 text-white/40" />
                                                        ) : (
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                                تم الاستلام
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="order-1 text-right">
                                                        {renderTimestamp(msg.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        {selectedTicket?.deleted_at ? (
                            <div className="p-8 bg-gray-50 border-t flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                        <Info className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-black text-red-700 uppercase tracking-widest">هذه التذكرة مؤرشفة للقراءة فقط</p>
                                </div>
                                <button
                                    onClick={() => restoreTicketMutation.mutate()}
                                    disabled={restoreTicketMutation.isPending}
                                    className="px-6 py-3 bg-primary text-white rounded-xl font-black text-[11px] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    {restoreTicketMutation.isPending ? 'جاري الاستعادة...' : 'استعادة التذكرة الآن'}
                                </button>
                            </div>
                        ) : (
                            <div className="p-8 bg-white border-t shrink-0">
                                <form onSubmit={handleSendMessage} className="flex gap-4">
                                    <div className="flex-1">
                                        <InputField
                                            label=""
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            placeholder="اكتب رد النظام هنا..."
                                            disabled={selectedTicket?.status === 'closed' || replyMutation.isPending}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!chatMessage.trim() || replyMutation.isPending || selectedTicket?.status === 'closed'}
                                        className="w-16 h-16 flex items-center justify-center bg-primary text-white rounded-2xl hover:bg-primary/90 disabled:opacity-30 disabled:grayscale transition-all shadow-2xl shadow-primary/30 group overflow-hidden"
                                    >
                                        <div className="relative z-10">
                                            {replyMutation.isPending ? (
                                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Send className="w-6 h-6 -rotate-90 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/25 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default SupportTickets;
