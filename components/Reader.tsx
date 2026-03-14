
import React, { useState, useEffect, useRef } from 'react';
import { textToSpeech, restructureText } from '../services/geminiService';
import { playAudio } from '../utils/audio';
import { fileToBase64 } from '../utils/file';
import SpinnerIcon from './icons/SpinnerIcon';
import PlayIcon from './icons/PlayIcon';
import DownloadIcon from './icons/DownloadIcon';
import SparklesIcon from './icons/SparklesIcon';
import UploadIcon from './icons/UploadIcon';

const createWavFile = (pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Blob => {
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    const writeString = (v: DataView, o: number, s: string) => {
        for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
    };
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    new Uint8Array(buffer, 44).set(pcmData);
    return new Blob([buffer], { type: 'audio/wav' });
};

interface VoiceOption {
    id: string;
    voiceId: string;
    name: string;
    description: string;
    tones: string[];
    previewText: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
    // Standard Voices
    { id: 'alpha', voiceId: 'Puck', name: 'Alpha', description: 'Bright, youthful, and vibrant.', tones: ['Energetic', 'Casual', 'Friendly'], previewText: "Hello! I am Alpha. I have a bright and youthful energy." },
    { id: 'bravo', voiceId: 'Charon', name: 'Bravo', description: 'Deep, steady, and professional.', tones: ['Authoritative', 'Formal', 'Calm'], previewText: "Greetings. I am Bravo. My voice is deep, steady, and professional." },
    { id: 'delta', voiceId: 'Fenrir', name: 'Delta', description: 'Mature, gritty, and wise.', tones: ['Narrative', 'Intense', 'Soft'], previewText: "Welcome. I am Delta. I speak with a mature and wise perspective." },
    { id: 'echo', voiceId: 'Kore', name: 'Echo', description: 'Calm, soothing, and melodic.', tones: ['Relaxed', 'Gentle', 'Warm'], previewText: "Hi there. I am Echo. My voice is designed to be calm and soothing." },
    { id: 'foxtrot', voiceId: 'Zephyr', name: 'Foxtrot', description: 'Polished, articulate, and clear.', tones: ['Professional', 'News', 'Educational'], previewText: "Hello. I am Foxtrot. I speak with clarity and precision." },
    
    // New Creative Personas
    { id: 'narrator', voiceId: 'Fenrir', name: 'The Storyteller', description: 'Deep, raspy, perfect for audiobooks.', tones: ['Storytelling', 'Mystery', 'Fantasy'], previewText: "Once upon a time, in a land far away, there was a voice that could tell any story." },
    { id: 'anchor', voiceId: 'Charon', name: 'News Anchor', description: 'Trustworthy, clear, and authoritative.', tones: ['News', 'Urgent', 'Neutral'], previewText: "Breaking news. This is the latest update from the studio." },
    { id: 'gamer', voiceId: 'Puck', name: 'Streamer', description: 'High energy, hype, and fast-paced.', tones: ['Hype', 'Loud', 'Excited'], previewText: "What is up guys! Welcome back to the channel! Let's get into it!" },
    { id: 'professor', voiceId: 'Charon', name: 'Professor', description: 'Slow, articulate, and educational.', tones: ['Lecture', 'Slow', 'Clear'], previewText: "Today, we will discuss the fundamental principles of physics and how they apply to our world." },
    { id: 'noir', voiceId: 'Fenrir', name: 'Detective', description: 'Low, whispery, and serious.', tones: ['Whisper', 'Dark', 'Serious'], previewText: "It was a dark and stormy night. The rain wouldn't stop, and neither would I." },
];

const AMBIENCE_OPTIONS = [
    { id: 'none', name: 'Dry Voice', icon: '🔇' },
    { id: 'inspiring', name: 'Inspiring Piano', icon: '🎹' },
    { id: 'lofi', name: 'Lofi Chill', icon: '☕' },
    { id: 'nature', name: 'Forest Birds', icon: '🌲' },
    { id: 'cinematic', name: 'Deep Space', icon: '🌌' }
];

const LANGUAGES = ['English', 'Hindi', 'Marathi'];

const AI_PRESETS = [
    { label: 'Fix Grammar', instruction: 'Correct all grammar and punctuation errors while keeping the meaning identical.' },
    { label: 'Summarize', instruction: 'Keep the core meaning but make the text significantly more concise.' },
    { label: 'More Professional', instruction: 'Rewrite this to sound more formal, professional, and authoritative.' },
    { label: 'Add Excitement', instruction: 'Make the tone more enthusiastic and energetic.' }
];

interface ReaderProps {
    onUsage: () => void;
}

const Reader: React.FC<ReaderProps> = ({ onUsage }) => {
    const [text, setText] = useState<string>('');
    const [aiInstruction, setAiInstruction] = useState<string>('');
    const [language, setLanguage] = useState<string>('English');
    const [selectedVoice, setSelectedVoice] = useState<string>(VOICE_OPTIONS[0].id);
    const [selectedTone, setSelectedTone] = useState<string>(VOICE_OPTIONS[0].tones[0]);
    const [selectedAmbience, setSelectedAmbience] = useState<string>('none');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRestructuring, setIsRestructuring] = useState<boolean>(false);
    const [isPreviewing, setIsPreviewing] = useState<string | null>(null);
    const [isPlayingMaster, setIsPlayingMaster] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [audioData, setAudioData] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(true);

    const [voiceMode, setVoiceMode] = useState<'PRESET' | 'CLONE'>('PRESET');
    const [referenceAudio, setReferenceAudio] = useState<string | null>(null);
    const [referenceFileName, setReferenceFileName] = useState<string | null>(null);

    const activePlaybackRef = useRef<{ stop: () => void } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => { activePlaybackRef.current?.stop(); };
    }, []);

    const handleVoiceSelect = async (v: VoiceOption) => {
        if (isPreviewing) return;
        setVoiceMode('PRESET');
        setSelectedVoice(v.id);
        setSelectedTone(v.tones[0]);
        
        setIsPreviewing(v.id);
        try {
            const previewB64 = await textToSpeech(v.previewText, 'English', v.tones[0], v.voiceId);
            const playback = playAudio(previewB64);
            await playback.onEnded;
        } catch (err) {
            console.error("Preview failed", err);
        } finally {
            setIsPreviewing(null);
        }
    };

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setReferenceFileName(file.name);
        try {
            const b64 = await fileToBase64(file);
            setReferenceAudio(b64);
            setVoiceMode('CLONE');
        } catch (err) {
            setError("Failed to process audio file.");
        }
    };

    const handleRestructure = async (customInstruction?: string) => {
        const finalInstruction = customInstruction || aiInstruction;
        if (!text.trim() || !finalInstruction.trim()) return;
        setIsRestructuring(true);
        setError(null);
        try {
            const newText = await restructureText(text, finalInstruction);
            setText(newText);
            setAiInstruction('');
        } catch (err) {
            setError("AI Restructuring failed.");
        } finally {
            setIsRestructuring(false);
        }
    };

    const handleGenerateAudio = async () => {
        if (!text.trim()) return;
        if (voiceMode === 'CLONE' && !referenceAudio) {
            setError("Please upload a reference audio to clone a voice.");
            return;
        }
        setIsLoading(true);
        setError(null);
        
        const moodName = AMBIENCE_OPTIONS.find(a => a.id === selectedAmbience)?.name;
        const selectedOption = VOICE_OPTIONS.find(v => v.id === selectedVoice);
        const apiVoiceId = selectedOption?.voiceId;

        try {
            const base64Audio = await textToSpeech(
                text, 
                language, 
                selectedTone, 
                voiceMode === 'PRESET' ? apiVoiceId : undefined,
                voiceMode === 'CLONE' ? referenceAudio! : undefined,
                selectedAmbience !== 'none' ? moodName : undefined
            );
            setAudioData(base64Audio);
            setIsEditing(false);
            onUsage();
        } catch (err: any) {
            setError(err.message || "Generation failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePlayback = async () => {
        if (isPlayingMaster) {
            activePlaybackRef.current?.stop();
            setIsPlayingMaster(false);
        } else if (audioData) {
            setIsPlayingMaster(true);
            const playback = playAudio(audioData);
            activePlaybackRef.current = playback;
            try {
                await playback.onEnded;
            } finally {
                if (activePlaybackRef.current === playback) {
                    setIsPlayingMaster(false);
                    activePlaybackRef.current = null;
                }
            }
        }
    };

    const handleDownload = () => {
        if (!audioData) return;
        const binary = atob(audioData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const wavBlob = createWavFile(bytes, 24000, 1, 16);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neural-master.wav`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-pop-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-textMain tracking-tighter uppercase italic">Neural Voice Studio</h2>
                {audioData && <button onClick={() => { activePlaybackRef.current?.stop(); setIsEditing(!isEditing); }} className={`px-4 py-2 rounded-xl text-xs font-bold border ${isEditing ? 'bg-primary text-white border-primary' : 'bg-surface text-textSub'}`}>{isEditing ? 'View Master' : 'Edit Script'}</button>}
            </div>

            {isEditing && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className="bg-surface p-1 rounded-xl border border-border flex">
                            <button onClick={() => setVoiceMode('PRESET')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${voiceMode === 'PRESET' ? 'bg-primary text-white shadow-lg' : 'text-textSub'}`}>Preset Personas</button>
                            <button onClick={() => setVoiceMode('CLONE')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${voiceMode === 'CLONE' ? 'bg-secondary text-white shadow-lg' : 'text-textSub'}`}>Voice Cloning</button>
                        </div>

                        {voiceMode === 'PRESET' ? (
                            <div className="bg-surface p-5 rounded-2xl border border-border shadow-xl animate-slide-fade-in">
                                <label className="text-[10px] uppercase font-black text-textMuted mb-4 block tracking-widest">Select Persona</label>
                                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
                                    {VOICE_OPTIONS.map((v, index) => (
                                        <React.Fragment key={v.id}>
                                            {index === 5 && <div className="text-[10px] font-black text-textMuted uppercase tracking-widest mt-4 mb-2 sticky top-0 bg-surface z-10 py-2">Creative Personas</div>}
                                            <div onClick={() => handleVoiceSelect(v)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative group shrink-0 ${selectedVoice === v.id ? 'bg-primary/10 border-primary shadow-inner' : 'bg-black/20 border-transparent hover:border-textSub'}`}>
                                                {isPreviewing === v.id && <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary text-[8px] text-white px-2 py-1 rounded-full animate-pulse font-black uppercase">Previewing</div>}
                                                <span className={`font-black text-lg block ${selectedVoice === v.id ? 'text-primary' : 'text-textMain'}`}>{v.name}</span>
                                                <p className="text-xs text-textSub leading-tight mb-3">{v.description}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {v.tones.map(t => (
                                                        <button key={t} onClick={(e) => { e.stopPropagation(); setSelectedTone(t); setSelectedVoice(v.id); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${selectedVoice === v.id && selectedTone === t ? 'bg-primary text-white' : 'bg-black/30 text-textMuted'}`}>{t}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-surface p-5 rounded-2xl border border-secondary/30 shadow-xl animate-slide-fade-in space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><UploadIcon className="w-5 h-5" /></div>
                                    <label className="text-[10px] uppercase font-black text-secondary tracking-widest block">Clone Voice Sample</label>
                                </div>
                                <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${referenceAudio ? 'border-secondary bg-secondary/5' : 'border-border hover:border-secondary'}`}>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={handleAudioUpload} />
                                    {referenceAudio ? (
                                        <>
                                            <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center text-secondary mb-3"><SparklesIcon className="w-6 h-6" /></div>
                                            <p className="text-xs text-textMain font-bold">{referenceFileName}</p>
                                            <p className="text-[10px] text-textSub mt-1">Ready for cloning</p>
                                        </>
                                    ) : (
                                        <>
                                            <UploadIcon className="w-10 h-10 text-textMuted mb-3" />
                                            <p className="text-xs text-textSub font-bold">Upload audio file</p>
                                            <p className="text-[10px] text-textMuted mt-1">Mimic any voice naturally</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-surface p-5 rounded-2xl border border-border shadow-xl">
                            <label className="text-[10px] uppercase font-black text-textMuted mb-4 block tracking-widest">Atmospheric Mood (Optional)</label>
                            <div className="grid grid-cols-2 gap-2">
                                {AMBIENCE_OPTIONS.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => setSelectedAmbience(a.id)}
                                        className={`px-3 py-3 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-2 ${selectedAmbience === a.id ? 'bg-accent border-accent text-white shadow-lg' : 'bg-black/20 border-transparent text-textSub hover:border-textSub'}`}
                                    >
                                        <span className="text-sm">{a.icon}</span>
                                        <span className="truncate">{a.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-surface p-5 rounded-2xl border border-border shadow-xl">
                            <label className="text-[10px] uppercase font-black text-textMuted mb-4 block tracking-widest">Language</label>
                            <div className="grid grid-cols-3 gap-2">
                                {LANGUAGES.map(lang => (
                                    <button key={lang} onClick={() => setLanguage(lang)} className={`px-2 py-3 rounded-xl text-[10px] font-bold border transition-all ${language === lang ? 'bg-primary border-primary text-white' : 'bg-black/20 border-transparent text-textSub'}`}>{lang}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="bg-surface p-1 rounded-3xl border border-border shadow-2xl relative">
                            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type script here..." className="w-full h-80 p-6 bg-transparent text-textMain text-xl border-none focus:ring-0 resize-none placeholder-textMuted leading-relaxed" disabled={isLoading || isRestructuring} />
                            <div className="absolute bottom-4 left-6 text-[10px] font-mono text-textMuted uppercase">{text.length} CHARS</div>
                        </div>

                        {text.length > 5 && (
                            <div className="animate-slide-fade-in space-y-3">
                                <div className="flex flex-wrap gap-2">{AI_PRESETS.map((p) => <button key={p.label} onClick={() => handleRestructure(p.instruction)} disabled={isRestructuring} className="px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-xl text-[10px] font-bold text-secondary">{p.label}</button>)}</div>
                                <div className={`flex gap-2 items-center bg-surface p-2 rounded-2xl border transition-all ${isRestructuring ? 'border-secondary animate-pulse' : 'border-border'}`}>
                                    <input type="text" value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)} placeholder="AI Instruction: e.g. 'Make it like a meditation'" className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-textMain px-4 py-2" />
                                    <button onClick={() => handleRestructure()} disabled={!aiInstruction.trim() || isRestructuring} className="px-5 py-2.5 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-tight">Apply AI</button>
                                </div>
                            </div>
                        )}

                        <button onClick={handleGenerateAudio} disabled={isLoading || isRestructuring || !text.trim()} className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl ${isLoading ? 'bg-surface text-textSub cursor-wait' : 'bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-x text-white hover:scale-[1.01]'}`}>{isLoading ? <><SpinnerIcon /><span>Mastering...</span></> : 'Create Neural Master'}</button>
                    </div>
                </div>
            )}

            {error && <div className="bg-red-900/40 border border-red-500 text-red-300 p-4 rounded-2xl text-center text-sm">{error}</div>}

            {audioData && !isLoading && !isEditing && (
                <div className="w-full bg-surface rounded-3xl p-10 border border-primary/30 shadow-2xl animate-slide-fade-in flex flex-col items-center text-center gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
                    <div className="flex flex-col gap-2">
                        <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest w-fit mx-auto mb-2">Neural Master Export</div>
                        <h3 className="text-3xl font-black text-textMain tracking-tight uppercase">
                            {voiceMode === 'CLONE' ? 'Custom Cloned Voice' : `${VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name}`}
                            {selectedAmbience !== 'none' && <span className="text-accent text-lg block font-medium lowercase">with {AMBIENCE_OPTIONS.find(a => a.id === selectedAmbience)?.name}</span>}
                        </h3>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={handleTogglePlayback} className={`w-24 h-24 rounded-full flex items-center justify-center hover:scale-110 shadow-2xl transition-all ${isPlayingMaster ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>
                            {isPlayingMaster ? <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <PlayIcon className="w-10 h-10" />}
                        </button>
                        <button onClick={handleDownload} className="flex items-center gap-3 px-10 py-5 bg-black/40 text-white font-black rounded-2xl hover:bg-black/60 transition-all border border-white/5 shadow-lg"><DownloadIcon /><span>Export Master</span></button>
                    </div>
                    {isPlayingMaster && <div className="w-full max-w-xs bg-black/20 h-1 rounded-full overflow-hidden"><div className="h-full bg-secondary animate-pulse-slow w-full"></div></div>}
                    <p className="text-xs text-textMuted max-w-lg italic">" {text.substring(0, 100)}... "</p>
                </div>
            )}
            <style>{`
                @keyframes pulse-slow { 0%, 100% { opacity: 0.3; transform: scaleX(0.1); } 50% { opacity: 1; transform: scaleX(1); } }
                .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; transform-origin: left; }
            `}</style>
        </div>
    );
};

export default Reader;
