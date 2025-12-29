import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CountryStatsProps {
    data?: { country: string; count: number }[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function CountryStats({ data = [] }: CountryStatsProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
            <div className="mb-8">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">توزيع المشتركين حسب الدولة</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">نظرة على الانتشار الجغرافي للمنصة</p>
            </div>

            <div className="h-[300px] w-full" dir="ltr">
                {isMounted && (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                            <Pie
                                data={data.length > 0 ? data : [{ country: 'لا توجد بيانات', count: 1 }]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={8}
                                dataKey="count"
                                nameKey="country"
                            >
                                {(data.length > 0 ? data : [{ country: 'لا توجد بيانات', count: 1 }]).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'bold' }} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
