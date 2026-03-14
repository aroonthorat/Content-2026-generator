
import React from 'react';
import { AppTheme, ThemeCategory, LogoVariant } from '../types';
import CloseIcon from './icons/CloseIcon';
import PaletteIcon from './icons/PaletteIcon';
import LogoIcon from './icons/LogoIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themes: AppTheme[];
  currentTheme: AppTheme;
  onSetTheme: (theme: AppTheme) => void;
  currentLogo: LogoVariant;
  onSetLogo: (logo: LogoVariant) => void;
  mcqReaderTitle: string;
  onSetMcqReaderTitle: (title: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, themes, currentTheme, onSetTheme, currentLogo, onSetLogo, mcqReaderTitle, onSetMcqReaderTitle }) => {
  if (!isOpen) return null;

  const categories: ThemeCategory[] = ['Basic', 'Chemistry', 'Biology', 'Physics', 'Social Studies', 'English'];
  const logos: { id: LogoVariant; label: string }[] = [
    { id: 'DEFAULT', label: 'Chemistry' },
    { id: 'ATOM', label: 'Atomic' },
    { id: 'BRAIN', label: 'Neural' },
    { id: 'BOOK', label: 'Reader' },
    { id: 'ROBOT', label: 'AI Bot' },
    { id: 'SPARK', label: 'Idea' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-3xl bg-surface rounded-2xl border border-border shadow-2xl animate-pop-in flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
            <PaletteIcon className="w-6 h-6 text-primary" />
            Appearance Settings
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-textSub hover:text-textMain hover:bg-white/10 rounded-full transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* General Settings */}
          <div>
            <h3 className="text-textSub font-bold uppercase tracking-wider text-sm mb-3 border-b border-border/30 pb-1">General Settings</h3>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="text-xs font-medium text-textSub mb-1 block">MCQ Feature Name</label>
                    <input 
                        type="text" 
                        value={mcqReaderTitle}
                        onChange={(e) => onSetMcqReaderTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-black/20 border border-border rounded-xl text-textMain focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                        placeholder="e.g. Quiz Scanner"
                    />
                </div>
            </div>
          </div>

          {/* Logo Settings */}
          <div>
            <h3 className="text-textSub font-bold uppercase tracking-wider text-sm mb-3 border-b border-border/30 pb-1">Logo Style</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {logos.map((logo) => (
                <button
                  key={logo.id}
                  onClick={() => onSetLogo(logo.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                    currentLogo === logo.id 
                    ? 'border-accent bg-accent/10' 
                    : 'border-transparent bg-black/20 hover:border-textSub'
                  }`}
                >
                  <div className="w-10 h-10">
                    <LogoIcon variant={logo.id} className="w-full h-full" />
                  </div>
                  <span className={`text-xs font-medium ${currentLogo === logo.id ? 'text-accent' : 'text-textSub'}`}>
                    {logo.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Settings */}
          {categories.map(category => {
             const categoryThemes = themes.filter(t => t.category === category);
             if (categoryThemes.length === 0) return null;

             return (
                 <div key={category}>
                     <h3 className="text-textSub font-bold uppercase tracking-wider text-sm mb-3 border-b border-border/30 pb-1">{category} Themes</h3>
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryThemes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => onSetTheme(theme)}
                                className={`relative group p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                    currentTheme.id === theme.id 
                                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
                                    : 'border-transparent bg-black/20 hover:border-textSub hover:bg-black/30'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: theme.colors['--color-background'] }}></div>
                                    <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: theme.colors['--color-primary'] }}></div>
                                    <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: theme.colors['--color-accent'] }}></div>
                                </div>
                                <span className={`block font-semibold text-sm ${currentTheme.id === theme.id ? 'text-primary' : 'text-textMain'}`}>
                                    {theme.name}
                                </span>
                                {currentTheme.id === theme.id && (
                                    <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full shadow-glow-sm"></div>
                                )}
                            </button>
                        ))}
                     </div>
                 </div>
             )
          })}
        </div>
        
        <div className="p-4 border-t border-border flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/80 transition-colors"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
