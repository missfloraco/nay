import React from 'react';

interface RightSidebarProps {
    children: React.ReactNode;
    contentClassName?: string;
}

/**
 * Right Sidebar - Always positioned on the ACTUAL RIGHT side
 * Fixed 250px width matching the main sidebar symmetry
 * Border on the LEFT (border-l)
 */
export const RightSidebar: React.FC<RightSidebarProps> = ({ children, contentClassName = '' }) => {
    if (!children) return null;
    return (
        <aside
            className={`hidden lg:flex lg:sticky top-0 bottom-0 right-0 w-[250px] bg-white border-l border-gray-300 z-40 transition-all duration-500 ease-in-out flex-col shadow-2xl lg:shadow-none overflow-hidden ${contentClassName}`}
        >
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                {children}
            </div>
        </aside>
    );
};
