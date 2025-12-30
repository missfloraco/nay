import React from 'react';
import { Link } from 'react-router-dom';


interface LogoHeaderRightProps {
    appName: string;
    logoUrl?: string | null;
    dashboardPath: string;
}

export const LogoHeaderRight: React.FC<LogoHeaderRightProps> = ({ appName, logoUrl, dashboardPath }) => {
    return (
        <div className="hidden lg:flex items-center w-[250px] h-full pr-8 pl-6 border-l border-gray-300 dark:border-dark-600 flex-shrink-0 justify-between">
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
                        className="text-lg font-black text-gray-900 dark:text-white transition-colors truncate hidden xl:block tracking-tight"
                    >
                        {appName}
                    </span>
                </div>
            </Link>

        </div>
    );
};
