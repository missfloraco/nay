import React, { ReactNode } from 'react';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { useUI } from '@/shared/contexts/ui-context';
import { ImpersonationBanner } from '@/shared/components/impersonationbanner';
import { Plus } from 'lucide-react';
import Button from '@/shared/ui/buttons/btn-base';

interface DashboardAction {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: any;
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

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-dark-950 transition-colors duration-500" dir="rtl">
            {/* Sidebar */}
            <Sidebar
                items={items}
                secondaryItems={secondaryItems}
                homePath={homePath}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                {/* Header */}
                <Header title={title} />

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar bg-gray-50 dark:bg-dark-950 relative">
                    <div className={`mx-auto w-full flex flex-col min-h-full ${noPadding ? 'p-0' : 'p-4 lg:p-8'}`}>
                        {/* Unified Page Toolbar */}
                        {(toolbar || primaryAction || extraActions.length > 0) && (
                            <div className="sticky top-0 z-40 mb-6 py-4 -mt-4 bg-gray-50/95 dark:bg-dark-950/95 backdrop-blur-sm flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0 transition-all duration-200">
                                {/* Page Specific Toolbar (Filters/Tabs) */}
                                <div className="flex-1 w-full lg:w-auto overflow-hidden">
                                    {toolbar}
                                </div>

                                {/* Global Actions (Buttons) */}
                                <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
                                    {extraActions.map((action, idx) => (
                                        <Button
                                            key={idx}
                                            onClick={action.onClick}
                                            disabled={action.disabled || action.loading}
                                            variant={action.variant || 'secondary'}
                                            icon={action.icon || Plus}
                                            isLoading={action.loading}
                                        >
                                            {action.label}
                                        </Button>
                                    ))}
                                    {primaryAction && (
                                        <Button
                                            onClick={primaryAction.onClick}
                                            disabled={primaryAction.disabled || primaryAction.loading}
                                            variant={primaryAction.variant === 'danger' ? 'danger' : 'primary'}
                                            icon={primaryAction.icon || Plus}
                                            isLoading={primaryAction.loading}
                                        >
                                            {primaryAction.label}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex-1">
                            {children}
                        </div>

                        {/* Pagination Portal Anchor */}
                        <div id="table-pagination-portal" className="flex items-center mt-auto pt-4" />
                    </div>

                    {/* Bottom Banners (Trial etc) */}
                    {banners && (
                        <div className="sticky bottom-0 left-0 right-0 z-40">
                            {banners}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
