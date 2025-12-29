import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import AppLayout from './applayout';
import Button from '@/shared/ui/buttons/btn-base';
import InputField from '@/shared/ui/forms/input-field';
import TextareaField from '@/shared/ui/forms/textarea-field';
import SelectField from '@/shared/ui/forms/select-field';
import { formatDate } from '@/shared/utils/helpers';
import { Send, CheckCircle, Clock, AlertCircle, MessageSquare, ShieldCheck, Info, Archive, History, ChevronLeft, Plus, LifeBuoy, Tag, Shield, HelpCircle, Trash2, X } from 'lucide-react';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';

const SupportMessages = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useFeedback();
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    // Get all tickets (filtered by status)
    const { data: ticketsData, isLoading: isLoadingTickets } = useQuery({
        queryKey: ['tenant-tickets', statusFilter],
        queryFn: () => api.get(`/app/support/tickets?status=${statusFilter}`),
        refetchInterval: 10000
    });

    // Get active ticket (primary view)
    const { data: activeTicketData, isLoading: isLoadingActive } = useQuery({
        queryKey: ['active-ticket'],
        queryFn: () => api.get('/app/support/active-ticket'),
        refetchInterval: 5000
    });

    const activeTicket = (activeTicketData as any)?.active_ticket || (activeTicketData as any)?.data?.active_ticket;

    // Logic: If Active Ticket Exists -> Show It. Else -> Show Create Form.
    // Also respect user navigation (viewing archives).
    useEffect(() => {
        if (isLoadingActive) return;

        if (activeTicket) {
            // If there is an active ticket, prioritize it
            if (!selectedTicketId) {
                setSelectedTicketId(activeTicket.id);
                setIsCreating(false);
            }
        } else {
            // No active ticket. If we aren't viewing a specific ticket (e.g. archive), default to create.
            if (!selectedTicketId && !isCreating && statusFilter === 'active') {
                setIsCreating(true);
            }
        }
    }, [activeTicket, isLoadingActive, selectedTicketId, statusFilter]);

    // Ticket Details Query
    const { data: ticketDetails, isLoading: isLoadingChat } = useQuery({
        queryKey: ['tenant-ticket', selectedTicketId],
        queryFn: () => api.get(`/app/support/tickets/${selectedTicketId}`),
        enabled: !!selectedTicketId && !isCreating,
        refetchInterval: 5000
    });

    const currentTicket = isCreating ? null : ((ticketDetails as any)?.data || (ticketDetails as any));

    // Send reply mutation
    const replyMutation = useMutation({
        mutationFn: (data: { message: string }) =>
            api.post(`/app/support/tickets/${selectedTicketId}/reply`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-ticket', selectedTicketId] });
            queryClient.invalidateQueries({ queryKey: ['active-ticket'] });
            setMessage('');
            showSuccess('تم إرسال الرسالة بنجاح');
        },
        onError: () => showError('فشل إرسال الرسالة')
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
            setSelectedTicketId(data.id);
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.error || 'فشل إنشاء التذكرة';
            showError(errorMsg);
        }
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !selectedTicketId) return;
        replyMutation.mutate({ message });
    };

    const getStatusColor = (status: string, isDeleted: boolean) => {
        if (isDeleted) return 'bg-red-100/50 text-red-700 border-red-200';
        switch (status) {
            case 'open': return 'bg-blue-100/50 text-blue-700 border-blue-200';
            case 'in_progress': return 'bg-yellow-100/50 text-yellow-700 border-yellow-200';
            case 'resolved': return 'bg-green-100/50 text-green-700 border-green-200';
            case 'closed': return 'bg-gray-100/50 text-gray-700 border-gray-200';
            default: return 'bg-gray-100/50 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: string, isDeleted: boolean) => {
        if (isDeleted) return 'مؤرشفة';
        const labels: Record<string, string> = {
            'open': 'مفتوحة',
            'in_progress': 'قيد المعالجة',
            'resolved': 'محلولة',
            'closed': 'مغلقة'
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
        <AppLayout
            title="مركز الدعم الفني"
            noPadding={true}
            leftSidebarContent={
                <div className="flex flex-col h-full bg-white dark:bg-dark-900 overflow-hidden -m-6">
                    {/* Filter Sidebar */}
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
                                        onClick={() => {
                                            setStatusFilter(item.id);
                                            setSelectedTicketId(null);
                                            setIsCreating(false);
                                        }}
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

                        <div className="mt-8">
                            <button
                                onClick={() => {
                                    setIsCreating(true);
                                    setSelectedTicketId(null);
                                    setStatusFilter('all');
                                }}
                                className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 ${isCreating || activeTicket
                                    ? 'bg-gray-100 dark:bg-dark-800 text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none'
                                    : 'bg-primary text-white hover:bg-primary/90 shadow-primary/10 active:scale-95'}`}
                                disabled={isCreating || !!activeTicket}
                                title={activeTicket ? 'لا يمكن فتح تذكرة جديدة أثناء وجود تذكرة مفتوحة' : ''}
                            >
                                <Plus className="w-5 h-5" />
                                {activeTicket ? 'لديك تذكرة مفتوحة' : 'إنشاء تذكرة جديدة'}
                            </button>
                        </div>
                    </div>

                    {/* History Section Header */}
                    <div className="px-6 py-4 border-b border-gray-50 dark:border-dark-800 bg-gray-50/5 dark:bg-dark-900/50">
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-600">
                            <History className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">التذاكر الحالية</span>
                        </div>
                    </div>

                    {/* Tickets List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 bg-gray-50/5">
                        {isLoadingTickets ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400 font-bold space-y-3">
                                <div className="animate-spin w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full" />
                                <span className="text-[8px] uppercase tracking-widest font-black">جاري التحميل...</span>
                            </div>
                        ) : ticketsData?.data?.length === 0 ? (
                            <div className="text-center py-16 text-gray-300">
                                <MessageSquare className="w-8 h-8 mx-auto mb-4 opacity-10" />
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">لا توجد تذاكر حالية</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {ticketsData?.data?.map((ticket: any) => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => {
                                            setSelectedTicketId(ticket.id);
                                            setIsCreating(false);
                                        }}
                                        className={`p-5 rounded-[28px] cursor-pointer transition-all border-2 group relative overflow-hidden ${selectedTicketId === ticket.id
                                            ? 'bg-white dark:bg-dark-800 border-primary shadow-2xl shadow-primary/5 scale-[1.02]'
                                            : 'bg-white dark:bg-dark-900 border-transparent hover:border-gray-100 dark:hover:border-dark-800 shadow-sm'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className={`text-[9px] font-black uppercase tracking-widest mb-1 transition-colors ${selectedTicketId === ticket.id ? 'text-primary' : 'text-gray-300'}`}>#{ticket.id}</span>
                                                <h4 className={`font-black text-[13px] line-clamp-1 transition-colors ${selectedTicketId === ticket.id ? 'text-primary' : 'text-gray-900 group-hover:text-primary'}`}>
                                                    {ticket.subject}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100/50">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span className="text-[10px] font-bold text-gray-500 truncate">{formatDate(ticket.created_at).split('|')[1]?.trim()}</span>
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

                    {/* Sidebar Info */}
                    {!isCreating && (
                        <div className="p-4 border-t border-gray-50 opacity-60 bg-gray-50/30">
                            <div className="bg-blue-50/50 p-3 rounded-2xl border border-dashed border-blue-100/50">
                                <div className="flex items-center gap-1.5 mb-1.5 text-blue-600">
                                    <Info className="w-3 h-3" />
                                    <span className="text-[8px] font-black uppercase">اتفاقية الخدمة</span>
                                </div>
                                <p className="text-[9px] text-blue-700/80 font-bold leading-relaxed px-1">
                                    يتم الاحتفاظ بجميع تذاكرك هنا للرجوع إليها كأرشيف دائم.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            <div className="flex flex-col h-full bg-gray-50/20 overflow-hidden relative">
                {isCreating ? (
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-12 text-right">
                        <div className="w-full h-full flex flex-col">
                            {/* Form Header */}
                            <div className="flex items-center gap-6 mb-8 px-2">
                                <div className="p-4 bg-white dark:bg-dark-900 rounded-[24px] shadow-lg shadow-primary/5 text-primary border border-gray-100 dark:border-dark-800">
                                    <LifeBuoy className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">فتح تذكرة دعم جديدة</h2>
                                    <p className="text-gray-500 font-bold text-sm">قم بملء النموذج أدناه لبدء محادثة فورية مع فريق الدعم المتخصص</p>
                                </div>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                createTicketMutation.mutate({
                                    subject: formData.get('subject') as string,
                                    message: formData.get('message') as string,
                                    priority: formData.get('priority') as string
                                });
                            }} className="flex-1 flex flex-col bg-white dark:bg-dark-900 rounded-[40px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-800 overflow-hidden">

                                <div className="flex-1 p-8 lg:p-12 space-y-8 overflow-y-auto no-scrollbar">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        <div className="lg:col-span-8 space-y-8">
                                            {/* Subject Field */}
                                            <InputField
                                                label="موضوع التذكرة"
                                                name="subject"
                                                required
                                                placeholder="لدي مشكلة في..."
                                                icon={Tag}
                                            />

                                            {/* Priority Selection - Visual Cards */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2 group-focus-within:text-primary transition-colors">مستوى الأهمية</label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {[
                                                        { id: 'low', label: 'عادية', color: 'bg-blue-50 text-blue-600 border-blue-100', hover: 'hover:bg-blue-100' },
                                                        { id: 'medium', label: 'متوسطة', color: 'bg-gray-50 text-gray-600 border-gray-100', hover: 'hover:bg-gray-100' },
                                                        { id: 'high', label: 'عالية', color: 'bg-orange-50 text-orange-600 border-orange-100', hover: 'hover:bg-orange-100' },
                                                        { id: 'urgent', label: 'حرجة', color: 'bg-red-50 text-red-600 border-red-100', hover: 'hover:bg-red-100' }
                                                    ].map((p) => (
                                                        <label key={p.id} className="cursor-pointer relative group">
                                                            <input type="radio" name="priority" value={p.id} defaultChecked={p.id === 'medium'} className="peer sr-only" />
                                                            <div className={`
                                                                flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all duration-300
                                                                bg-white border-gray-100 text-gray-400 hover:border-gray-200
                                                                peer-checked:border-current peer-checked:shadow-lg peer-checked:scale-[1.02]
                                                                ${p.id === 'low' ? 'peer-checked:text-blue-600 peer-checked:bg-blue-50/30 peer-checked:border-blue-200' : ''}
                                                                ${p.id === 'medium' ? 'peer-checked:text-gray-700 peer-checked:bg-gray-50 peer-checked:border-gray-300' : ''}
                                                                ${p.id === 'high' ? 'peer-checked:text-orange-500 peer-checked:bg-orange-50/30 peer-checked:border-orange-200' : ''}
                                                                ${p.id === 'urgent' ? 'peer-checked:text-red-500 peer-checked:bg-red-50/30 peer-checked:border-red-200' : ''}
                                                            `}>
                                                                <span className="text-sm font-black uppercase tracking-tight">{p.label}</span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <TextareaField
                                                label="تفاصيل المشكلة"
                                                name="message"
                                                required
                                                placeholder="يرجى وصف المشكلة بالتفصيل..."
                                                icon={HelpCircle}
                                                className="min-h-[200px]"
                                            />
                                        </div>

                                        {/* Info Sidebar (Within Form) */}
                                        <div className="lg:col-span-4 space-y-6">
                                            <div className="p-6 rounded-3xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20">
                                                <div className="flex items-center gap-3 mb-4 text-primary">
                                                    <ShieldCheck className="w-6 h-6" />
                                                    <h4 className="font-black text-sm">ضمان الجودة</h4>
                                                </div>
                                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                                    فريق الدعم لدينا يعمل على مدار الساعة لضمان حل المشاكل التقنية في أسرع وقت ممكن. متوسط وقت الرد هو 15 دقيقة.
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-primary/60 dark:text-primary/40">
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span>دعم فني متخصص</span>
                                                </div>
                                            </div>

                                            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-dark-800/50 border border-gray-100 dark:border-dark-700">
                                                <div className="flex items-center gap-3 mb-4 text-gray-400 dark:text-gray-500">
                                                    <LifeBuoy className="w-6 h-6" />
                                                    <h4 className="font-black text-sm">مركز المساعدة</h4>
                                                </div>
                                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                                                    يمكنك أيضاً مراجعة قسم الأسئلة الشائعة، قد تجد حلاً فورياً لمشكلتك هناك قبل فتح تذكرة.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Footer */}
                                <div className="p-8 bg-gray-50/50 dark:bg-dark-900 border-t border-gray-100 dark:border-dark-800 flex items-center justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-8 py-4 rounded-3xl font-black text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all text-sm"
                                    >
                                        إلغاء الأمر
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createTicketMutation.isPending}
                                        className="px-10 py-4 bg-primary text-white rounded-3xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-70 disabled:grayscale"
                                    >
                                        {createTicketMutation.isPending ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>جاري الإنشاء...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>إرسال التذكرة</span>
                                                <Send className="w-4 h-4 -rotate-90" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : !selectedTicketId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 p-10 text-center bg-gray-50/20 dark:bg-dark-950/20">
                        {statusFilter === 'archived' ? (
                            <>
                                <Archive className="w-20 h-20 opacity-5 mb-6" />
                                <h3 className="text-xl font-black text-gray-300 dark:text-gray-700">سجل الأرشيف</h3>
                                <p className="mt-2 text-sm max-w-sm">اختر تذكرة مؤرشفة لمراجعة تفاصيل المحادثة السابقة.</p>
                            </>
                        ) : (
                            <>
                                <History className="w-20 h-20 opacity-5 mb-6" />
                                <h3 className="text-xl font-black text-gray-300 dark:text-gray-700">اختر تذكرة لمشاهدة التفاصيل</h3>
                                <p className="mt-2 text-sm max-w-sm">تاريخ مراسلاتك مع الدعم الفني متاح هنا دائماً، حتى بعد إغلاق التذاكر.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-500">
                        {isLoadingChat && !currentTicket ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">جاري تحميل البيانات...</p>
                            </div>
                        ) : currentTicket ? (
                            <>
                                {/* Chat Header */}
                                <div className="bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-dark-800 p-4 flex justify-between items-center shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(currentTicket.status, !!currentTicket.deleted_at).split(' ')[0].replace('/50', '')}`} />
                                        <div className="space-y-0.5">
                                            <h3 className="font-black text-sm text-gray-900 dark:text-white line-clamp-1 max-w-[200px] md:max-w-md">{currentTicket.subject}</h3>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                                                <span>#{currentTicket.id}</span>
                                                <span>•</span>
                                                <span>{getStatusLabel(currentTicket.status, !!currentTicket.deleted_at)}</span>
                                            </div>
                                        </div>
                                    </div>


                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-gray-50/30 no-scrollbar">
                                    <div className="space-y-10">
                                        {currentTicket?.messages?.map((msg: any) => (
                                            <div
                                                key={msg.id}
                                                className={`flex animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] rounded-[32px] px-8 py-6 shadow-sm relative transition-all hover:shadow-md ${msg.is_admin_reply
                                                        ? 'bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-100 border-2 border-gray-100 dark:border-dark-700 rounded-tl-none ring-1 ring-gray-900/5 dark:ring-white/5'
                                                        : 'bg-gradient-to-br from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70 text-white rounded-tr-none shadow-xl shadow-primary/30'
                                                        }`}
                                                >
                                                    {msg.is_admin_reply && (
                                                        <div className="flex items-center gap-2 mb-4 text-right">
                                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <ShieldCheck className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">دعم النظام</span>
                                                        </div>
                                                    )}
                                                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-bold text-right">{msg.message}</p>
                                                    <div className={`text-[9px] mt-4 flex items-center justify-end gap-3 font-black uppercase tracking-tighter ${msg.is_admin_reply ? 'text-gray-400 dark:text-gray-500' : 'text-primary-foreground/70'}`}>
                                                        <div className="flex items-center gap-1.5 order-2">
                                                            {msg.is_admin_reply ? (
                                                                <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                                                            ) : (
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                                                    تم الإرسال
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
                                </div>

                                {/* Closed Ticket Warning */}
                                {currentTicket?.status === 'closed' && !currentTicket?.deleted_at && (
                                    <div className="px-8 py-4 bg-yellow-50 dark:bg-yellow-900/20 border-y border-yellow-100 dark:border-yellow-800/30">
                                        <div className="flex items-center gap-3 text-yellow-800 dark:text-yellow-300">
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            <p className="text-sm font-bold">
                                                هذه التذكرة مغلقة، لا يمكنك إرسال رسائل جديدة. إذا كنت بحاجة إلى مساعدة إضافية، يرجى فتح تذكرة جديدة.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Chat Input */}
                                {currentTicket?.deleted_at ? (
                                    <div className="p-8 bg-gray-50 dark:bg-dark-950 border-t border-gray-100 dark:border-dark-800 flex items-center justify-center gap-4">
                                        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-widest">هذه التذكرة مؤرشفة للقراءة فقط</p>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-white dark:bg-dark-900 border-t border-gray-100 dark:border-dark-800 shrink-0">
                                        <form onSubmit={handleSendMessage} className="flex gap-4">
                                            <div className="flex-1">
                                                <InputField
                                                    label=""
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="اكتب رسالتك لمدير النظام هنا..."
                                                    disabled={currentTicket?.status === 'closed' || replyMutation.isPending}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!message.trim() || replyMutation.isPending || currentTicket?.status === 'closed'}
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
                            </>
                        ) : null}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default SupportMessages;
