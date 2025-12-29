/**
 * Professional Logging Service
 * Centralized error and log management with environment-aware behavior
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: any;
    error?: any;
}

class Logger {
    private isDevelopment: boolean;
    private logs: LogEntry[] = [];
    private maxLogs = 100; // Keep last 100 logs in memory

    constructor() {
        this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
    }

    /**
     * Log an informational message
     */
    info(message: string, context?: any): void {
        this.log('info', message, context);
    }

    /**
     * Log a warning message
     */
    warn(message: string, context?: any): void {
        this.log('warn', message, context);
    }

    /**
     * Log an error message
     */
    error(message: string, error?: any, context?: any): void {
        this.log('error', message, context, error);

        // In production, you could send to external service like Sentry
        if (!this.isDevelopment) {
            this.sendToExternalService({ level: 'error', message, error, context });
        }
    }

    /**
     * Log a debug message (only in development)
     */
    debug(message: string, context?: any): void {
        if (this.isDevelopment) {
            this.log('debug', message, context);
        }
    }

    /**
     * Core logging method
     */
    private log(level: LogLevel, message: string, context?: any, error?: any): void {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            error
        };

        // Store in memory
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift(); // Remove oldest log
        }

        // Console output in development
        if (this.isDevelopment) {
            const style = this.getConsoleStyle(level);
            const prefix = `[${level.toUpperCase()}] ${entry.timestamp}`;

            switch (level) {
                case 'error':
                    console.error(`%c${prefix}`, style, message, error || '', context || '');
                    break;
                case 'warn':
                    console.warn(`%c${prefix}`, style, message, context || '');
                    break;
                case 'info':
                    console.info(`%c${prefix}`, style, message, context || '');
                    break;
                case 'debug':
                    console.log(`%c${prefix}`, style, message, context || '');
                    break;
            }
        }
    }

    /**
     * Get console styling for different log levels
     */
    private getConsoleStyle(level: LogLevel): string {
        const styles = {
            error: 'color: #ff4444; font-weight: bold;',
            warn: 'color: #ffaa00; font-weight: bold;',
            info: 'color: #4444ff; font-weight: bold;',
            debug: 'color: #888888;'
        };
        return styles[level];
    }

    /**
     * Send error to external logging service (e.g., Sentry, LogRocket)
     * This is a placeholder - implement based on your chosen service
     */
    private sendToExternalService(entry: Partial<LogEntry>): void {
        // External logging service integration can be implemented here (e.g., Sentry)
        // Example for Sentry:
        // if (window.Sentry) {
        //     window.Sentry.captureException(entry.error, {
        //         extra: { message: entry.message, context: entry.context }
        //     });
        // }
    }

    /**
     * Get all stored logs (useful for debugging)
     */
    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    /**
     * Clear all stored logs
     */
    clearLogs(): void {
        this.logs = [];
    }

    /**
     * Export logs as JSON (for support/debugging)
     */
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogLevel, LogEntry };
