import React from 'react';
import { ExternalLink } from 'lucide-react';

interface AdContainerProps {
    enabled?: boolean;
    htmlContent?: string;
    customContent?: React.ReactNode;
    placeholderText?: string;
}

const AdContainer: React.FC<AdContainerProps> = ({
    enabled = false,
    htmlContent,
    customContent,
    placeholderText = 'مساحة إعلانية'
}) => {
    if (!enabled) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 rounded-2xl p-6 border-2 border-dashed border-gray-200 dark:border-dark-700 text-center">
                <div className="flex flex-col items-center gap-3 opacity-40">
                    <ExternalLink className="w-8 h-8 text-gray-400" />
                    <p className="text-xs font-bold text-gray-500">{placeholderText}</p>
                </div>
            </div>
        );
    }

    // If custom React content is provided
    if (customContent) {
        return (
            <div className="ad-container">
                {customContent}
            </div>
        );
    }

    // If HTML string is provided (for Google AdSense or custom HTML ads)
    if (htmlContent) {
        return (
            <div
                className="ad-container"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        );
    }

    // Fallback placeholder
    return (
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 text-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs font-bold text-primary">مساحة إعلانية نشطة</p>
                <p className="text-[10px] text-gray-500">قم بإضافة محتوى الإعلان من لوحة التحكم</p>
            </div>
        </div>
    );
};

export default AdContainer;
