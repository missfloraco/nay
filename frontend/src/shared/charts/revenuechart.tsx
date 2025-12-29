import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSettings } from '@/shared/contexts/app-context';
import { useState, useEffect } from 'react';

interface RevenueChartProps {
    data?: any[];
}

export default function RevenueChart({ data = [] }: RevenueChartProps) {
    const { settings } = useSettings();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">إحصائيات الإيرادات</h3>
                    <p className="text-sm text-gray-500">مقارنة شهرية للأداء المالي</p>
                </div>
            </div>
            <div className="h-[300px] w-full min-h-[300px]" dir="ltr">
                {isMounted && (
                    <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0}>
                        <AreaChart data={data.length > 0 ? data : [
                            { name: 'يناير', amt: 0 },
                            { name: 'فبراير', amt: 0 },
                            { name: 'مارس', amt: 0 },
                            { name: 'أبريل', amt: 0 },
                            { name: 'مايو', amt: 0 },
                            { name: 'يونيو', amt: 0 },
                        ]}>
                            <defs>
                                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dx={-10} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amt"
                                stroke="#10b981"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorAmt)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
