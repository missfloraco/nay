import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/services/api';
import AdminLayout from './adminlayout';
import { formatDate } from '@/shared/utils/helpers';
import { convertImageToWebP } from '@/shared/utils/image-helpers';
import { MessageSquare, ArrowUp, CheckCircle, Clock, Info, Trash2, X, AlertCircle, Archive, Shield, Image as ImageIcon, ShieldCheck, Search, Filter, Loader2 } from 'lucide-react';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import InputField from '@/shared/ui/forms/input-field';
import Modal from '@/shared/ui/modals/modal';
import { Toolbar } from '@/shared/components/toolbar';
import ImagePreview from '@/shared/ui/image-preview';

export default function SupportTicketsPage() {
    const queryClient = useQueryClient();
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showSuccess, showError, showConfirm } = useFeedback();

    const uploadImageMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('image', file);

            const response: any = await api.post('/admin/support/upload', formData, {
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
                e.preventDefault(); // Prevent default paste behavior for images
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
            toolbar={
                <Toolbar
                    title="تصفية التذاكر"
                    activeValue={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { id: 'all', label: 'الكل', icon: MessageSquare, color: 'text-gray-400' },
                        { id: 'open', label: 'مفتوحة', icon: AlertCircle, color: 'text-blue-500' },
                        { id: 'in_progress', label: 'قيد المعالجة', icon: Clock, color: 'text-yellow-500' },
                        { id: 'resolved', label: 'محلولة', icon: CheckCircle, color: 'text-green-500' },
                        { id: 'closed', label: 'مغلقة', icon: X, color: 'text-gray-500' },
                        { id: 'archived', label: 'الأرشيف', icon: Archive, color: 'text-red-400' },
                    ]}
                />
            }
        >
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

                {/* Ticket Grid List */}
                {isLoadingList && !ticketsData ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-transparent">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : ticketsData?.data?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center animate-in fade-in zoom-in duration-500">
                        <div className="relative mb-8 group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative p-10 bg-gradient-to-tr from-white to-gray-50 dark:from-dark-900 dark:to-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl shadow-emerald-900/5 group-hover:-translate-y-2 transition-transform duration-700">
                                <CheckCircle className="w-24 h-24 text-emerald-500 opacity-80" strokeWidth={1.5} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-dark-800 p-3 rounded-2xl shadow-lg border border-gray-50 dark:border-white/5 animate-bounce">
                                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">ممتاز! النظام نظيف تماماً</h3>
                        <p className="text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">
                            لا توجد أي تذاكر دعم فني تتطلب اهتمامك حالياً. يمكنك الاسترخاء الآن!
                        </p>
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
                    {/* Chat Content (Left/Center) - 2026 Redesign */}
                    <div className="flex-1 flex flex-col bg-white/60 dark:bg-dark-900/60 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden min-h-0 relative">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
                        </div>

                        {/* Modal Chat Header - Glassmorphic */}
                        <div className="p-6 bg-white/40 dark:bg-dark-900/40 backdrop-blur-md border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0 z-20 relative">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-dark-800 dark:to-dark-700 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-dark-900 overflow-hidden">
                                        {selectedTicket?.tenant?.avatar_url ? (
                                            <img src={selectedTicket.tenant.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-black text-gray-500 dark:text-gray-400">
                                                {selectedTicket?.tenant?.name?.substring(0, 1).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-dark-900 rounded-full shadow-sm" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <h3 className="font-black text-xl text-gray-900 dark:text-white leading-none tracking-tight">{selectedTicket?.tenant?.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 dark:bg-black/20 border border-white/10 backdrop-blur-sm">
                                            <Shield className="w-3 h-3 text-primary" />
                                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">{selectedTicket?.tenant?.uid}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/10 ${getStatusColor(selectedTicket?.status || '', !!selectedTicket?.deleted_at)}`}>
                                    {getStatusLabel(selectedTicket?.status || '', !!selectedTicket?.deleted_at)}
                                </div>
                            </div>
                        </div>

                        {/* Messages Container - Clean & Modern */}
                        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar relative z-10 scroll-smooth">
                            {isLoadingChat && !selectedTicket ? (
                                <div className="flex flex-col items-center justify-center h-full gap-6 text-gray-400 animate-pulse">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-dark-800" />
                                    <div className="w-32 h-4 rounded-full bg-gray-200 dark:bg-dark-800" />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {selectedTicket?.messages?.map((msg: any) => (
                                        <div
                                            key={msg.id}
                                            className={`flex w-full ${msg.is_admin_reply ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}
                                        >
                                            <div className={`flex flex-col max-w-[80%] ${msg.is_admin_reply ? 'items-end' : 'items-start'}`}>
                                                <div className={`
                                                    group relative px-6 py-4 shadow-sm transition-all duration-300 hover:shadow-md
                                                    ${msg.is_admin_reply
                                                        ? 'bg-gradient-to-tr from-primary to-blue-600 text-white rounded-[1.5rem] rounded-tl-none'
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

                                                    {/* Timestamp inside bubble for cleaner look */}
                                                    <div className={`absolute bottom-1 ${msg.is_admin_reply ? '-left-12' : '-right-12'} flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                        <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">{formatDate(msg.created_at).split('|')[1]}</span>
                                                    </div>
                                                </div>

                                                {/* Mini Timestamp outside */}
                                                <div className={`flex items-center gap-1.5 mt-2 px-2 opacity-60 ${msg.is_admin_reply ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        {msg.is_admin_reply ? 'أنت' : selectedTicket?.tenant?.name} • {formatDate(msg.created_at, true).split('|')[1]}
                                                    </span>
                                                    {msg.is_admin_reply && (
                                                        <div className="flex items-center">
                                                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Chat Input - Floating Bar */}

                        <div className="p-6 bg-transparent shrink-0 relative z-20">
                            {selectedTicket?.deleted_at ? (
                                <div className="p-1 rounded-[1.5rem] bg-gradient-to-r from-red-500/50 to-orange-500/50 p-[1px]">
                                    <div className="bg-white dark:bg-dark-900 rounded-[1.5rem] p-6 flex flex-col items-center justify-center gap-3 text-center">
                                        <Archive className="w-8 h-8 text-red-500" />
                                        <div>
                                            <h4 className="font-black text-red-600 text-sm">التذكرة مؤرشفة</h4>
                                            <p className="text-xs text-gray-400">لا يمكن إرسال رسائل جديدة</p>
                                        </div>
                                        <button onClick={() => restoreTicketMutation.mutate()} className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors">
                                            استعادة التذكرة
                                        </button>
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
                                                    placeholder="اكتب ردك هنا... (يمكنك لصق الصور مباشرة)"
                                                    disabled={selectedTicket?.status === 'closed' || replyMutation.isPending}
                                                    className="bg-transparent border-none shadow-none focus:ring-0 p-4 text-base font-medium placeholder:text-gray-400 h-14"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Attachment Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploading || selectedTicket?.status === 'closed'}
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
                                                    disabled={(!chatMessage.trim() && !pendingImage) || replyMutation.isPending || selectedTicket?.status === 'closed'}
                                                    className="w-14 h-14 flex items-center justify-center bg-primary text-white rounded-[1.5rem] hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none disabled:grayscale"
                                                >
                                                    {replyMutation.isPending ? (
                                                        <Loader2 className="w-6 h-6 animate-spin" />
                                                    ) : (
                                                        <ArrowUp className="w-6 h-6" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
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
                                    <div className="grid grid-cols-2 gap-2">
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

            {/* Image Preview Modal */}
            {
                previewImage && (
                    <ImagePreview
                        src={previewImage}
                        onClose={() => setPreviewImage(null)}
                    />
                )
            }
        </AdminLayout >
    );
}
