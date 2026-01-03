import React, { ReactNode } from 'react';
import { Sidebar } from '@/shared/layout/sidebar/sidebar';
import { Header } from '@/shared/layout/header/header';
import { useUI } from '@/shared/contexts/ui-context';
import { useSettings } from '@/shared/contexts/app-context';
import { ImpersonationBanner } from '@/shared/components/impersonationbanner';
import { Plus } from 'lucide-react';
import Button from '@/shared/ui/buttons/btn-base';

interface DashboardAction {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: any;
    type?: 'button' | 'submit' | 'reset';
    form?: string;
}

interface DashboardLayoutProps {
    children: ReactNode;
    title?: string;
    items: any[];
    secondaryItems?: any[];
    homePath: string;
    banners?: ReactNode;
    noPadding?: boolean;
    toolbar?: ReactNode;
    primaryAction?: DashboardAction;
    extraActions?: DashboardAction[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    title,
    items,
    secondaryItems,
    homePath,
    banners,
    noPadding = false,
    toolbar,
    primaryAction,
    extraActions = []
}) => {
    const { isSidebarCollapsed } = useUI();
    const { settings } = useSettings();

    const currentYear = new Date().getFullYear();

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-dark-950 transition-colors duration-500" dir="rtl">
            {/* Sidebar */}
            <Sidebar
                items={items}
                secondaryItems={secondaryItems}
                homePath={homePath}
                banners={banners}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                {/* Header */}
                <Header title={title} />

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar bg-gray-50 dark:bg-dark-950 relative scroll-smooth">
                    <div className="flex flex-col min-h-full">
                        {/* 1. Top Filter Toolbar (Sticky) */}
                        {toolbar && (
                            <div className="sticky top-0 z-40 h-[70px] lg:h-[90px] px-0 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.08] backdrop-blur-2xl border-b border-emerald-500/20 dark:border-emerald-500/10 shadow-xl shadow-emerald-500/[0.02] flex items-center shrink-0 transition-all duration-500 overflow-hidden relative group">
                                {/* Decorative Accent Lines */}
                                <div className="absolute top-0 right-1/4 w-32 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="absolute bottom-[-1px] left-1/3 w-64 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

                                <div className="flex-1 w-full relative z-10 px-4 lg:px-8 max-w-full overflow-x-hidden">
                                    {toolbar}
                                </div>
                            </div>
                        )}

                        <div className={`flex-1 ${noPadding ? 'p-0' : 'px-4 lg:px-8 py-6 lg:py-8'}`}>
                            {children}
                        </div>

                        {/* Pagination Portal Anchor */}
                        <div id="table-pagination-portal" className={`flex items-center mt-auto ${noPadding ? 'p-4 lg:p-8' : 'px-0 py-4'}`} />

                        {/* 2. Bottom Action Toolbar (Sticky) - Always Visible */}
                        <div className="layout-footer-toolbar sticky bottom-0 z-40 h-[70px] lg:h-[90px] px-0 bg-white/80 dark:bg-dark-900/80 backdrop-blur-2xl border-t border-emerald-500/20 dark:border-emerald-500/10 shadow-[0_-10px_40px_rgba(16,185,129,0.08)] flex items-center shrink-0 transition-all duration-500 overflow-hidden relative group">
                            {/* Decorative Accent Lines (Mirrored) */}
                            <div className="absolute bottom-0 right-1/4 w-32 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="absolute top-[-1px] left-1/3 w-64 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

                            <div className="flex items-center justify-end gap-3 shrink-0 w-full relative z-10 px-4 lg:px-8">
                                {/* Right Side: Actions */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-3">
                                        {extraActions.map((action, idx) => (
                                            <Button
                                                key={idx}
                                                onClick={action.onClick}
                                                disabled={action.disabled || action.loading}
                                                variant={action.variant || 'secondary'}
                                                icon={action.icon || Plus}
                                                isLoading={action.loading}
                                                type={action.type}
                                                form={action.form}
                                                className="animate-in fade-in slide-in-from-bottom-2 duration-300 transform hover:translate-y-[-2px] transition-all"
                                            >
                                                {action.label}
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {primaryAction?.secondaryAction && (
                                            <Button
                                                onClick={primaryAction.secondaryAction.onClick}
                                                variant={(primaryAction.secondaryAction as any).variant || "secondary"}
                                                className="transform hover:translate-y-[-2px] transition-all"
                                            >
                                                {primaryAction.secondaryAction.label}
                                            </Button>
                                        )}
                                        {primaryAction && (
                                            <Button
                                                onClick={primaryAction.onClick}
                                                disabled={primaryAction.disabled || primaryAction.loading}
                                                variant={primaryAction.variant === 'danger' ? 'danger' : 'primary'}
                                                icon={primaryAction.icon || Plus}
                                                isLoading={primaryAction.loading}
                                                type={primaryAction.type}
                                                form={primaryAction.form}
                                                className="min-w-[120px] shadow-lg shadow-emerald-500/20 transform hover:translate-y-[-2px] hover:shadow-emerald-500/30 transition-all"
                                            >
                                                {primaryAction.label}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </main>
            </div>
        </div>
    );
};
