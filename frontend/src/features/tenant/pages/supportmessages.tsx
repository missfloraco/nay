import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '@/shared/services/api';
import AppLayout from '@/features/tenant/pages/applayout';
import InputField from '@/shared/ui/forms/input-field';
import TextareaField from '@/shared/ui/forms/textarea-field';
import { formatDate } from '@/shared/utils/helpers';
import { convertImageToWebP } from '@/shared/utils/image-helpers';
import { Plus, MessageSquare, ArrowUp, Search, Filter, RefreshCw, SendHorizontal, Paperclip, X, Clock, Shield, LifeBuoy, ShieldCheck, Image as ImageIcon, CheckCircle, Archive, Link, Loader2, AlertCircle, Info, Tag, HelpCircle, Send } from 'lucide-react';
import { useNotifications } from '@/shared/contexts/notification-context';
import Modal from '@/shared/ui/modals/modal';
import { useAction } from '@/shared/contexts/action-context';
import { Toolbar } from '@/shared/components/toolbar';
import ImagePreview from '@/shared/ui/image-preview';


const SupportMessages = () => {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const { showSuccess, showError, fetchNotifications } = useNotifications();
    const { setPrimaryAction } = useAction();
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(() => {
        const id = searchParams.get('ticket_id');
        return id ? parseInt(id) : null;
    });
    const [chatMessage, setChatMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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


    // Create ticket mutation
    const createTicketMutation = useMutation({
        mutationFn: (data: { subject: string; message: string; priority: string }) =>
            api.post('/app/support/tickets', data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['active-ticket'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-tickets'] });
            fetchNotifications(); // Refresh Bell Notifications
            showSuccess('تم إنشاء التذكرة بنجاح');
            setIsCreating(false);
            setSelectedTicketId(data.id || data.data?.id);
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.error || 'فشل إنشاء التذكرة';
            showError(errorMsg);
        }
    });

    const activeTicket = (activeTicketData as any)?.active_ticket || (activeTicketData as any)?.data?.active_ticket;

    // Set Primary Action
    useEffect(() => {
        if (isCreating) {
            setPrimaryAction({
                label: createTicketMutation.isPending ? 'جاري الإرسال...' : 'إرسال التذكرة والمتابعة',
                icon: Send,
                loading: createTicketMutation.isPending,
                type: 'submit',
                form: 'create-ticket-form',
                secondaryAction: {
                    label: 'تراجع',
                    onClick: () => setIsCreating(false)
                }
            });
        } else {
            setPrimaryAction({
                label: 'فتح تذكرة دعم جديدة',
                icon: Plus,
                onClick: () => setIsCreating(true),
                disabled: !!activeTicket
            });
        }
        return () => setPrimaryAction(null);
    }, [activeTicket, isCreating, createTicketMutation.isPending, setPrimaryAction]);

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
            const is404 = (chatError as any)?.response?.status === 404;
            if (is404) {
                showError('لم يتم العثور على هذه التذكرة، قد تكون حذفت نهائياً.');
            } else {
                showError('فشل تحميل بيانات التذكرة.');
            }
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
            // Optional: Scroll to bottom would be nice but we'd need a ref
        },
        onError: () => showError('فشل إرسال الرد')
    });

    // Update URL when ticket changes
    useEffect(() => {
        if (selectedTicketId) {
            setSearchParams({ ticket_id: selectedTicketId.toString() }, { replace: true });
        } else {
            searchParams.delete('ticket_id');
            setSearchParams(searchParams, { replace: true });
        }
    }, [selectedTicketId, setSearchParams, searchParams]);

    const uploadImageMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('image', file);

            const response: any = await api.post('/app/support/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.url;
        },
        onSuccess: (url) => {
            setPendingImage(url);
            setIsUploading(false);
        },
        onError: () => {
            showError('فشل رفع الصورة');
            setIsUploading(false);
        }
    });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processFile(file);
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) processFile(file);
                e.preventDefault();
            }
        }
    };

    const processFile = async (file: File) => {
        setIsUploading(true);
        try {
            const webpFile = await convertImageToWebP(file);
            uploadImageMutation.mutate(webpFile);
        } catch (error) {
            console.error('WebP conversion failed', error);
            showError('فشل معالجة الصورة');
            setIsUploading(false);
        }
    };


    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicketId) return;

        if (pendingImage) {
            replyMutation.mutate({ message: pendingImage });
            setPendingImage(null);
        }

        if (chatMessage.trim()) {
            replyMutation.mutate({ message: chatMessage });
            setChatMessage('');
        }
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

    const highlightedRef = useRef<HTMLDivElement>(null);

    // Handle scroll to highlighted
    useEffect(() => {
        if ((ticketsData as any)?.data?.length > 0 && selectedTicketId && !isLoadingTickets) {
            const timer = setTimeout(() => {
                highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [(ticketsData as any)?.data?.length, selectedTicketId, isLoadingTickets]);

    return (
        <AppLayout
            title="مركز الدعم الفني"
            icon={MessageSquare}
            noPadding={false}
            toolbar={
                <Toolbar
                    activeValue={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { id: 'all', label: 'الكل', icon: MessageSquare, color: 'text-gray-400' },
                        { id: 'open', label: 'مفتوحة', icon: AlertCircle, color: 'text-blue-500' },
                        { id: 'closed', label: 'مغلقة', icon: X, color: 'text-gray-500' },
                        { id: 'archived', label: 'الأرشيف', icon: Archive, color: 'text-red-400' },
                    ]}
                />
            }
        >
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

                {/* Ticket Grid List */}
                {isLoadingTickets && !ticketsData ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-transparent">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                    </div>

                ) : (ticketsData as any)?.data?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center animate-in fade-in zoom-in duration-500">
                        <div className="relative mb-8 group cursor-pointer" onClick={() => setIsCreating(true)}>
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative p-10 bg-gradient-to-tr from-white to-gray-50 dark:from-dark-900 dark:to-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl shadow-primary/5 group-hover:scale-105 transition-transform duration-500">
                                <LifeBuoy className="w-24 h-24 text-primary opacity-80" strokeWidth={1.5} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-lg border-4 border-white dark:border-dark-950 animate-bounce delay-75">
                                <Plus className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">كيف يمكننا مساعدتك اليوم؟</h3>
                        <p className="text-gray-400 font-bold max-w-sm mx-auto leading-relaxed mb-10">
                            لا توجد لديك تذاكر دعم مفتوحة حالياً. إذا واجهت أي مشكلة أو كان لديك استفسار، فريقنا جاهز للمساعدة.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(ticketsData as any)?.data?.map((ticket: any) => {
                            const isHighlighted = selectedTicketId === ticket.id;
                            return (
                                <div
                                    key={ticket.id}
                                    ref={isHighlighted ? highlightedRef : null}
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                    className={`group relative bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border ${isHighlighted ? 'border-primary shadow-2xl shadow-primary/20 scale-[1.02] ring-2 ring-primary/5' : 'border-gray-100 dark:border-white/5 shadow-sm'} hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden`}
                                >
                                    {isHighlighted && (
                                        <div className="absolute top-0 right-0 w-2 h-full bg-primary" />
                                    )}

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
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Support Conversation Modal */}
            <Modal
                isOpen={!!selectedTicketId}
                onClose={() => setSelectedTicketId(null)}
                title="محادثة الدعم الفني"
                variant="content-fit"
            >
                <div className="flex flex-col lg:flex-row gap-8 bg-gray-50/20 dark:bg-dark-950/20 min-h-full">
                    {/* Chat Content (Left/Center) - Modernized 2026 */}
                    <div className="flex-1 flex flex-col bg-white/60 dark:bg-dark-900/60 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden min-h-0 relative">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                        </div>

                        {/* Modal Header - Glassmorphic */}
                        <div className="p-6 bg-white/40 dark:bg-dark-900/40 backdrop-blur-md border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0 z-20 relative">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-dark-800 dark:to-dark-700 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-dark-900">
                                        <LifeBuoy className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-dark-900 rounded-full shadow-sm animate-pulse" />
                                </div>
                                <div className="flex flex-col gap-1.5 text-right">
                                    <h3 className="font-black text-xl text-gray-900 dark:text-white leading-none tracking-tight">{currentTicket?.subject}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تذكرة #{currentTicket?.id}</span>
                                        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-sm ${getStatusColor(currentTicket?.status || '', !!currentTicket?.deleted_at)}`}>
                                            {getStatusLabel(currentTicket?.status || '', !!currentTicket?.deleted_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages - Modern Flow */}
                        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar relative z-10 scroll-smooth">
                            {isLoadingChat && !currentTicket ? (
                                <div className="flex flex-col items-center justify-center h-full gap-6 text-gray-400 animate-pulse">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-dark-800" />
                                    <div className="w-32 h-4 rounded-full bg-gray-200 dark:bg-dark-800" />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {currentTicket?.messages?.map((msg: any) => (
                                        <div key={msg.id} className={`flex w-full ${msg.is_admin_reply ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2 duration-500`}>
                                            <div className={`flex flex-col max-w-[80%] ${msg.is_admin_reply ? 'items-start' : 'items-end'}`}>
                                                <div className={`
                                                    group relative px-6 py-4 shadow-sm transition-all duration-300 hover:shadow-md
                                                    ${!msg.is_admin_reply
                                                        ? 'bg-gradient-to-tr from-primary to-purple-600 text-white rounded-[1.5rem] rounded-tl-none'
                                                        : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-white/5 rounded-[1.5rem] rounded-tr-none'
                                                    }
                                                `}>
                                                    {msg.message.startsWith('http') && (msg.message.match(/\.(jpeg|jpg|gif|png|webp)$/i) || msg.message.includes('/storage/')) ? (
                                                        <img
                                                            src={msg.message}
                                                            alt="Attachment"
                                                            className="max-w-full h-auto rounded-xl border-2 border-white/20 shadow-sm cursor-pointer hover:scale-[1.02] transition-transform"
                                                            onClick={() => setPreviewImage(msg.message)}
                                                        />
                                                    ) : (
                                                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium" dir="auto">{msg.message}</p>
                                                    )}

                                                    {/* Timestamp inside bubble */}
                                                    <div className={`absolute bottom-1 ${!msg.is_admin_reply ? '-left-12' : '-right-12'} flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                        <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">{formatDate(msg.created_at).split('|')[1]}</span>
                                                    </div>
                                                </div>

                                                <div className={`flex items-center gap-2 mt-2 px-2 opacity-60 ${msg.is_admin_reply ? 'flex-row' : 'flex-row-reverse'}`}>
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        {msg.is_admin_reply ? 'الدعم الفني' : 'أنت'} • {formatDate(msg.created_at, true).split('|')[1]}
                                                    </span>
                                                    {!msg.is_admin_reply && (
                                                        <div className="flex items-center">
                                                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                        </div>
                                                    )}
                                                    {msg.is_admin_reply && <ShieldCheck className="w-3 h-3 text-primary" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Chat Input - Floating Pill */}
                        <div className="p-6 bg-transparent shrink-0 relative z-20">
                            {currentTicket?.deleted_at ? (
                                <div className="p-6 rounded-[2rem] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-center">
                                    <div className="text-red-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Archive className="w-4 h-4" />
                                        هذه التذكرة مؤرشفة
                                    </div>
                                </div>
                            ) : currentTicket?.status === 'closed' ? (
                                <div className="p-6 rounded-[2rem] bg-gray-50 dark:bg-dark-800 border border-gray-100 dark:border-white/5 text-center">
                                    <div className="text-gray-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        هذه التذكرة مغلقة
                                    </div>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSendMessage}
                                    className="relative group"
                                    onPaste={handlePaste}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                    <div className="relative flex flex-col bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-[2rem] shadow-2xl shadow-primary/5 p-1">

                                        {/* Pending Image Preview - Inside Container */}
                                        {pendingImage && (
                                            <div className="p-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="relative inline-block group/pending">
                                                    <img src={pendingImage} alt="Pending" className="w-32 h-32 object-cover rounded-2xl border-2 border-primary/20 shadow-lg" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setPendingImage(null)}
                                                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-10"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover/pending:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 p-1">
                                            <div className="flex-1">
                                                <InputField
                                                    label=""
                                                    value={chatMessage}
                                                    onChange={(e) => setChatMessage(e.target.value)}
                                                    placeholder="اكتب رسالتك للمساعدة... (يمكنك لصق الصور مباشرة)"
                                                    disabled={replyMutation.isPending}
                                                    className="bg-transparent border-none shadow-none focus:ring-0 p-4 text-base font-medium placeholder:text-gray-400 h-14"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Attachment Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    className="w-12 h-12 flex items-center justify-center rounded-[1.5rem] text-gray-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-dark-700 transition-all disabled:opacity-50"
                                                >
                                                    {isUploading ? (
                                                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6" />
                                                    )}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={(!chatMessage.trim() && !pendingImage) || replyMutation.isPending}
                                                    className="w-14 h-14 flex items-center justify-center bg-gradient-to-tr from-primary to-purple-600 text-white rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none disabled:grayscale"
                                                >
                                                    {replyMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowUp className="w-6 h-6" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>


                </div>
            </Modal>

            {/* Create Ticket Modal */}
            <Modal
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                title="فتح تذكرة دعم جديدة"
                variant="content-fit"
            >
                <form
                    id="create-ticket-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        createTicketMutation.mutate({
                            subject: formData.get('subject') as string,
                            message: formData.get('message') as string,
                            priority: formData.get('priority') as string
                        });
                    }} className="flex flex-col gap-10"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Right Column: Basic Information */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 px-2">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <Tag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-gray-900 dark:text-white leading-none">تفاصيل الطلب</h4>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">حدد موضوع التذكرة ومستوى الأهمية</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <InputField
                                        label="موضوع التذكرة"
                                        name="subject"
                                        required
                                        placeholder="مثلاً: مشكلة في تفعيل خطة الاشتراك"
                                        icon={Tag}
                                        className="bg-gray-50/50"
                                    />
                                    <p className="text-[10px] font-bold text-gray-400 px-2 leading-relaxed italic">
                                        يرجى كتابة عنوان مختصر وواضح يصف المشكلة التي تواجهها.
                                    </p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-2">مستوى الأهمية التقنية</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'low', label: 'منخفضة', color: 'bg-emerald-500' },
                                            { id: 'medium', label: 'متوسطة', color: 'bg-blue-500' },
                                            { id: 'high', label: 'عالية', color: 'bg-orange-500' },
                                            { id: 'urgent', label: 'عاجلة جداً', color: 'bg-red-500' }
                                        ].map((p) => (
                                            <label key={p.id} className="cursor-pointer group">
                                                <input type="radio" name="priority" value={p.id} defaultChecked={p.id === 'medium'} className="peer sr-only" />
                                                <div className="relative p-5 rounded-[1.8rem] border-2 bg-white dark:bg-dark-800 border-gray-100 dark:border-white/5 peer-checked:border-primary transition-all duration-300 shadow-sm overflow-hidden group-hover:scale-[1.02] active:scale-95">
                                                    <div className={`absolute top-0 right-0 w-1.5 h-full ${p.color} opacity-20 peer-checked:opacity-100`} />
                                                    <div className="flex flex-col gap-1 pr-2">
                                                        <span className="text-[11px] font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">{p.label}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Priority: {p.id}</span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 px-2 leading-relaxed">
                                        سيتم ترتيب أولوية الرد من قبل فريقنا بناءً على المستوى الذي تختاره.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Left Column: Message & Instructions */}
                        <div className="space-y-8 flex flex-col">
                            <div className="flex items-center gap-4 px-2">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-gray-900 dark:text-white leading-none">محتوى الرسالة</h4>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">اشرح لنا التفاصيل ليتمكن الفريق من مساعدتك</p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col space-y-6">
                                <div className="flex-1 flex flex-col space-y-2 group">
                                    <TextareaField
                                        label="وصف المشكلة بالتفصيل"
                                        name="message"
                                        required
                                        placeholder="اكتب هنا كافة الخطوات التي أدت للمشكلة، وأي معلومات تقنية قد تفيدنا..."
                                        icon={HelpCircle}
                                        className="flex-1 min-h-[220px] bg-gray-50/50"
                                    />
                                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3 mt-4">
                                        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold text-amber-600 leading-relaxed">
                                            نصيحة: يمكنك إرفاق الصور واللقطات التوضيحية داخل المحادثة مباشرة بعد إنشاء التذكرة لضمان سرعة الحل.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Image Preview Modal */}
            {previewImage && (
                <ImagePreview
                    src={previewImage}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </AppLayout>
    );
};

export default SupportMessages;
