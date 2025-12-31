import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import AppLayout from './applayout';
import InputField from '@/shared/ui/forms/input-field';
import TextareaField from '@/shared/ui/forms/textarea-field';
import { formatDate } from '@/shared/utils/helpers';
import { Send, CheckCircle, Clock, AlertCircle, MessageSquare, ShieldCheck, Info, Archive, History, Plus, LifeBuoy, Tag, HelpCircle, X, Search, Filter, SendHorizontal, Shield, Loader2 } from 'lucide-react';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import Modal from '@/shared/ui/modals/modal';
import { useAction } from '@/shared/contexts/action-context';

const SupportMessages = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useFeedback();
    const { setPrimaryAction } = useAction();
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    // Get all tickets (filtered by status)
    const { data: ticketsData, isLoading: isLoadingTickets } = useQuery({
        queryKey: ['tenant-tickets', statusFilter],
        queryFn: () => api.get(`/app/support/tickets?status=${statusFilter}`),
        refetchInterval: 10000
    });

    // Support Notifications Count (for the header, though already there, we use it for context)
    const { data: activeTicketData } = useQuery({
        queryKey: ['active-ticket'],
        queryFn: () => api.get('/app/support/active-ticket'),
        refetchInterval: 5000
    });

    const activeTicket = (activeTicketData as any)?.active_ticket || (activeTicketData as any)?.data?.active_ticket;

    // Set Primary Action
    useEffect(() => {
        setPrimaryAction({
            label: 'تذكرة جديدة',
            icon: Plus,
            onClick: () => setIsCreating(true),
            disabled: !!activeTicket || isCreating
        });
        return () => setPrimaryAction(null);
    }, [activeTicket, isCreating, setPrimaryAction]);

    // Ticket Details Query
    const { data: ticketDetails, isLoading: isLoadingChat, error: chatError } = useQuery({
        queryKey: ['tenant-ticket', selectedTicketId],
        queryFn: async () => {
            if (!selectedTicketId) return null;
            return await api.get(`/app/support/tickets/${selectedTicketId}`) as any;
        },
        enabled: !!selectedTicketId,
        refetchInterval: 5000,
        retry: 1
    });

    // Handle Query Errors
    useEffect(() => {
        if (chatError && selectedTicketId) {
            showError('فشل تحميل بيانات التذكرة. قد تكون محذوفة أو غير موجودة.');
            setSelectedTicketId(null);
        }
    }, [chatError, selectedTicketId, showError]);

    // Send reply mutation
    const replyMutation = useMutation({
        mutationFn: (data: { message: string }) =>
            api.post(`/app/support/tickets/${selectedTicketId}/reply`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-ticket', selectedTicketId] });
            queryClient.invalidateQueries({ queryKey: ['active-ticket'] });
            setChatMessage('');
            showSuccess('تم إرسال الرد بنجاح');
        },
        onError: () => showError('فشل إرسال الرد')
    });

    // Create ticket mutation
    const createTicketMutation = useMutation({
        mutationFn: (data: { subject: string; message: string; priority: string }) =>
            api.post('/app/support/tickets', data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['active-ticket'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-tickets'] });
            showSuccess('تم إنشاء التذكرة بنجاح');
            setIsCreating(false);
            setSelectedTicketId(data.id || data.data?.id);
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.error || 'فشل إنشاء التذكرة';
            showError(errorMsg);
        }
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim() || !selectedTicketId) return;
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

    const currentTicket = ((ticketDetails as any)?.data || (ticketDetails as any));

    return (
        <AppLayout
            title="مركز الدعم الفني"
            icon={MessageSquare}
            noPadding={false}
        >
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

                {/* Filters Section - Harmonized with Admin */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-dark-900 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <Filter className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-gray-900 dark:text-white">تصفية رسائلك</h3>
                            <p className="text-xs font-bold text-gray-400">تابع حالة تذاكر الدعم الخاصة بك</p>
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
                {isLoadingTickets && !ticketsData ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-dark-900 rounded-[3rem] border border-gray-100 dark:border-white/5 border-dashed">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-6" />
                        <span className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">جاري جلب تفاصيل الدعم...</span>
                    </div>
                ) : (ticketsData as any)?.data?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-dark-900 rounded-[3rem] border border-gray-100 dark:border-white/5 border-dashed text-center">
                        <div className="p-8 bg-gray-50 dark:bg-dark-800 rounded-[2.5rem] mb-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                            <MessageSquare className="w-20 h-20" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-300">لا توجد طلبات دعم حالياً</h3>
                        <p className="text-gray-400 font-bold mt-2">يمكنك فتح تذكرة جديدة للحصول على مساعدة من فريقنا</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(ticketsData as any)?.data?.map((ticket: any) => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicketId(ticket.id)}
                                className="group relative bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <span className="px-3 py-1 rounded-full bg-gray-50 dark:bg-dark-800 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-white/5">
                                        #{ticket.id}
                                    </span>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${getStatusColor(ticket.status, !!ticket.deleted_at)}`}>
                                        {getStatusLabel(ticket.status, !!ticket.deleted_at)}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <h4 className="text-lg font-black text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                        {ticket.subject}
                                    </h4>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-[10px] font-black tracking-wider uppercase">{formatDate(ticket.created_at).split('|')[1]?.trim()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-white/5">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${ticket.priority === 'urgent' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <AlertCircle className="w-3 h-3" />
                                        {getPriorityLabel(ticket.priority)}
                                    </div>
                                    <div className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform">
                                        عرض المحادثة ←
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Support Conversation Modal */}
            <Modal
                isOpen={!!selectedTicketId}
                onClose={() => setSelectedTicketId(null)}
                title="محادثة الدعم الفني"
                size="full"
            >
                <div className="flex flex-col lg:flex-row h-full gap-8 bg-gray-50/20 dark:bg-dark-950/20">
                    <div className="flex-1 flex flex-col bg-white dark:bg-dark-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden min-h-0">
                        {/* Modal Header */}
                        <div className="p-6 bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0 z-20">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-lg shrink-0">
                                    <LifeBuoy className="w-8 h-8 text-primary" />
                                </div>
                                <div className="flex flex-col gap-1 text-right">
                                    <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight">{currentTicket?.subject}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">تذكرة رقم #{currentTicket?.id}</span>
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(currentTicket?.status || '', !!currentTicket?.deleted_at)}`}>
                                            {getStatusLabel(currentTicket?.status || '', !!currentTicket?.deleted_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-10 py-12 space-y-12 no-scrollbar bg-gray-50/10">
                            {isLoadingChat && !currentTicket ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                                    <span className="text-xs font-black uppercase tracking-widest tracking-[0.2em]">تحميل الرسائل...</span>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {currentTicket?.messages?.map((msg: any) => (
                                        <div key={msg.id} className={`flex animate-in fade-in slide-in-from-bottom-4 duration-700 ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`flex flex-col max-w-[85%] lg:max-w-[75%] gap-2 ${msg.is_admin_reply ? 'items-start' : 'items-end'}`}>
                                                <div className="flex items-end gap-3 px-2">
                                                    {msg.is_admin_reply && (
                                                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 border-4 border-white dark:border-dark-900">
                                                            <ShieldCheck className="w-5 h-5 text-white" />
                                                        </div>
                                                    )}
                                                    <div className={`relative rounded-[2rem] px-8 py-5 shadow-sm transition-all hover:shadow-xl ${msg.is_admin_reply
                                                        ? 'bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 border-2 border-primary/20 rounded-bl-none'
                                                        : 'bg-primary text-white rounded-br-none shadow-primary/20'
                                                        }`}>
                                                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-bold">{msg.message}</p>
                                                    </div>
                                                </div>
                                                <div className="px-4">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{formatDate(msg.created_at, true)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-10 bg-white dark:bg-dark-900 border-t border-gray-100 dark:border-white/5 shrink-0">
                            {currentTicket?.deleted_at ? (
                                <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border-2 border-dashed border-red-100 dark:border-red-900/20 text-center text-red-600 font-black text-xs uppercase tracking-widest">
                                    هذه التذكرة مؤرشفة ولا يمكن الرد عليها حالياً
                                </div>
                            ) : currentTicket?.status === 'closed' ? (
                                <div className="p-6 bg-gray-50 dark:bg-dark-800 rounded-[2rem] text-center text-gray-500 font-black text-xs uppercase tracking-widest">
                                    هذه التذكرة مغلقة. يرجى فتح تذكرة جديدة إذا كنت بحاجة للمزيد من المساعدة.
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="flex gap-4">
                                    <div className="flex-1">
                                        <InputField
                                            label=""
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            placeholder="اكتب ردك هنا..."
                                            disabled={replyMutation.isPending}
                                            className="bg-gray-50 dark:bg-dark-800 border-none shadow-none focus-within:ring-4 ring-primary/5 h-[64px] rounded-[1.75rem] px-8 text-base font-bold"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!chatMessage.trim() || replyMutation.isPending}
                                        className="h-[64px] w-[64px] flex items-center justify-center bg-primary text-white rounded-[1.75rem] hover:bg-primary/90 disabled:opacity-30 transition-all shadow-2xl shadow-primary/30 group active:scale-95 shrink-0"
                                    >
                                        {replyMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <SendHorizontal className="w-6 h-6 -rotate-90" />}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Ticket Summary Sidebar */}
                    <div className="lg:w-96 flex flex-col gap-6 shrink-0">
                        <div className="bg-primary/5 rounded-[2.5rem] border-2 border-primary/10 p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-dark-900 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Info className="w-6 h-6 text-primary" />
                                </div>
                                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs">ملخص التذكرة</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[11px] font-bold">
                                    <span className="text-gray-400">تاريخ الإنشاء:</span>
                                    <span className="text-gray-900 dark:text-white">{formatDate(currentTicket?.created_at || '').split('|')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-bold">
                                    <span className="text-gray-400">الأولوية:</span>
                                    <span className={`px-2 py-0.5 rounded-md ${currentTicket?.priority === 'urgent' ? 'bg-red-500 text-white' : 'bg-primary/10 text-primary'}`}>
                                        {getPriorityLabel(currentTicket?.priority || '')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 space-y-4">
                            <h4 className="font-black text-sm text-gray-900 dark:text-white">تعليمات الدعم</h4>
                            <p className="text-xs font-bold text-gray-500 leading-relaxed">
                                يرجى شرح استفسارك بوضوح لضمان الحصول على أفضل مساعدة ممكنة من فريقنا التقني.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Create Ticket Modal */}
            <Modal
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                title="فتح تذكرة دعم جديدة"
                size="lg"
            >
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    createTicketMutation.mutate({
                        subject: formData.get('subject') as string,
                        message: formData.get('message') as string,
                        priority: formData.get('priority') as string
                    });
                }} className="space-y-8 p-2">
                    <InputField label="موضوع التذكرة" name="subject" required placeholder="لدي مشكلة في..." icon={Tag} />
                    <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">مستوى الأهمية</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['low', 'medium', 'high', 'urgent'].map((id) => (
                                <label key={id} className="cursor-pointer">
                                    <input type="radio" name="priority" value={id} defaultChecked={id === 'medium'} className="peer sr-only" />
                                    <div className="flex items-center justify-center p-4 rounded-2xl border-2 bg-white dark:bg-dark-800 border-gray-100 dark:border-white/5 text-gray-400 peer-checked:border-primary peer-checked:text-primary transition-all font-black text-xs uppercase">
                                        {getPriorityLabel(id)}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <TextareaField label="تفاصيل المشكلة" name="message" required placeholder="يرجى وصف المشكلة بالتفصيل..." icon={HelpCircle} className="min-h-[150px]" />
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-2xl font-black text-gray-500 text-xs">إلغاء</button>
                        <button type="submit" disabled={createTicketMutation.isPending} className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-primary/10 flex items-center gap-2">
                            {createTicketMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 -rotate-90" /><span>إرسال التذكرة</span></>}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
};

export default SupportMessages;
