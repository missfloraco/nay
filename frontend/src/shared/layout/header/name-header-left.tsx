import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveAssetUrl } from '@/shared/utils/helpers';

interface UserData {
    name: string;
    avatar_url?: string;
    avatarUrl?: string; // Handle both cases
    uid?: string;
}

interface NameHeaderLeftProps {
    user: UserData | null;
    onLogout: () => void;
    settingsPath: string;
}

export const NameHeaderLeft: React.FC<NameHeaderLeftProps> = ({ user, onLogout, settingsPath }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const avatarUrl = resolveAssetUrl(user?.avatar_url || user?.avatarUrl) || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=02aa94&color=fff`;

    return (
        <div className="flex items-center h-full px-4 lg:px-6 lg:border-r border-gray-300 flex-shrink-0 justify-between relative header-user-section" ref={dropdownRef}>
            <div
                className="flex items-center gap-3 w-full cursor-pointer group select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* User Info Section */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <img
                        src={avatarUrl}
                        alt={user?.name}
                        className="w-10 h-10 rounded-full border border-gray-100 shadow-sm object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col items-start leading-none gap-1 overflow-hidden user-info-text">
                        <span className="text-sm font-black text-gray-900 truncate w-full text-right">
                            {user?.name || 'المستخدم'}
                        </span>
                        {user?.uid && (
                            <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                                {user.uid}
                            </span>
                        )}
                    </div>
                </div>

                {/* Dropdown Trigger Icon */}
                <div className={`p-1.5 rounded-lg text-gray-400 group-hover:bg-gray-50 transition-all duration-200 ${isOpen ? 'rotate-180 bg-gray-50 text-primary' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-[80px] left-4 w-[220px] bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-1">
                        <Link
                            to={settingsPath}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors group"
                        >
                            <div className="p-2 rounded-lg bg-gray-100 text-gray-500 group-hover:text-primary group-hover:bg-white transition-colors">
                                <Settings className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm">الإعدادات</span>
                        </Link>

                        <div className="h-px bg-gray-100 my-1"></div>

                        <button
                            onClick={() => {
                                onLogout();
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors group"
                        >
                            <div className="p-2 rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm">تسجيل الخروج</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
