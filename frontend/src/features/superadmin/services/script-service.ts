const uuidv4 = () => crypto.randomUUID();

export interface Script {
    id: string;
    name: string;
    type: 'analytics' | 'ads' | 'pixels' | 'chat' | 'custom';
    location: 'head' | 'footer' | 'after_login';
    loadingStrategy: 'async' | 'defer' | 'lazy' | 'interaction';
    pages: 'all' | 'public' | 'auth' | 'custom';
    customRoutes?: string;
    excludedRoutes?: string;
    deviceAttributes?: ('desktop' | 'tablet' | 'mobile')[];
    environment: 'production' | 'staging' | 'development';
    content: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const STORAGE_KEY = 'nay_scripts_manager';

export const ScriptService = {
    getAll: async (): Promise<Script[]> => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    getById: async (id: string): Promise<Script | undefined> => {
        const scripts = await ScriptService.getAll();
        return scripts.find(s => s.id === id);
    },

    create: async (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>): Promise<Script> => {
        const scripts = await ScriptService.getAll();
        const newScript: Script = {
            ...script,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        scripts.push(newScript);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
        return newScript;
    },

    update: async (id: string, updates: Partial<Script>): Promise<Script> => {
        const scripts = await ScriptService.getAll();
        const index = scripts.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Script not found');

        const updatedScript = {
            ...scripts[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        scripts[index] = updatedScript;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
        return updatedScript;
    },

    delete: async (id: string): Promise<void> => {
        const scripts = await ScriptService.getAll();
        const filtered = scripts.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },

    toggleStatus: async (id: string): Promise<Script> => {
        const scripts = await ScriptService.getAll();
        const index = scripts.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Script not found');

        scripts[index].isActive = !scripts[index].isActive;
        scripts[index].updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
        return scripts[index];
    }
};
