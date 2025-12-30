import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import AdminLayout from './adminlayout';
import { formatDate } from '@/shared/utils/helpers';
import { MessageSquare, SendHorizontal, CheckCircle, Clock, Info, Trash2, X, AlertCircle, Archive, Shield, Link, ShieldCheck, Search, Filter } from 'lucide-react';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import InputField from '@/shared/ui/forms/input-field';
import Modal from '@/shared/ui/modals/modal';

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
            icon={MessageSquare}
            noPadding={false}
            hideLeftSidebar={true}
        >
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

                {/* Filters Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-dark-900 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <Filter className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-gray-900 dark:text-white">تصفية التذاكر</h3>
                            <p className="text-xs font-bold text-gray-400">تحكم في عرض التذاكر حسب حالتـها الحالية</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
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
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-black text-xs relative group
                                    ${isActive
                                            ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                                            : 'bg-gray-50 dark:bg-dark-800 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-dark-750 border border-transparent hover:border-gray-100 dark:hover:border-white/5 shadow-sm'
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Ticket Grid List */}
                {isLoadingList && !ticketsData ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-dark-900 rounded-[3rem] border border-gray-100 dark:border-white/5 border-dashed">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-6" />
                        <span className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">جاري جلب الرسائل...</span>
                    </div>
                ) : ticketsData?.data?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-dark-900 rounded-[3rem] border border-gray-100 dark:border-white/5 border-dashed text-center">
                        <div className="p-8 bg-gray-50 dark:bg-dark-800 rounded-[2.5rem] mb-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                            <MessageSquare className="w-20 h-20" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-300">لا توجد رسائل دعم حالياً</h3>
                        <p className="text-gray-400 font-bold mt-2">سيتم عرض التذاكر هنا بمجرد استلام طلبات من المشتركين</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ticketsData?.data?.map((ticket: any) => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicketId(ticket.id)}
                                className="group relative bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
                            >
                                {/* Ticket Status & ID */}
                                <div className="flex justify-between items-center mb-6">
                                    <span className="px-3 py-1 rounded-full bg-gray-50 dark:bg-dark-800 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-white/5">
                                        #{ticket.id}
                                    </span>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${getStatusColor(ticket.status, !!ticket.deleted_at)}`}>
                                        {getStatusLabel(ticket.status, !!ticket.deleted_at)}
                                    </div>
                                </div>

                                {/* Subject & Info */}
                                <div className="space-y-4 mb-8">
                                    <h4 className="text-lg font-black text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                        {ticket.subject}
                                    </h4>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-dark-800/30 rounded-2xl border border-gray-100/50 dark:border-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-800 border-2 border-primary/10 flex items-center justify-center font-black text-xs text-primary shadow-sm group-hover:scale-110 transition-transform">
                                            {ticket.tenant?.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-gray-900 dark:text-white">{ticket.tenant?.name}</span>
                                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{ticket.tenant?.uid}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-white/5">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-[10px] font-black">{formatDate(ticket.created_at).split('|')[1]?.trim()}</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${ticket.priority === 'urgent' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <AlertCircle className="w-3 h-3" />
                                        {getPriorityLabel(ticket.priority)}
                                    </div>
                                </div>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ticket Conversation Modal */}
            <Modal
                isOpen={!!selectedTicketId}
                onClose={() => setSelectedTicketId(null)}
                title="محادثة الدعم الفني"
                size="full"
            >
                <div className="flex flex-col lg:flex-row h-full gap-8 bg-gray-50/20 dark:bg-dark-950/20">

                    {/* Chat Content (Left/Center) */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-dark-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden min-h-0">
                        {/* Modal Chat Header */}
                        <div className="p-6 bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0 z-20">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-dark-800 border-2 border-gray-100 dark:border-white/5 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                                    {selectedTicket?.tenant?.avatar_url ? (
                                        <img src={selectedTicket.tenant.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-black text-primary">
                                            {selectedTicket?.tenant?.name?.substring(0, 2).toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight">{selectedTicket?.tenant?.name}</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/10">
                                            <Shield className="w-3 h-3 text-primary/60" />
                                            <span className="text-[10px] font-black text-primary/80 uppercase tracking-widest">{selectedTicket?.tenant?.uid}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-dark-800 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-white/5">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">آخر ظهور: {selectedTicket?.tenant?.country_code || 'SA'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-gray-50/50 dark:bg-dark-800/50 p-3 rounded-[1.75rem] border border-gray-100 dark:border-white/5">
                                <div className="px-4 border-r border-gray-200 dark:border-white/5 hidden md:block">
                                    <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">الموضوع</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white line-clamp-1 max-w-[250px]">{selectedTicket?.subject}</span>
                                </div>
                                <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ring-4 ring-white dark:ring-dark-900 ${getStatusColor(selectedTicket?.status || '', !!selectedTicket?.deleted_at)}`}>
                                    {getStatusLabel(selectedTicket?.status || '', !!selectedTicket?.deleted_at)}
                                </div>
                            </div>
                        </div>

                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto px-10 py-12 space-y-12 bg-gray-50/20 dark:bg-dark-800/10 no-scrollbar">
                            {isLoadingChat && !selectedTicket ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                                    <span className="text-xs font-black uppercase tracking-widest">تحميل المحادثة...</span>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {selectedTicket?.messages?.map((msg: any) => (
                                        <div
                                            key={msg.id}
                                            className={`flex animate-in fade-in slide-in-from-bottom-4 duration-700 ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex flex-col max-w-[85%] lg:max-w-[75%] gap-2 ${msg.is_admin_reply ? 'items-end' : 'items-start'}`}>
                                                <div className="flex items-end gap-3 px-2">
                                                    {!msg.is_admin_reply && (
                                                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-dark-800 border-2 border-gray-100 dark:border-white/5 flex items-center justify-center shadow-lg shrink-0">
                                                            <span className="text-[10px] font-black text-primary">{selectedTicket?.tenant?.name?.substring(0, 1)}</span>
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`relative rounded-[2rem] px-8 py-5 shadow-sm transition-all hover:shadow-xl ${msg.is_admin_reply
                                                            ? 'bg-primary text-white rounded-bl-none shadow-primary/20'
                                                            : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 border-2 border-gray-100 dark:border-white/10 rounded-br-none'
                                                            }`}
                                                    >
                                                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-bold">{msg.message}</p>
                                                    </div>
                                                    {msg.is_admin_reply && (
                                                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 border-4 border-white dark:border-dark-900">
                                                            <ShieldCheck className="w-5 h-5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 px-4">
                                                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{formatDate(msg.created_at, true)}</span>
                                                    {msg.is_admin_reply && <div className="w-1 h-1 rounded-full bg-primary/30" />}
                                                    {msg.is_admin_reply && <span className="text-[8px] font-black text-primary/50 uppercase">Admin Response</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Chat Input */}
                        <div className="p-10 bg-white dark:bg-dark-900 border-t border-gray-100 dark:border-white/5 shrink-0">
                            {selectedTicket?.deleted_at ? (
                                <div className="p-8 bg-red-50/30 dark:bg-red-900/10 rounded-[2rem] border-2 border-dashed border-red-100 dark:border-red-900/20 flex items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-red-500 text-white rounded-[1.25rem] shadow-xl shadow-red-500/20 animat-pulse">
                                            <Info className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-red-700 dark:text-red-400">هذه التذكرة مؤرشفة حالياً</h4>
                                            <p className="text-xs font-bold text-red-600/60 dark:text-red-400/50 uppercase tracking-wider">لا يمكن إرسال ردود جديدة إلا بعد استعادة التذكرة من الأرشيف</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => restoreTicketMutation.mutate()}
                                        className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95"
                                    >
                                        استعادة التذكرة الآن
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="flex gap-4">
                                    <div className="flex-1">
                                        <InputField
                                            label=""
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            placeholder="اكتب رد النظام هنا..."
                                            disabled={selectedTicket?.status === 'closed' || replyMutation.isPending}
                                            className="bg-gray-50 dark:bg-dark-800 border-none shadow-none focus-within:ring-4 ring-primary/5 h-[64px] rounded-[1.75rem] px-8 text-base font-bold"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!chatMessage.trim() || replyMutation.isPending || selectedTicket?.status === 'closed'}
                                        className="h-[64px] w-[64px] flex items-center justify-center bg-primary text-white rounded-[1.75rem] hover:bg-primary/90 disabled:opacity-30 disabled:grayscale transition-all shadow-2xl shadow-primary/30 group active:scale-95 shrink-0"
                                    >
                                        {replyMutation.isPending ? (
                                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <SendHorizontal className="w-6 h-6 -rotate-90 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Management Sidebar (Right) */}
                    <div className="lg:w-96 flex flex-col gap-6 shrink-0">
                        {/* Admin Action Card */}
                        <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden animate-in slide-in-from-left-4 duration-700">
                            <div className="p-8 bg-gray-50/50 dark:bg-dark-800/50 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">إجراءات الإدارة</span>
                                <h4 className="text-xl font-black text-primary leading-tight">التحكم في التذكرة</h4>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Status Toggle */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">تغيير حالة التذكرة</label>
                                    <div className="flex flex-col gap-2">
                                        {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => updateStatusMutation.mutate({ status })}
                                                disabled={!!selectedTicket?.deleted_at}
                                                className={`flex items-center justify-between px-6 py-4 rounded-2xl text-xs font-black transition-all border-2 ${selectedTicket?.status === status
                                                    ? 'bg-primary/5 text-primary border-primary shadow-lg shadow-primary/5'
                                                    : 'bg-white dark:bg-dark-800 text-gray-500 border-gray-100 dark:border-white/5 hover:border-gray-200'
                                                    } ${selectedTicket?.deleted_at ? 'opacity-50 grayscale' : ''}`}
                                            >
                                                <span>{getStatusLabel(status)}</span>
                                                {selectedTicket?.status === status && <CheckCircle className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Danger Actions */}
                                <div className="pt-8 border-t border-gray-100 dark:border-white/5 space-y-3">
                                    {selectedTicket?.deleted_at ? (
                                        <>
                                            <button
                                                onClick={() => restoreTicketMutation.mutate()}
                                                className="w-full h-16 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3"
                                            >
                                                <History className="w-5 h-5" />
                                                استعادة التذكرة
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const confirmed = await showConfirm({
                                                        title: 'حذف نهائي',
                                                        message: 'لا يمكن التراجع عن هذا الإجراء، هل أنت متأكد؟',
                                                        isDestructive: true
                                                    });
                                                    if (confirmed) forceDeleteMutation.mutate();
                                                }}
                                                className="w-full h-16 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-2xl font-black text-sm hover:bg-red-200 transition-all flex items-center justify-center gap-3"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                                حذف التذكرة نهائياً
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                const confirmed = await showConfirm({
                                                    title: 'أرشفة التذكرة',
                                                    message: 'هل تريد نقل هذه التذكرة إلى الأرشيف؟',
                                                    isDestructive: true
                                                });
                                                if (confirmed) deleteTicketMutation.mutate();
                                            }}
                                            className="w-full h-16 bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-100 dark:border-red-900/20 rounded-2xl font-black text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Archive className="w-5 h-5" />
                                            نقل إلى الأرشيف
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary Details Card */}
                        <div className="bg-primary/5 rounded-[2.5rem] border-2 border-primary/10 p-8 space-y-6 animate-in slide-in-from-left-6 duration-700">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-dark-900 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Info className="w-6 h-6 text-primary" />
                                </div>
                                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs">ملخص التذكرة</h4>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[11px] font-bold">
                                    <span className="text-gray-400">تاريخ الإنشاء:</span>
                                    <span className="text-gray-900 dark:text-white">{formatDate(selectedTicket?.created_at || '').split('|')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-bold">
                                    <span className="text-gray-400">الأولوية:</span>
                                    <span className={`px-2 py-0.5 rounded-md ${selectedTicket?.priority === 'urgent' ? 'bg-red-500 text-white' : 'bg-white dark:bg-dark-800 text-primary'}`}>
                                        {getPriorityLabel(selectedTicket?.priority || '')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-bold">
                                    <span className="text-gray-400">عدد الرسائل:</span>
                                    <span className="text-gray-900 dark:text-white">{selectedTicket?.messages?.length || 0} رسالة</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default SupportTickets;
