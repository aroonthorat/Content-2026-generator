
import React, { useState } from 'react';
import { UserAccount, UserRole, AppTheme, ThemeCategory, UserPermissions } from '../types';
import TrashIcon from './icons/TrashIcon';
import PaletteIcon from './icons/PaletteIcon';

interface AdminDashboardProps {
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onDeleteUser: (email: string) => void;
  onUpdatePermissions: (email: string, permissions: UserPermissions) => void;
  currentUserEmail: string;
  themes: AppTheme[];
  currentTheme: AppTheme;
  onSetTheme: (theme: AppTheme) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, onAddUser, onDeleteUser, onUpdatePermissions, currentUserEmail, themes, currentTheme, onSetTheme }) => {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('USER');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newUserEmail || !newUserName || !newUserPass) {
      setError("All fields required");
      return;
    }
    onAddUser({
      email: newUserEmail,
      name: newUserName,
      password: newUserPass,
      role: newUserRole,
      permissions: { mcq: true, reader: true, video: true, proVideo: false, poster: true, bulkEditor: true, mathReplicator: true },
      stats: { mcqGenerations: 0, ttsGenerations: 0, lastActive: 'Never' }
    });
    setNewUserEmail(''); setNewUserName(''); setNewUserPass('');
  };

  const togglePermission = (u: UserAccount, key: keyof UserPermissions) => {
    // Ensure permission object exists to avoid crash
    const currentPermissions = u.permissions || { mcq: true, reader: true, video: true, proVideo: false, poster: true, bulkEditor: true, mathReplicator: true };
    onUpdatePermissions(u.email, { ...currentPermissions, [key]: !currentPermissions[key] });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-8 animate-pop-in">
        <div className="bg-surface p-6 rounded-2xl border border-border">
            <h3 className="text-textSub text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">Theme Settings</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {themes.map((theme) => (
                    <button key={theme.id} onClick={() => onSetTheme(theme)} className={`p-3 rounded-xl border-2 transition-all ${currentTheme.id === theme.id ? 'border-primary bg-primary/10' : 'border-transparent bg-black/20 hover:border-textSub'}`}>
                        <span className="text-xs font-medium">{theme.name}</span>
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-surface p-8 rounded-2xl border border-border">
                <h2 className="text-xl font-bold text-textMain mb-4">Add User</h2>
                <form onSubmit={handleAdd} className="space-y-4">
                    <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-border rounded-lg text-textMain" placeholder="Name" />
                    <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-border rounded-lg text-textMain" placeholder="Email" />
                    <input type="text" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-border rounded-lg text-textMain" placeholder="Password" />
                    <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)} className="w-full px-3 py-2 bg-black/20 border border-border rounded-lg text-textMain"><option value="USER">User</option><option value="ADMIN">Admin</option></select>
                    {error && <div className="text-red-400 text-sm">{error}</div>}
                    <button type="submit" className="w-full py-2 bg-primary text-white font-semibold rounded-lg">Add User</button>
                </form>
            </div>

            <div className="bg-surface p-8 rounded-2xl border border-border flex flex-col">
                <h2 className="text-xl font-bold text-textMain mb-4">Manage Access</h2>
                <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    <ul className="space-y-3">
                        {users.map((u) => {
                            const perms = u.permissions || { mcq: true, reader: true, video: true, proVideo: false, poster: true, bulkEditor: true };
                            return (
                            <li key={u.email} className="p-4 bg-black/20 rounded-xl border border-border space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-textMain">{u.name} {u.role === 'ADMIN' && <span className="text-[10px] bg-primary/20 text-primary px-2 rounded-full">ADMIN</span>}</div>
                                        <div className="text-xs text-textSub">{u.email}</div>
                                    </div>
                                    {u.email !== currentUserEmail && <button onClick={() => onDeleteUser(u.email)} className="text-red-400 p-1 hover:bg-red-400/10 rounded-full"><TrashIcon className="w-4 h-4" /></button>}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => togglePermission(u, 'mcq')} className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${perms.mcq ? 'bg-primary text-white border-primary' : 'bg-black/40 text-textSub border-border'}`}>MCQ</button>
                                    <button onClick={() => togglePermission(u, 'reader')} className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${perms.reader ? 'bg-primary text-white border-primary' : 'bg-black/40 text-textSub border-border'}`}>Reader</button>
                                    <button onClick={() => togglePermission(u, 'poster')} className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${perms.poster ? 'bg-secondary text-white border-secondary' : 'bg-black/40 text-textSub border-border'}`}>Poster</button>
                                    <button onClick={() => togglePermission(u, 'video')} className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${perms.video ? 'bg-primary text-white border-primary' : 'bg-black/40 text-textSub border-border'}`}>Animation</button>
                                    <button onClick={() => togglePermission(u, 'proVideo')} className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${perms.proVideo ? 'bg-secondary text-white border-secondary' : 'bg-black/40 text-textSub border-border'}`}>Veo Video</button>
                                    <button onClick={() => togglePermission(u, 'bulkEditor')} className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${perms.bulkEditor ? 'bg-accent text-white border-accent' : 'bg-black/40 text-textSub border-border'}`}>Bulk Editor</button>
                                </div>
                            </li>
                        )})}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;
