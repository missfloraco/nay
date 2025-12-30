import { useEffect } from 'react';
import { useSettings } from '@/shared/contexts/app-context';

/**
 * useContentProtection - A professional React hook to prevent 
 * unauthorized inspection, copying, and right-clicking.
 */
export const useContentProtection = () => {
    const { settings } = useSettings();

    useEffect(() => {
        // 1. Detect Current Scope
        const path = window.location.pathname;
        let scope = 'landing';
        if (path.startsWith('/admin')) scope = 'admin';
        else if (path.startsWith('/app')) scope = 'app';

        // 2. Feature toggles from global settings (Dynamic per Scope)
        const protectRightClick = settings[`protect_right_click_${scope}`] === '1' || settings[`protect_right_click_${scope}`] === true;
        const protectSelection = settings[`protect_selection_${scope}`] === '1' || settings[`protect_selection_${scope}`] === true;
        const protectDrag = settings[`protect_drag_${scope}`] === '1' || settings[`protect_drag_${scope}`] === true;
        const protectCopyPaste = settings[`protect_copy_paste_${scope}`] === '1' || settings[`protect_copy_paste_${scope}`] === true;
        const protectDevtools = settings[`protect_devtools_${scope}`] === '1' || settings[`protect_devtools_${scope}`] === true;

        const handleContextMenu = (e: MouseEvent) => {
            if (protectRightClick) e.preventDefault();
        };
        const handleSelectStart = (e: Event) => {
            if (protectSelection) e.preventDefault();
        };
        const handleDragStart = (e: DragEvent) => {
            if (protectDrag) e.preventDefault();
        };
        const handleCopyCutPaste = (e: ClipboardEvent) => {
            if (protectCopyPaste) e.preventDefault();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!protectDevtools && !protectCopyPaste) return;

            // F12
            if (protectDevtools && e.key === 'F12') {
                e.preventDefault();
            }

            // Ctrl + Shift + I/J/C
            if (protectDevtools && e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }

            // Ctrl + U (View Source)
            if (protectDevtools && e.ctrlKey && e.key.toLowerCase() === 'u') {
                e.preventDefault();
            }

            // Ctrl + C/S/A (Copy, Save, Select All)
            if (protectCopyPaste && e.ctrlKey && ['c', 's', 'a'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        };

        // Attach Listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('copy', handleCopyCutPaste);
        document.addEventListener('cut', handleCopyCutPaste);
        document.addEventListener('paste', handleCopyCutPaste);
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('copy', handleCopyCutPaste);
            document.removeEventListener('cut', handleCopyCutPaste);
            document.removeEventListener('paste', handleCopyCutPaste);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [settings]);
};
