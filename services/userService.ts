
import { User, UserAccount, UserPermissions, UserRole, SavedProject } from '../types';

const STORAGE_KEY_USERS = 'app_users';
const STORAGE_KEY_SESSION = 'active_user';
const STORAGE_KEY_PROJECTS = 'saved_projects';

const DEFAULT_PERMISSIONS: UserPermissions = { 
  mcq: true, 
  reader: true, 
  video: true, 
  proVideo: true, 
  poster: true, 
  bulkEditor: true, 
  mathReplicator: true,
  aiVideoGenerator: true
};

// Initial seed data
const INITIAL_USERS: UserAccount[] = [
  { 
    email: 'aroonthorat@Dev.com', 
    password: 'At@12345', 
    name: 'Aroon Thorat', 
    role: 'ADMIN',
    permissions: DEFAULT_PERMISSIONS,
    stats: { mcqGenerations: 0, ttsGenerations: 0, lastActive: new Date().toLocaleString() }
  },
  { 
    email: 'Demo@123.com', 
    password: 'demo@123', 
    name: 'Demo User', 
    role: 'USER',
    permissions: DEFAULT_PERMISSIONS,
    stats: { mcqGenerations: 0, ttsGenerations: 0, lastActive: new Date().toLocaleString() }
  },
  { 
    email: 'ab.shaan125', 
    password: 'Pass@125', 
    name: 'Shaan', 
    role: 'USER', 
    permissions: DEFAULT_PERMISSIONS,
    stats: { mcqGenerations: 0, ttsGenerations: 0, lastActive: new Date().toLocaleString() }
  }
];

// Helper to get raw users from storage
const getStoredUsers = (): UserAccount[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_USERS);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
            return INITIAL_USERS;
        }
        const parsed = JSON.parse(stored);
        
        const existingEmails = new Set(parsed.map((u: UserAccount) => u.email.toLowerCase()));
        const missing = INITIAL_USERS.filter(u => !existingEmails.has(u.email.toLowerCase()));
        
        if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(merged));
            return merged;
        }

        let updated = false;
        const migrated = parsed.map((u: UserAccount) => {
            let perms = { ...u.permissions };
            let changed = false;

            if (typeof perms.poster === 'undefined') { perms.poster = true; changed = true; }
            if (typeof perms.proVideo === 'undefined') { perms.proVideo = u.role === 'ADMIN'; changed = true; }
            if (typeof perms.bulkEditor === 'undefined') { perms.bulkEditor = true; changed = true; }
            if (typeof perms.mathReplicator === 'undefined') { perms.mathReplicator = true; changed = true; }
            if (typeof perms.aiVideoGenerator === 'undefined') { perms.aiVideoGenerator = true; changed = true; }

            if (changed) {
                updated = true;
                return { ...u, permissions: perms };
            }
            return u;
        });

        if (updated) {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(migrated));
            return migrated;
        }

        return parsed;
    } catch (e) {
        return INITIAL_USERS;
    }
};

export const userService = {
    getSession: (): User | null => {
        try {
            const session = localStorage.getItem(STORAGE_KEY_SESSION);
            return session ? JSON.parse(session) : null;
        } catch { return null; }
    },

    login: async (email: string, password: string): Promise<User> => {
        await new Promise(r => setTimeout(r, 800));
        const users = getStoredUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (!user) throw new Error("Invalid email or password");
        
        const sessionUser: User = {
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions
        };
        
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
        return sessionUser;
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEY_SESSION);
    },

    register: async (newUser: UserAccount): Promise<User> => {
        await new Promise(r => setTimeout(r, 1000));
        const users = getStoredUsers();
        
        if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
            throw new Error("User already exists");
        }

        const updatedUsers = [...users, newUser];
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
        
        const sessionUser: User = {
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            permissions: newUser.permissions
        };
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
        return sessionUser;
    },

    getAllUsers: (): UserAccount[] => {
        return getStoredUsers();
    },

    addUser: (user: UserAccount) => {
        const users = getStoredUsers();
        if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) return;
        const updated = [...users, user];
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
    },

    deleteUser: (email: string) => {
        const users = getStoredUsers();
        const updated = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
    },

    updatePermissions: (email: string, permissions: UserPermissions) => {
        const users = getStoredUsers();
        const updated = users.map(u => 
            u.email.toLowerCase() === email.toLowerCase() 
            ? { ...u, permissions } 
            : u
        );
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
        
        const currentSession = userService.getSession();
        if (currentSession && currentSession.email.toLowerCase() === email.toLowerCase()) {
            const newSession = { ...currentSession, permissions };
            localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newSession));
        }
    },

    trackUsage: (email: string) => {
        const users = getStoredUsers();
        const updated = users.map(u => 
            u.email.toLowerCase() === email.toLowerCase() 
            ? { ...u, stats: { ...u.stats, lastActive: new Date().toLocaleString() } }
            : u
        );
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
    },

    // ── Project persistence ──────────────────────────────────────────
    saveProject: (project: SavedProject): void => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
            const all: SavedProject[] = raw ? JSON.parse(raw) : [];
            // Replace existing or append
            const idx = all.findIndex(p => p.id === project.id);
            if (idx >= 0) all[idx] = project;
            else all.push(project);
            localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(all));
        } catch (e) { /* storage full – silently skip */ }
    },

    getProjects: (userEmail: string): SavedProject[] => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
            const all: SavedProject[] = raw ? JSON.parse(raw) : [];
            return all
                .filter(p => p.userEmail.toLowerCase() === userEmail.toLowerCase())
                .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        } catch { return []; }
    },

    deleteProject: (projectId: string): void => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
            const all: SavedProject[] = raw ? JSON.parse(raw) : [];
            localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(all.filter(p => p.id !== projectId)));
        } catch { /* ignore */ }
    },
};

