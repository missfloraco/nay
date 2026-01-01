import React from 'react';
import { Mail, Calendar, Clock, MoreVertical, Eye, Trash2, RotateCcw } from 'lucide-react';
import { resolveAssetUrl, formatDate, formatNumber } from '@/shared/utils/helpers';

interface IdentityCellProps {
    name: string;
    avatar?: string;
    subtext?: string;
    email?: string;
    uid?: string;
    highlight?: boolean;
    icon?: any;
    iconColor?: string;
    iconBg?: string;
}

export const IdentityCell = ({ name, avatar, subtext, email, uid, highlight, icon: Icon, iconColor, iconBg }: IdentityCellProps) => (
    <div className={`flex items-center gap-4 transition-all duration-500 ${highlight ? 'animate-pulse bg-emerald-50 dark:bg-emerald-900/20 -mx-4 px-4 py-2 rounded-xl font-black' : ''}`}>
        {avatar ? (
            <img
                src={resolveAssetUrl(avatar)}
                alt={name}
                className="w-11 h-11 rounded-xl object-cover border-2 border-white dark:border-dark-800 shadow-sm"
            />
        ) : Icon ? (
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm border ${iconBg || 'bg-primary/10 border-primary/5'}`}>
                <Icon className={`w-5 h-5 ${iconColor || 'text-primary'}`} />
            </div>
        ) : (
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-sm border border-primary/5">
                {name.charAt(0)}
            </div>
        )}
        <div className="space-y-0.5">
            <div className="font-black text-gray-900 dark:text-white text-sm">
                {name}
            </div>
            {subtext && (
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 dark:bg-dark-800 px-1.5 py-0.5 rounded-lg inline-block border border-gray-100 dark:border-white/5">
                    {subtext}
                </div>
            )}
            {email && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <Mail className="w-3 h-3 opacity-50" />
                    {email}
                </div>
            )}
            {uid && (
                <div className="text-[10px] text-primary/60 dark:text-primary/40 font-bold">
                    ID: {uid}
                </div>
            )}
        </div>
    </div>
);

interface StatusCellProps {
    children: React.ReactNode;
}

export const StatusCell = ({ children }: StatusCellProps) => (
    <div className="flex items-center">
        {children}
    </div>
);

interface DateCellProps {
    date: string;
    label?: string;
    isUrgent?: boolean;
    includeTime?: boolean;
}

export const DateCell = ({ date, label, isUrgent, includeTime }: DateCellProps) => (
    <div className="flex flex-col">
        <span className={`text-[13px] font-bold ${isUrgent ? 'text-orange-500' : 'text-gray-600 dark:text-gray-400'}`}>
            {formatDate(date, includeTime)}
        </span>
        {label && (
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-tight mt-0.5">
                {label}
            </span>
        )}
    </div>
);

interface CurrencyCellProps {
    amount: string | number;
    currency?: string;
    isFree?: boolean;
}

export const CurrencyCell = ({ amount, currency = 'ILS', isFree }: CurrencyCellProps) => (
    <span className={`font-black text-base ${!amount || Number(amount) === 0 ? 'text-gray-400' : 'text-emerald-600'}`}>
        {!amount || Number(amount) === 0 ? 'مجاني' : `${formatNumber(amount)} ${currency}`}
    </span>
);

interface ActionCellProps {
    children: React.ReactNode;
}

export const ActionCell = ({ children }: ActionCellProps) => (
    <div className="flex items-center justify-end gap-2">
        {children}
    </div>
);
