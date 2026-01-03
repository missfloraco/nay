import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AdsService, Ad } from '@/shared/services/adsservice';
import api from '@/shared/services/api';
import { useAction } from '@/shared/contexts/action-context';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, Code, Type, Megaphone, Save, Check, Loader2, Link } from 'lucide-react';
import { useNotifications } from '@/shared/contexts/notification-context';
import Table from '@/shared/table';
import { IdentityCell, ActionCell } from '@/shared/table-cells';
import { EditButton, DeleteButton } from '@/shared/ui/buttons/btn-crud';
import InputField from '@/shared/ui/forms/input-field';
import Modal from '@/shared/ui/modals/modal';

export default function AdsTable() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError, showConfirm } = useNotifications();
    const { setPrimaryAction } = useAction();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState<Partial<Ad>>({
        name: '',
        placement: 'ad_landing_top',
        type: 'script',
        content: '',
        redirect_url: '',
        is_active: true
    });

    const [saving, setSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    const fetchAds = useCallback(async () => {
        try {
            setLoading(true);
            const data = await AdsService.getAll();
            setAds(data);
        } catch (error) {
            showError('فشل تحميل الإعلانات');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    const resetForm = useCallback(() => {
        setFormData({ name: '', placement: 'ad_landing_top', type: 'script', content: '', redirect_url: '', is_active: true });
        setIsModalOpen(false);
    }, []);

    const handleSave = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!formData.name || !formData.content) {
            showError('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        setSaving(true);
        try {
            if (formData.id) {
                await AdsService.update(formData.id, formData);
                showSuccess('تم تحديث الإعلان بنجاح');
            } else {
                await AdsService.create(formData);
                showSuccess('تم إنشاء الإعلان بنجاح');
            }
            resetForm();
            fetchAds();
        } catch (error) {
            showError('حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    }, [formData, showError, showSuccess, resetForm, fetchAds]);

    // Register Footer Toolbar Actions
    useEffect(() => {
        if (isModalOpen) {
            setPrimaryAction({
                label: formData.id ? 'حفظ التغييرات النهائية' : 'نشر الإعلان الآن',
                icon: formData.id ? Save : Check,
                type: 'submit',
                form: 'ads-form',
                loading: saving,
                disabled: imageUploading,
                secondaryAction: {
                    label: 'تجاهل',
                    onClick: resetForm
                }
            });
        } else {
            setPrimaryAction({
                label: 'إضافة إعلان جديد',
                icon: Plus,
                onClick: () => {
                    setIsModalOpen(true);
                    setFormData({ name: '', placement: 'ad_landing_top', type: 'script', content: '', redirect_url: '', is_active: true });
                }
            });
        }
        return () => setPrimaryAction(null);
    }, [isModalOpen, formData.id, saving, imageUploading, setPrimaryAction, handleSave, resetForm]);

    const handleDelete = async (id: number) => {
        const ad = ads.find(a => a.id === id);
        if (!ad) return;

        try {
            // Optimistic Update: Remove from local state immediately
            setAds(prev => prev.filter(a => a.id !== id));

            await AdsService.delete(id);

            showSuccess(`تم نقل "${ad.name}" إلى سلة المحذوفات`, {
                action: {
                    label: 'تراجع',
                    onClick: async () => {
                        try {
                            await AdsService.restore(id);
                            showSuccess(`تم استعادة "${ad.name}" بنجاح`);
                            fetchAds();
                        } catch (err) {
                            showError('فشل استعادة الإعلان');
                            fetchAds();
                        }
                    }
                }
            });
        } catch (error) {
            showError('فشل حذف الإعلان');
            fetchAds(); // Restore state on error
        }
    };

    const placements = [
        { value: 'ad_landing_top', label: 'أعلى صفحة الهبوط' },
        { value: 'ad_landing_footer', label: 'أسفل صفحة الهبوط' },
        { value: 'ad_sidebar_square', label: 'الشريط الجانبي' },
        { value: 'ad_footer_leaderboard', label: 'فوتر المشتركين' },
    ];

    const columns = useMemo(() => [
        {
            header: 'الإعلان',
            accessor: (ad: Ad) => (
                <IdentityCell
                    name={ad.name}
                    avatar={ad.type === 'image' ? ad.content : undefined}
                    subtext={`${ad.type.toUpperCase()} UNIT • ID: ${ad.id}`}
                />
            ),
            exportValue: (ad: Ad) => ad.name,
            className: 'min-w-[250px]'
        },
        {
            header: 'مكان الظهور',
            accessor: (ad: Ad) => (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                    <span className="text-sm font-black text-gray-600 dark:text-gray-400">
                        {placements.find(p => p.value === ad.placement)?.label || ad.placement}
                    </span>
                </div>
            ),
            exportValue: (ad: Ad) => placements.find(p => p.value === ad.placement)?.label || ad.placement
        },
        {
            header: 'النوع',
            accessor: (ad: Ad) => (
                <div className="px-4 py-2 bg-gray-100 dark:bg-dark-800 rounded-xl text-[10px] font-black text-gray-500 dark:text-gray-400 inline-block uppercase tracking-widest">
                    {ad.type}
                </div>
            ),
            exportValue: (ad: Ad) => ad.type
        },
        {
            header: 'الإحصائيات',
            accessor: (ad: Ad) => (
                <div className="flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-lg font-black text-blue-500 leading-none">{ad.stats?.impressions || 0}</div>
                        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">View</div>
                    </div>
                    <div className="w-px h-8 bg-gray-100 dark:bg-white/5" />
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-lg font-black text-emerald-500 leading-none">{ad.stats?.clicks || 0}</div>
                        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Click</div>
                    </div>
                </div>
            ),
            className: 'text-center'
        },
        {
            header: 'الحالة',
            accessor: (ad: Ad) => (
                <div className="flex justify-center">
                    {ad.is_active ? (
                        <div className="flex items-center gap-3 px-5 py-2 bg-green-50 dark:bg-green-500/10 text-green-600 rounded-[1.5rem] text-[11px] font-black border border-green-100 dark:border-green-500/20 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            مفعل
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 px-5 py-2 bg-gray-100 dark:bg-dark-800 text-gray-400 rounded-[1.5rem] text-[11px] font-black border border-gray-200 dark:border-white/5 opacity-60">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            متوقف
                        </div>
                    )}
                </div>
            ),
            className: 'text-center'
        },
        {
            header: 'التحكم',
            accessor: (ad: Ad) => (
                <ActionCell>
                    <div className="flex items-center justify-end gap-2">
                        <EditButton
                            type="icon"
                            onClick={() => { setFormData(ad); setIsModalOpen(true); }}
                        />
                        <DeleteButton
                            type="icon"
                            onClick={() => handleDelete(ad.id!)}
                        />
                    </div>
                </ActionCell>
            ),
            className: 'text-left'
        }
    ], [placements]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageUploading(true);
        try {
            const result = await AdsService.uploadImage(file);
            setFormData({ ...formData, content: result.url });
            showSuccess('تم رفع الصورة بنجاح');
        } catch (error) {
            showError('فشل رفع الصورة');
        } finally {
            setImageUploading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="h-full flex flex-col">
                    <Table<Ad>
                        columns={columns}
                        data={ads}
                        isLoading={loading}
                        exportFileName="جدول_الإعلانات"
                        emptyMessage="لا توجد إعلانات مخصصة بعد"
                    />

                </div>
            </div>

            {/* Modal Overlay - Premium Style */}
            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={formData.id ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
                variant="content-fit"
            >
                <form id="ads-form" onSubmit={handleSave} className="flex flex-col h-full">
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar p-1">

                        {/* Right Column: Campaign Settings */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h5 className="text-lg font-black text-gray-900 dark:text-white">إعدادات الحملة</h5>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <InputField
                                        label="اسم الحملة"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="مثال: عرض الصيف 2024"
                                        required
                                        className="bg-gray-50/50"
                                    />
                                    <p className="text-[10px] font-bold text-gray-400 px-2 leading-relaxed">
                                        أدخل اسماً توضيحياً للحملة الإعلانية ليساعدك في تتبع نتائجها لاحقاً.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">مكان الظهور</label>
                                    <select
                                        value={formData.placement}
                                        onChange={e => setFormData({ ...formData, placement: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-[1.25rem] px-4 py-3.5 font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                                    >
                                        {placements.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                    <p className="text-[9px] font-bold text-gray-400 px-2">اختر المكان المخصص لظهور هذا الإعلان في صفحات الموقع.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">الحالة التشغيلية</label>
                                    <div className="flex p-1.5 bg-gray-100 dark:bg-dark-700/50 rounded-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: true })}
                                            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.is_active ? 'bg-white dark:bg-dark-600 shadow-md text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            نشط (ظهور مباشر)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: false })}
                                            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${!formData.is_active ? 'bg-white dark:bg-dark-600 shadow-md text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            متوقف (إخفاء)
                                        </button>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 px-2">يمكنك إيقاف ظهور الإعلان مؤقتاً دون حذفه نهائياً من النظام.</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <Code className="w-4 h-4" />
                                        نوع الإعلان
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 dark:bg-dark-700/50 rounded-2xl">
                                        {[
                                            { id: 'script', label: 'Script', icon: Code },
                                            { id: 'image', label: 'Image', icon: ImageIcon },
                                            { id: 'html', label: 'HTML', icon: Type }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: item.id as any })}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all border-2 ${formData.type === item.id ? 'bg-white dark:bg-dark-600 border-primary/20 text-primary shadow-sm' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 px-2 leading-tight">تحديد النوع يغير طريقة عرض وتحميل المحتوى الإعلاني.</p>
                                </div>
                            </div>
                        </div>

                        {/* Left Column: Content Editor */}
                        <div className="p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-dark-800/40 space-y-6 flex flex-col min-h-[500px]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <Code className="w-5 h-5 text-primary" />
                                    </div>
                                    <h5 className="font-black text-gray-900 dark:text-white">المحتوى الإعلاني</h5>
                                </div>
                                <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full uppercase tracking-widest">المحتوى</span>
                            </div>

                            <div className="flex-1 flex flex-col">
                                {formData.type === 'image' ? (
                                    <div className="space-y-6 animate-in fade-in duration-500 flex-1 flex flex-col">
                                        <div className="flex-1 space-y-3 flex flex-col">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">رفع صورة الإعلان</label>
                                            <div className="relative group flex-1">
                                                <input
                                                    type="file"
                                                    onChange={handleImageUpload}
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    disabled={imageUploading}
                                                />
                                                <div className="w-full h-full min-h-[250px] rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/10 bg-white/50 dark:bg-dark-900/50 flex flex-col items-center justify-center gap-3 group-hover:border-primary/50 transition-all overflow-hidden relative shadow-inner">
                                                    {imageUploading ? (
                                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                    ) : formData.content && formData.content.startsWith('http') ? (
                                                        <img src={formData.content} className="w-full h-full object-contain p-6" alt="Preview" />
                                                    ) : (
                                                        <>
                                                            <div className="p-5 bg-gray-50 dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-white/5">
                                                                <ImageIcon className="w-12 h-12 text-gray-300" />
                                                            </div>
                                                            <span className="text-xs font-black text-gray-400">اسحب الصورة هنا أو اضغط للرفع</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-[9px] font-bold text-gray-400 px-2 italic">يفضل استخدام صور عالية الجودة بصيغة PNG أو WebP.</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <InputField
                                                label="أو رابط الصورة المباشر"
                                                value={formData.content}
                                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                                placeholder="https://example.com/banner.jpg"
                                                icon={Link}
                                                className="bg-white dark:bg-dark-900 ltr h-12 text-xs"
                                            />
                                            <InputField
                                                label="رابط التوجيه (Redirect URL)"
                                                value={formData.redirect_url || ''}
                                                onChange={e => setFormData({ ...formData, redirect_url: e.target.value })}
                                                placeholder="https://example.com/buy-now"
                                                icon={Link}
                                                className="bg-white dark:bg-dark-900 ltr h-12 text-xs"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in duration-500 flex-1 flex flex-col">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">الكود الإعلاني (Editor)</label>
                                        <div className="flex-1 relative group">
                                            <div className="absolute inset-0 bg-primary/20 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
                                            <textarea
                                                value={formData.content}
                                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                                className="w-full h-full min-h-[350px] px-6 py-6 rounded-[1.5rem] border border-gray-100 dark:border-white/10 bg-[#0d1117] text-blue-300 font-mono text-[13px] outline-none focus:ring-4 focus:ring-primary/10 transition-all text-left custom-scrollbar leading-relaxed shadow-2xl"
                                                placeholder={formData.type === 'script' ? '<script src="..."></script>' : '<div>...</div>'}
                                                dir="ltr"
                                                required
                                            />
                                        </div>
                                        <p className="text-[9px] font-bold text-gray-400 px-2 leading-tight">
                                            {formData.type === 'script' ? '⚠️ تأكد من صحة كود الجافا سكربت لتجنب تعطل الموقع.' : 'يمكنك استخدام أكواد HTML وتنسيقات CSS المضمنة.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Local footer removed - Actions are now in global toolbar */}
                </form>
            </Modal>
        </>
    );
}
