import React, { useState, useEffect, useMemo } from 'react';
import { AdsService, Ad } from '@/shared/services/adsservice';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, Code, Type, Megaphone, Save, Check, Loader2 } from 'lucide-react';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import Table from '@/shared/table';
import { IdentityCell, ActionCell } from '@/shared/table-cells';
import { EditButton, DeleteButton } from '@/shared/ui/buttons/btn-crud';

export default function AdsTable() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError, showConfirm } = useFeedback();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState<Ad>({
        name: '',
        placement: 'ad_landing_top',
        type: 'script',
        content: '',
        redirect_url: '',
        is_active: true
    });

    const [saving, setSaving] = useState(false);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const data = await AdsService.getAll();
            setAds(data);
        } catch (error) {
            showError('فشل تحميل الإعلانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', placement: 'ad_landing_top', type: 'script', content: '', redirect_url: '', is_active: true });
        setIsModalOpen(false);
    };

    const handleSave = async (e?: React.FormEvent) => {
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
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm({
            title: 'حذف الإعلان',
            message: 'هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.',
            confirmLabel: 'نعم، احذف',
            cancelLabel: 'إلغاء',
            variant: 'danger'
        });

        if (!confirmed) return;

        try {
            await AdsService.delete(id);
            showSuccess('تم حذف الإعلان بنجاح');
            fetchAds();
        } catch (error) {
            showError('فشل حذف الإعلان');
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

    const [imageUploading, setImageUploading] = useState(false);
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
        <div className="space-y-6">
            <div className="h-full flex flex-col">
                <Table<Ad>
                    columns={columns}
                    data={ads}
                    isLoading={loading}
                    exportFileName="جدول_الإعلانات"
                    emptyMessage="لا توجد إعلانات مخصصة بعد"
                />

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={() => { setIsModalOpen(true); setFormData({ name: '', placement: 'ad_landing_top', type: 'script', content: '', redirect_url: '', is_active: true }); }}
                        className="flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-[2rem] font-black shadow-2xl shadow-primary/30 hover:scale-105 transition-all active:scale-95 group"
                    >
                        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-lg">إضافة إعلان جديد</span>
                    </button>
                </div>
            </div>

            {/* Modal Overlay - System Style */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div
                        className="bg-white dark:bg-dark-900 rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col animate-in zoom-in-95 duration-500 max-h-[90vh]"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-10 py-8 border-b border-gray-50 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-dark-950/50 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    {formData.id ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                        {formData.id ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
                                    </h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">تفاصيل الحملة الإعلانية</p>
                                </div>
                            </div>
                            <button
                                onClick={resetForm}
                                className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">اسم الحملة</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-8 py-5 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-dark-950 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg"
                                    placeholder="مثال: عرض الصيف 2024"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">مكان الظهور</label>
                                    <select
                                        value={formData.placement}
                                        onChange={e => setFormData({ ...formData, placement: e.target.value })}
                                        className="w-full px-6 py-5 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-dark-950 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                                    >
                                        {placements.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">الحالة</label>
                                    <div className="flex p-1 bg-gray-50 dark:bg-dark-950 rounded-2xl border border-gray-100 dark:border-white/10 h-[62px]">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: true })}
                                            className={`flex-1 rounded-xl text-xs font-black transition-all ${formData.is_active ? 'bg-white dark:bg-dark-700 shadow-sm text-green-500' : 'text-gray-400 opacity-50'}`}
                                        >
                                            نشط
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: false })}
                                            className={`flex-1 rounded-xl text-xs font-black transition-all ${!formData.is_active ? 'bg-white dark:bg-dark-700 shadow-sm text-red-500' : 'text-gray-400 opacity-50'}`}
                                        >
                                            متوقف
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">نوع الإعلان</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'script', label: 'Script', icon: Code },
                                        { id: 'image', label: 'Image', icon: ImageIcon },
                                        { id: 'html', label: 'HTML', icon: Type }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: item.id as any })}
                                            className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all group ${formData.type === item.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 dark:border-white/10 text-gray-400'}`}
                                        >
                                            <item.icon className={`w-6 h-6 ${formData.type === item.id ? '' : 'grayscale opacity-50'}`} />
                                            <span className="text-[10px] font-black tracking-widest uppercase">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.type === 'image' ? (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">رفع صورة الإعلان</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                disabled={imageUploading}
                                            />
                                            <div className="w-full h-40 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-dark-950 flex flex-col items-center justify-center gap-3 group-hover:border-primary/50 transition-all overflow-hidden relative">
                                                {imageUploading ? (
                                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                ) : formData.content && formData.content.startsWith('http') ? (
                                                    <img src={formData.content} className="w-full h-full object-contain p-4" alt="Preview" />
                                                ) : (
                                                    <>
                                                        <ImageIcon className="w-10 h-10 text-gray-300" />
                                                        <span className="text-xs font-black text-gray-400">اسحب الصورة هنا أو اضغط للرفع</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">أو رابط الصورة المباشر</label>
                                        <input
                                            type="text"
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-8 py-5 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-dark-950 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold ltr"
                                            placeholder="https://example.com/banner.jpg"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 animate-in fade-in duration-500">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">الكود الإعلاني</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full h-40 px-8 py-5 rounded-[2rem] border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-dark-950 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-mono text-xs ltr no-scrollbar"
                                        placeholder={formData.type === 'script' ? '<script src="..."></script>' : '<div>...</div>'}
                                        required
                                    />
                                </div>
                            )}

                            {formData.type === 'image' && (
                                <div className="space-y-2 animate-in slide-in-from-top duration-300">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">رابط التوجيه (Redirect URL)</label>
                                    <input
                                        type="text"
                                        value={formData.redirect_url || ''}
                                        onChange={e => setFormData({ ...formData, redirect_url: e.target.value })}
                                        className="w-full px-8 py-5 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-dark-950 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg ltr"
                                        placeholder="https://example.com/buy-now"
                                    />
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="pt-6 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-5 bg-primary text-white rounded-[2rem] font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xl flex items-center justify-center gap-4 group disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Check className="w-7 h-7 group-hover:scale-125 transition-transform" />
                                    )}
                                    <span>{formData.id ? 'حفظ التغييرات' : 'نشر الإعلان'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-8 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 rounded-[2rem] font-bold hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
