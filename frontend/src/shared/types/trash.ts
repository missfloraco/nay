export interface TrashedItem {
    id: number;
    type: string;
    display_name: string;
    deleted_at: string;
    deleted_by?: {
        id: number;
        type: string;
    };
}

export interface TrashStats {
    total: number;
    byType: Record<string, number>;
}

export interface TrashActions {
    restore: (type: string, id: number) => Promise<void>;
    forceDelete: (type: string, id: number) => Promise<void>;
    bulkRestore: () => Promise<void>;
    bulkForceDelete: () => Promise<void>;
    emptyTrash: () => Promise<void>;
}
