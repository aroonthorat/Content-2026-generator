
import React, { useState } from 'react';
import { generatePosterBlueprint, PosterBlueprint, PersonInfo } from '../services/geminiService';
import { fileToBase64 } from '../utils/file';
import SpinnerIcon from './icons/SpinnerIcon';
import DownloadIcon from './icons/DownloadIcon';
import FileUpload from './FileUpload';
import TrashIcon from './icons/TrashIcon';

const LANGUAGES = ['Marathi', 'Hindi', 'English'];

interface CandidateState extends PersonInfo {
    base64: string;
}

const PosterMaker: React.FC<{ onUsage: () => void }> = ({ onUsage }) => {
    const [step, setStep] = useState<'INPUT' | 'GENERATING' | 'RESULT'>('INPUT');
    
    // Form State
    const [mainCandidateName, setMainCandidateName] = useState('');
    const [mainDesignation, setMainDesignation] = useState('');
    const [partyName, setPartyName] = useState('');
    const [theme, setTheme] = useState('');
    const [language, setLanguage] = useState('Marathi');
    
    // Candidates state (including main if we want, but let's separate main and secondary for clarity)
    const [secondaryCandidates, setSecondaryCandidates] = useState<CandidateState[]>([]);
    const [mainPhoto, setMainPhoto] = useState<string | null>(null);
    const [logos, setLogos] = useState<string[]>([]);
    
    const [blueprint, setBlueprint] = useState<PosterBlueprint | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleMainPhoto = async (files: FileList) => {
        const base64 = await fileToBase64(files[0]);
        setMainPhoto(base64);
    };

    const handleSecondaryPhotos = async (files: FileList) => {
        const base64s = await Promise.all(Array.from(files).map(fileToBase64));
        const newOnes = base64s.map(b => ({ base64: b, name: '', designation: '' }));
        setSecondaryCandidates(prev => [...prev, ...newOnes]);
    };

    const handleLogos = async (files: FileList) => {
        const base64s = await Promise.all(Array.from(files).map(fileToBase64));
        setLogos(prev => [...prev, ...base64s]);
    };

    const removeSecondary = (idx: number) => setSecondaryCandidates(prev => prev.filter((_, i) => i !== idx));
    const removeLogo = (idx: number) => setLogos(prev => prev.filter((_, i) => i !== idx));

    const updateSecondaryName = (idx: number, name: string) => {
        setSecondaryCandidates(prev => prev.map((c, i) => i === idx ? { ...c, name } : c));
    };

    const handleGenerate = async () => {
        if (!mainCandidateName || !partyName || !theme) {
            setError("Please fill in main candidate name, party, and theme.");
            return;
        }
        setStep('GENERATING');
        setError(null);
        try {
            const result = await generatePosterBlueprint(
                { name: mainCandidateName, designation: mainDesignation },
                secondaryCandidates.map(c => ({ name: c.name, designation: c.designation })),
                partyName,
                logos.length,
                language,
                theme
            );
            setBlueprint(result);
            setStep('RESULT');
            onUsage();
        } catch (err: any) {
            setError(err.message || "Failed to generate blueprint.");
            setStep('INPUT');
        }
    };

    const reset = () => {
        setStep('INPUT');
        setBlueprint(null);
        setMainPhoto(null);
        setSecondaryCandidates([]);
        setLogos([]);
        setMainCandidateName('');
        setMainDesignation('');
        setPartyName('');
        setTheme('');
    };

    const renderPreview = () => {
        if (!blueprint) return null;
        
        const W = 1080;
        const H = 1350;
        
        return (
            <div 
                className="relative mx-auto overflow-hidden shadow-2xl rounded-sm bg-white" 
                style={{ 
                    width: '100%', 
                    paddingBottom: `${(H / W) * 100}%`,
                    background: blueprint.background.color 
                }}
            >
                <div className="absolute inset-0">
                    {blueprint.layers.sort((a, b) => a.zIndex - b.zIndex).map((layer) => {
                        const left = (layer.x / W) * 100;
                        const top = (layer.y / H) * 100;
                        
                        if (layer.type === 'text') {
                            return (
                                <div 
                                    key={layer.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap"
                                    style={{
                                        left: `${left}%`,
                                        top: `${top}%`,
                                        fontFamily: layer.font || 'sans-serif',
                                        fontSize: `clamp(8px, ${layer.size ? layer.size / 3.5 : 18}px, 60px)`,
                                        color: layer.color || '#000',
                                        opacity: layer.opacity || 1,
                                        zIndex: layer.zIndex,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {layer.content}
                                </div>
                            );
                        } else if (layer.type === 'image') {
                            let imgSrc = null;
                            
                            if (layer.id === 'candidate_1') {
                                if (mainPhoto) imgSrc = `data:image/jpeg;base64,${mainPhoto}`;
                            } else if (layer.id.includes('candidate')) {
                                const idx = parseInt(layer.id.split('_')[1]) - 2; // candidate_2 is index 0 of secondary
                                if (secondaryCandidates[idx]) imgSrc = `data:image/jpeg;base64,${secondaryCandidates[idx].base64}`;
                            } else if (layer.id.includes('logo')) {
                                const idx = parseInt(layer.id.split('_')[1]) - 1 || 0;
                                if (logos[idx]) imgSrc = `data:image/jpeg;base64,${logos[idx]}`;
                            }

                            return (
                                <div 
                                    key={layer.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border border-dashed border-gray-400 bg-gray-100/30"
                                    style={{
                                        left: `${left}%`,
                                        top: `${top}%`,
                                        width: `${(layer.width || (layer.id.includes('logo') ? 150 : 400)) / W * 100}%`,
                                        height: `${(layer.height || (layer.id.includes('logo') ? 150 : 400)) / H * 100}%`,
                                        zIndex: layer.zIndex
                                    }}
                                >
                                    {imgSrc ? (
                                        <img src={imgSrc} className="w-full h-full object-contain" alt={layer.id} />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] text-gray-400 font-mono text-center leading-none">
                                                {layer.id.includes('logo') ? 'LOGO' : 'CANDIDATE'}<br/>{layer.id.split('_')[1] || '1'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-slide-fade-in pb-10">
            {step === 'INPUT' && (
                <div className="bg-surface p-8 rounded-2xl border border-border shadow-xl space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-secondary/10 rounded-xl">
                            <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-textMain">Campaign Studio</h2>
                            <p className="text-textSub text-sm">Strategic Political Poster Architecture.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Column 1: Core Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-secondary tracking-widest border-b border-border pb-1">Main Candidate</h3>
                            <div>
                                <label className="text-[10px] font-bold text-textSub uppercase mb-1 block">Full Name</label>
                                <input type="text" value={mainCandidateName} onChange={e => setMainCandidateName(e.target.value)} className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-lg text-textMain focus:ring-1 focus:ring-secondary outline-none" placeholder="e.g. Rahul Patil" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-textSub uppercase mb-1 block">Designation</label>
                                <input type="text" value={mainDesignation} onChange={e => setMainDesignation(e.target.value)} className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-lg text-textMain focus:ring-1 focus:ring-secondary outline-none" placeholder="e.g. MLA Candidate" />
                            </div>
                            <FileUpload id="main-upload" label="Upload Main Photo" onFileSelect={handleMainPhoto} disabled={false} />
                            {mainPhoto && <p className="text-[10px] text-green-400 font-bold">✓ Photo Ready</p>}
                            
                            <div className="pt-4 space-y-4">
                                <h3 className="text-xs font-black uppercase text-secondary tracking-widest border-b border-border pb-1">Campaign Specs</h3>
                                <div>
                                    <label className="text-[10px] font-bold text-textSub uppercase mb-1 block">Party / Group</label>
                                    <input type="text" value={partyName} onChange={e => setPartyName(e.target.value)} className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-lg text-textMain focus:ring-1 focus:ring-secondary outline-none" placeholder="e.g. Vikas Aghadi" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-textSub uppercase mb-1 block">Theme</label>
                                    <input type="text" value={theme} onChange={e => setTheme(e.target.value)} className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-lg text-textMain focus:ring-1 focus:ring-secondary outline-none" placeholder="e.g. Local Development" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-textSub uppercase mb-1 block">Language</label>
                                    <div className="grid grid-cols-3 gap-1">
                                        {LANGUAGES.map(l => (
                                            <button key={l} onClick={() => setLanguage(l)} className={`py-2 text-[10px] font-bold rounded-md border transition-all ${language === l ? 'bg-secondary border-secondary text-white' : 'bg-black/20 border-border text-textSub'}`}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Column 2: Secondary Candidates */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-secondary tracking-widest border-b border-border pb-1">Secondary Leaders / People</h3>
                            <FileUpload id="secondary-upload" label="Add People" onFileSelect={handleSecondaryPhotos} disabled={false} />
                            <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {secondaryCandidates.map((c, idx) => (
                                    <div key={idx} className="p-3 bg-black/20 border border-border rounded-xl flex items-center gap-3 group relative">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                                            <img src={`data:image/jpeg;base64,${c.base64}`} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <input 
                                                type="text" 
                                                value={c.name} 
                                                onChange={e => updateSecondaryName(idx, e.target.value)}
                                                className="w-full bg-transparent text-xs text-textMain outline-none border-b border-transparent focus:border-secondary mb-1" 
                                                placeholder="Type person name..."
                                            />
                                            <p className="text-[10px] text-textMuted font-mono">PERSON {idx + 2}</p>
                                        </div>
                                        <button onClick={() => removeSecondary(idx)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {secondaryCandidates.length === 0 && <p className="text-center py-10 text-[10px] text-textMuted uppercase italic tracking-widest">No secondary people added</p>}
                            </div>
                        </div>

                        {/* Column 3: Logos */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-secondary tracking-widest border-b border-border pb-1">Party Logos</h3>
                            <FileUpload id="logo-upload" label="Upload Logos" onFileSelect={handleLogos} disabled={false} />
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {logos.map((img, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-border group bg-white/5 p-2">
                                        <img src={`data:image/jpeg;base64,${img}`} className="w-full h-full object-contain" />
                                        <button onClick={() => removeLogo(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                        <div className="absolute bottom-1 left-2 bg-black/50 text-[8px] text-white px-1 rounded">LOGO {idx+1}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                    <button onClick={handleGenerate} className="w-full py-5 bg-gradient-to-r from-secondary via-accent to-secondary bg-[length:200%_auto] animate-gradient-x text-white font-black text-xl rounded-2xl shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3">
                        <span>Architect Campaign Blueprint</span>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </button>
                </div>
            )}

            {step === 'GENERATING' && (
                <div className="bg-surface p-16 rounded-3xl border border-border shadow-2xl flex flex-col items-center text-center">
                    <div className="w-24 h-24 mb-8 relative">
                        <div className="absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-4 border-2 border-accent border-b-transparent rounded-full animate-spin-reverse"></div>
                    </div>
                    <h2 className="text-3xl font-black text-textMain mb-3 uppercase tracking-tighter italic">Generating Strategy</h2>
                    <p className="text-textSub max-w-sm text-sm leading-relaxed">Arranging {secondaryCandidates.length + 1} people and {logos.length} logos into a professional political hierarchy for {partyName}...</p>
                </div>
            )}

            {step === 'RESULT' && blueprint && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 bg-surface p-5 rounded-3xl border border-border shadow-2xl">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="font-black text-textMain uppercase tracking-widest text-xs italic">Strategic Draft</h3>
                            <span className="text-[10px] bg-black/40 text-textSub px-2 py-1 rounded-full border border-border">1080x1350</span>
                        </div>
                        {renderPreview()}
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                         <div className="bg-surface p-8 rounded-3xl border border-border shadow-2xl">
                             <div className="mb-8">
                                <h3 className="text-2xl font-black text-textMain mb-2 leading-none uppercase">{blueprint.posterTitle}</h3>
                                <p className="text-xs text-secondary font-bold uppercase tracking-widest">Blueprint Ready for Render</p>
                             </div>

                             <div className="space-y-4 mb-8">
                                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-border/50 pb-2">
                                     <span className="text-textSub">Theme</span>
                                     <span className="text-textMain">{theme}</span>
                                 </div>
                                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-border/50 pb-2">
                                     <span className="text-textSub">People Layers</span>
                                     <span className="text-textMain">{secondaryCandidates.length + 1} Assets</span>
                                 </div>
                                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-border/50 pb-2">
                                     <span className="text-textSub">Branding</span>
                                     <span className="text-textMain">{logos.length} Logos</span>
                                 </div>
                             </div>

                             <div className="bg-black/30 p-5 rounded-2xl border border-border mb-8">
                                 <h4 className="text-[10px] font-black text-secondary uppercase mb-4 tracking-[0.2em] italic">Campaign Slogans</h4>
                                 <div className="space-y-4">
                                     {blueprint.layers.filter(l => l.type === 'text' && (l.content?.length || 0) > 15).map((l, i) => (
                                         <div key={i} className="relative pl-6 before:absolute before:left-0 before:top-1 before:w-1.5 before:h-1.5 before:bg-accent before:rounded-full">
                                             <p className="text-xs text-textMain leading-relaxed italic">"{l.content}"</p>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             <div className="grid grid-cols-2 gap-3">
                                 <button onClick={() => setStep('INPUT')} className="py-4 bg-black/40 text-textSub font-black uppercase text-xs rounded-2xl hover:bg-black/60 transition-colors border border-border">Modify</button>
                                 <button 
                                     onClick={() => {
                                         const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' });
                                         const url = URL.createObjectURL(blob);
                                         const a = document.createElement('a');
                                         a.href = url;
                                         a.download = `blueprint-${mainCandidateName.replace(/\s+/g, '-')}.json`;
                                         a.click();
                                     }}
                                     className="py-4 bg-secondary text-white font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-secondary/90 shadow-lg shadow-secondary/20"
                                 >
                                     <DownloadIcon /> Export
                                 </button>
                             </div>
                             <button onClick={reset} className="w-full mt-6 text-[10px] text-textMuted hover:text-textMain underline font-bold uppercase tracking-widest">New Session</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PosterMaker;
