import { useState, useEffect } from 'react';
import { X, Search, User } from 'lucide-react';
import api from '@/shared/services/api';
import { logger } from '@/shared/services/logger';

interface Tenant {
    id: number;
    name: string;
    email: string;
    status: string;
}

interface TenantSelectionModalProps {
    onClose: () => void;
    onSelectTenant: (tenant: Tenant) => void;
}

export const TenantSelectionModal = ({ onClose, onSelectTenant }: TenantSelectionModalProps) => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadTenants();
    }, []);

    const loadTenants = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/tenants');
            setTenants(res.data || []);
        } catch (error) {
            logger.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-emerald-50 to-primary/5 dark:from-emerald-900/20 dark:to-primary/10">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">اختر المشترك</h2>
                        <p className="text-sm text-gray-500 font-bold mt-1">اختر المشترك لتسجيل دفعة جديدة</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="بحث باسم المشترك أو البريد الإلكتروني..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-shadow font-bold"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Tenants List */}
                <div className="max-h-[60vh] overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
                    ) : filteredTenants.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">لا توجد نتائج</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredTenants.map(tenant => (
                                <button
                                    key={tenant.id}
                                    onClick={() => onSelectTenant(tenant)}
                                    className="w-full p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-right flex items-center gap-4 group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg group-hover:scale-110 transition-transform">
                                        {tenant.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-black text-gray-900 dark:text-white">{tenant.name}</div>
                                        <div className="text-sm text-gray-500">{tenant.email}</div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${tenant.status === 'active' ? 'bg-green-100 text-green-700' :
                                        tenant.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {tenant.status === 'active' ? 'نشط' :
                                            tenant.status === 'trial' ? 'تجريبي' :
                                                tenant.status}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
