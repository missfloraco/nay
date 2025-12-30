import React from 'react';
import { Link } from 'react-router-dom';


interface LogoHeaderRightProps {
    appName: string;
    logoUrl?: string | null;
    dashboardPath: string;
}

export const LogoHeaderRight: React.FC<LogoHeaderRightProps> = ({ appName, logoUrl, dashboardPath }) => {
    return (
        <div className="flex items-center h-full px-4 lg:pr-8 lg:pl-6 lg:border-l border-gray-300 flex-shrink-0 justify-between header-logo-section">
            <Link
                to={dashboardPath}
                className="flex items-center gap-4 transition-all duration-300 hover:opacity-80 active:scale-95 group overflow-hidden"
            >
                <div className="flex items-center gap-3 truncate">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={appName}
                            className="h-9 w-auto max-w-[120px] object-contain group-hover:rotate-1 transition-transform logo-img"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.nextElementSibling;
                                if (nextSibling instanceof HTMLElement) {
                                    nextSibling.style.display = 'block';
                                }
                            }}
                        />
                    ) : null}
                    <span
                        className="text-sm lg:text-lg font-black text-gray-900 transition-colors truncate block tracking-tight app-name-text"
                    >
                        {appName}
                    </span>
                </div>
            </Link>

        </div>
    );
};
