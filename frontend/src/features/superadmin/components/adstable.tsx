import React, { useState, useEffect, useMemo } from 'react';
import { AdsService, Ad } from '@/shared/services/adsservice';
import api from '@/shared/services/api';
import { useAction } from '@/shared/contexts/action-context';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, Code, Type, Megaphone, Save, Check, Loader2, Link } from 'lucide-react';
import { useFeedback } from '@/shared/ui/notifications/feedback-context';
import Table from '@/shared/table';
import { IdentityCell, ActionCell } from '@/shared/table-cells';
import { EditButton, DeleteButton } from '@/shared/ui/buttons/btn-crud';
import InputField from '@/shared/ui/forms/input-field';
import Modal from '@/shared/ui/modals/modal';

export default function AdsTable() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError, showConfirm } = useFeedback();
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

    // Register Primary Action
    useEffect(() => {
        setPrimaryAction({
            label: 'إضافة إعلان جديد',
            icon: Plus,
            onClick: () => {
                setIsModalOpen(true);
                setFormData({ name: '', placement: 'ad_landing_top', type: 'script', content: '', redirect_url: '', is_active: true });
            }
        });
        return () => setPrimaryAction(null);
    }, [setPrimaryAction]);

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

            {/* Modal Overlay - System Style */}
            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={formData.id ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
                size="xl"
            >
                <form onSubmit={handleSave} className="flex flex-col h-full">
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar p-1">

                        {/* Right Column: Campaign Settings */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">
                                <Megaphone className="w-5 h-5 text-primary" />
                                إعدادات الحملة
                            </h4>

                            <InputField
                                label="اسم الحملة"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="مثال: عرض الصيف 2024"
                                required
                            />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">مكان الظهور</label>
                                <select
                                    value={formData.placement}
                                    onChange={e => setFormData({ ...formData, placement: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-dark-950 outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-sm"
                                >
                                    {placements.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">الحالة</label>
                                <div className="flex p-1 bg-gray-50 dark:bg-dark-950 rounded-xl border border-gray-100 dark:border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: true })}
                                        className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${formData.is_active ? 'bg-white dark:bg-dark-700 shadow-sm text-green-500' : 'text-gray-400 opacity-50'}`}
                                    >
                                        نشط
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: false })}
                                        className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${!formData.is_active ? 'bg-white dark:bg-dark-700 shadow-sm text-red-500' : 'text-gray-400 opacity-50'}`}
                                    >
                                        متوقف
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">نوع الإعلان</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'script', label: 'Script', icon: Code },
                                        { id: 'image', label: 'Image', icon: ImageIcon },
                                        { id: 'html', label: 'HTML', icon: Type }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: item.id as any })}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all group ${formData.type === item.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 dark:border-white/10 text-gray-400 hover:border-gray-200'}`}
                                        >
                                            <item.icon className={`w-5 h-5 ${formData.type === item.id ? '' : 'grayscale opacity-50'}`} />
                                            <span className="text-[9px] font-black tracking-widest uppercase">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Left Column: Content Editor */}
                        <div className="flex flex-col h-full min-h-[400px]">
                            <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2 mb-6">
                                <Code className="w-5 h-5 text-blue-500" />
                                المحتوى الإعلاني
                            </h4>

                            <div className="flex-1 flex flex-col">
                                {formData.type === 'image' ? (
                                    <div className="space-y-6 animate-in fade-in duration-500 flex-1 flex flex-col">
                                        <div className="flex-1 space-y-2 flex flex-col">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">رفع صورة الإعلان</label>
                                            <div className="relative group flex-1">
                                                <input
                                                    type="file"
                                                    onChange={handleImageUpload}
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    disabled={imageUploading}
                                                />
                                                <div className="w-full h-full min-h-[200px] rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-dark-950 flex flex-col items-center justify-center gap-3 group-hover:border-primary/50 transition-all overflow-hidden relative">
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
                                        <InputField
                                            label="أو رابط الصورة المباشر"
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="https://example.com/banner.jpg"
                                            icon={Link}
                                            className="ltr"
                                        />
                                        <InputField
                                            label="رابط التوجيه (Redirect URL)"
                                            value={formData.redirect_url || ''}
                                            onChange={e => setFormData({ ...formData, redirect_url: e.target.value })}
                                            placeholder="https://example.com/buy-now"
                                            icon={Link}
                                            className="ltr"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2 animate-in fade-in duration-500 flex-1 flex flex-col">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">الكود الإعلاني</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full h-full min-h-[300px] px-6 py-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-900 text-gray-100 font-mono text-xs outline-none focus:ring-4 focus:ring-primary/10 transition-all ltr custom-scrollbar leading-relaxed"
                                            placeholder={formData.type === 'script' ? '<script src="..."></script>' : '<div>...</div>'}
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="pt-6 mt-6 flex gap-4 border-t border-gray-100 dark:border-white/5">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-4 bg-primary text-white rounded-xl font-black shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all text-base flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Check className="w-5 h-5 group-hover:scale-125 transition-transform" />
                            )}
                            <span>{formData.id ? 'حفظ التغييرات' : 'نشر الإعلان'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-8 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
