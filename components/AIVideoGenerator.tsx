import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateVideoScript, VideoScript, textToSpeech, VideoScene } from '../services/geminiService';
import { fileToBase64 } from '../utils/file';
import { playAudio, initAudio } from '../utils/audio';
import { userService } from '../services/userService';
import { SavedProject } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

interface AIVideoGeneratorProps {
  onUsage?: () => void;
  userEmail?: string;
}

type SceneAudioStatus = 'idle' | 'generating' | 'done' | 'error';

// ── simple uuid-like id ──────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const AIVideoGenerator: React.FC<AIVideoGeneratorProps> = ({ onUsage, userEmail }) => {
  const [projectId, setProjectId]     = useState(uid);
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [videoType, setVideoType]     = useState<'SHORT' | 'LONG'>('SHORT');

  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [script, setScript]           = useState<VideoScript | null>(null);
  const [error, setError]             = useState('');

  const [sceneImages, setSceneImages] = useState<Record<string, string>>({});
  const [sceneAudio, setSceneAudio]   = useState<Record<string, string>>({});
  // per-scene TTS status
  const [sceneAudioStatus, setSceneAudioStatus] = useState<Record<string, SceneAudioStatus>>({});

  const [isPlaying, setIsPlaying]             = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(-1);

  // saved projects panel
  const [savedProjects, setSavedProjects]     = useState<SavedProject[]>([]);
  const [showSaved, setShowSaved]             = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // ── Load saved projects on mount ─────────────────────────────────
  useEffect(() => {
    if (userEmail) setSavedProjects(userService.getProjects(userEmail));
  }, [userEmail]);

  // ── Auto-save whenever script / images change ─────────────────────
  useEffect(() => {
    if (!script || !userEmail) return;
    const project: SavedProject = {
      id: projectId,
      userEmail,
      title,
      description,
      videoType,
      script,
      sceneImages,
      savedAt: new Date().toISOString(),
    };
    userService.saveProject(project);
    setSavedProjects(userService.getProjects(userEmail));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script, sceneImages]);

  // ── Restore a saved project ───────────────────────────────────────
  const handleLoadProject = (p: SavedProject) => {
    setProjectId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setVideoType(p.videoType);
    setScript(p.script);
    setSceneImages(p.sceneImages || {});
    setSceneAudio({});
    setSceneAudioStatus({});
    setError('');
    setShowSaved(false);
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    userService.deleteProject(id);
    if (userEmail) setSavedProjects(userService.getProjects(userEmail));
  };

  // ── New project (reset) ───────────────────────────────────────────
  const handleNewProject = () => {
    setProjectId(uid());
    setTitle('');
    setDescription('');
    setVideoType('SHORT');
    setScript(null);
    setSceneImages({});
    setSceneAudio({});
    setSceneAudioStatus({});
    setError('');
  };

  // ── Generate script ───────────────────────────────────────────────
  const handleGenerateScript = async () => {
    if (!title || !description) { setError('Please provide both title and description'); return; }
    setError('');
    setIsGeneratingScript(true);
    setScript(null);
    setSceneImages({});
    setSceneAudio({});
    setSceneAudioStatus({});
    try {
      const generatedScript = await generateVideoScript(title, description, videoType);
      setScript(generatedScript);
      if (onUsage) onUsage();
    } catch (err: any) {
      setError(err.message || 'Failed to generate script');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // ── Generate voiceover for ONE scene (with retry) ─────────────────
  const generateSceneAudio = useCallback(async (scene: VideoScene, attempt = 1): Promise<string> => {
    try {
      return await textToSpeech(scene.narration, 'English', 'Professional', 'Charon');
    } catch (err: any) {
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1500 * attempt));
        return generateSceneAudio(scene, attempt + 1);
      }
      throw err;
    }
  }, []);

  // ── Generate ALL voiceovers – scene by scene ──────────────────────
  const handleGenerateAllAudio = async () => {
    if (!script) return;
    setError('');

    for (const scene of script.scenes) {
      if (sceneAudio[scene.id]) continue; // already generated

      setSceneAudioStatus(prev => ({ ...prev, [scene.id]: 'generating' }));
      try {
        const audioBase64 = await generateSceneAudio(scene);
        setSceneAudio(prev => ({ ...prev, [scene.id]: audioBase64 }));
        setSceneAudioStatus(prev => ({ ...prev, [scene.id]: 'done' }));
      } catch (err: any) {
        setSceneAudioStatus(prev => ({ ...prev, [scene.id]: 'error' }));
        setError(`Voiceover failed for Scene "${scene.narration.slice(0, 40)}…". You can retry just that scene below.`);
        // Continue with remaining scenes instead of aborting
      }
    }
  };

  // ── Retry single scene voiceover ─────────────────────────────────
  const handleRetrySceneAudio = async (scene: VideoScene) => {
    setSceneAudioStatus(prev => ({ ...prev, [scene.id]: 'generating' }));
    try {
      const audioBase64 = await generateSceneAudio(scene);
      setSceneAudio(prev => ({ ...prev, [scene.id]: audioBase64 }));
      setSceneAudioStatus(prev => ({ ...prev, [scene.id]: 'done' }));
      setError('');
    } catch {
      setSceneAudioStatus(prev => ({ ...prev, [scene.id]: 'error' }));
    }
  };

  // ── Image upload ──────────────────────────────────────────────────
  const handleImageUpload = async (sceneId: string, file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setSceneImages(prev => ({ ...prev, [sceneId]: base64 }));
    } catch { setError('Failed to upload image'); }
  };

  const allImagesUploaded = !!(script && script.scenes.every(s => sceneImages[s.id]));
  const allAudioGenerated = !!(script && script.scenes.every(s => sceneAudio[s.id]));
  const anyAudioGenerating = !!(script && script.scenes.some(s => sceneAudioStatus[s.id] === 'generating'));
  const hasAnyAudioError   = !!(script && script.scenes.some(s => sceneAudioStatus[s.id] === 'error'));

  // ── Playback ──────────────────────────────────────────────────────
  const handlePlayAnimation = async () => {
    if (!script || !allImagesUploaded) return;
    initAudio();
    setIsPlaying(true);
    setCurrentSceneIndex(0);
    let idx = 0;
    for (const scene of script.scenes) {
      setCurrentSceneIndex(idx);
      await new Promise<void>((resolve) => {
        if (sceneAudio[scene.id]) {
          const p = playAudio(sceneAudio[scene.id]) as any;
          if (p && typeof p.then === 'function') {
            p.then((pb: any) => {
              if (pb?.onEnded) pb.onEnded.catch(() => {}).finally(() => resolve());
              else resolve();
            }).catch(() => resolve());
          } else if (p?.onEnded) {
            p.onEnded.catch(() => {}).finally(() => resolve());
          } else resolve();
        } else {
          setTimeout(resolve, scene.duration * 1000);
        }
      });
      idx++;
    }
    setCurrentSceneIndex(-1);
    setIsPlaying(false);
  };

  // ── Playback fullscreen ───────────────────────────────────────────
  if (isPlaying && script && currentSceneIndex >= 0) {
    const currentScene = script.scenes[currentSceneIndex];
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
        <div ref={previewRef} className="relative w-full max-w-4xl aspect-[16/9] bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
          {sceneImages[currentScene.id] && (
            <img src={sceneImages[currentScene.id]} alt="Scene" className="w-full h-full object-cover opacity-90 transition-opacity duration-1000" />
          )}
          <div className="absolute bottom-10 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/70 to-transparent text-center">
            <p className="text-2xl text-white font-bold tracking-wide drop-shadow-md">{currentScene.narration}</p>
          </div>
          <div className="absolute top-4 right-4 text-xs bg-black/60 text-white px-3 py-1 rounded-full">
            Scene {currentSceneIndex + 1} / {script.scenes.length}
          </div>
        </div>
        <button onClick={() => { setIsPlaying(false); setCurrentSceneIndex(-1); }}
          className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold uppercase tracking-wider transition-transform hover:scale-105">
          Stop Playback
        </button>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-pop-in pb-12">

      {/* ── Header bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-black text-textMain flex items-center gap-3">🎬 AI Animated Video Generator</h2>
        <div className="flex gap-2">
          {script && (
            <button onClick={handleNewProject}
              className="px-4 py-2 border border-border text-textSub hover:text-textMain rounded-lg text-sm font-bold transition-colors">
              + New Project
            </button>
          )}
          {userEmail && savedProjects.length > 0 && (
            <button onClick={() => setShowSaved(v => !v)}
              className="px-4 py-2 bg-surface border border-border text-textSub hover:text-textMain rounded-lg text-sm font-bold transition-colors relative">
              📂 My Projects
              <span className="ml-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">{savedProjects.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Saved Projects Panel ────────────────────────────────────── */}
      {showSaved && savedProjects.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border shadow-lg overflow-hidden animate-pop-in">
          <div className="p-4 bg-black/20 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-textMain">Saved Projects</h3>
            <button onClick={() => setShowSaved(false)} className="text-textSub hover:text-textMain text-lg">✕</button>
          </div>
          <div className="divide-y divide-border max-h-72 overflow-y-auto">
            {savedProjects.map(p => {
              const done  = Object.keys(p.sceneImages || {}).length;
              const total = p.script?.scenes?.length ?? 0;
              return (
                <div key={p.id} onClick={() => handleLoadProject(p)}
                  className="p-4 hover:bg-black/20 cursor-pointer flex items-center justify-between gap-4 group transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-textMain truncate">{p.title || 'Untitled'}</p>
                    <p className="text-xs text-textSub mt-0.5">
                      {p.videoType} • {total} scenes • {done}/{total} images •{' '}
                      {new Date(p.savedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </p>
                    {/* Mini progress bar */}
                    <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden w-40">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: total ? `${(done/total)*100}%` : '0%' }} />
                    </div>
                  </div>
                  <button onClick={(e) => handleDeleteProject(p.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-lg transition-opacity px-2">
                    🗑
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Input Form ──────────────────────────────────────────────── */}
      <div className="p-8 bg-surface rounded-2xl border border-border shadow-lg">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 text-red-400 rounded-xl text-sm">{error}</div>
        )}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-textSub mb-2">Video Title</label>
              <input type="text" placeholder="e.g. History of the Roman Empire"
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/30 border border-border rounded-xl p-3 text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-textSub mb-2">Video Format</label>
              <select value={videoType} onChange={(e) => setVideoType(e.target.value as 'SHORT' | 'LONG')}
                className="w-full bg-black/30 border border-border rounded-xl p-3 text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="SHORT">Short-form (Shorts / Reels)</option>
                <option value="LONG">Long-form (YouTube)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-textSub mb-2">Video Description</label>
            <textarea rows={3} placeholder="Describe the storyboard, theme, message…"
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/30 border border-border rounded-xl p-3 text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" />
          </div>
          <button onClick={handleGenerateScript}
            disabled={isGeneratingScript || !title || !description}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isGeneratingScript ? <><SpinnerIcon /><span>Generating Script…</span></> : (script ? '↻ Regenerate Script' : 'Generate Script & Storyboard')}
          </button>
        </div>
      </div>

      {/* ── Script / Scenes ─────────────────────────────────────────── */}
      {script && (
        <div className="bg-surface rounded-2xl border border-border shadow-lg overflow-hidden">

          {/* Script header */}
          <div className="p-6 bg-black/20 border-b border-border flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-textMain">{script.title}</h3>
              <p className="text-textSub text-sm mt-1">
                {script.scenes.length} Scenes • {script.totalDuration}s •{' '}
                <span className="text-green-400">{Object.keys(sceneImages).length}/{script.scenes.length} images</span>
                {' • '}
                <span className={hasAnyAudioError ? 'text-red-400' : 'text-blue-400'}>
                  {Object.values(sceneAudioStatus).filter(s => s === 'done').length}/{script.scenes.length} audio
                </span>
                {userEmail && <span className="ml-2 text-xs text-textSub italic">● auto-saved</span>}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {/* Voiceover button */}
              <button
                onClick={handleGenerateAllAudio}
                disabled={anyAudioGenerating || allAudioGenerated}
                className="px-4 py-2 bg-secondary/80 hover:bg-secondary text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {anyAudioGenerating ? <><SpinnerIcon /><span>Generating…</span></> : (allAudioGenerated ? '✓ All Voiceovers Done' : '🎙 Generate Voiceovers')}
              </button>
              {/* Play button – needs all images */}
              {allImagesUploaded && (
                <button onClick={handlePlayAnimation}
                  className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-bold transition-colors animate-pulse">
                  ▶ Play Video
                </button>
              )}
            </div>
          </div>

          {/* Scene list */}
          <div className="divide-y divide-border">
            {script.scenes.map((scene, index) => {
              const audioStatus = sceneAudioStatus[scene.id] || (sceneAudio[scene.id] ? 'done' : 'idle');
              return (
                <div key={scene.id} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start hover:bg-black/10 transition-colors">

                  {/* Left: text & prompt */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-textMain text-lg border-b border-primary/30 pb-1 inline-block">Scene {index + 1}</h4>
                      <span className="text-xs bg-black/40 text-textSub px-2 py-1 rounded">~{scene.duration}s</span>
                    </div>

                    {/* Narration + audio status */}
                    <div className="bg-black/30 rounded-lg p-4 border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-textSub uppercase font-bold tracking-wider">Narration</p>
                        {/* Audio badge */}
                        {audioStatus === 'done'       && <span className="text-xs text-green-400 font-bold">✓ Audio Ready</span>}
                        {audioStatus === 'generating' && <span className="text-xs text-blue-400 font-bold flex items-center gap-1"><SpinnerIcon />Generating…</span>}
                        {audioStatus === 'error'      && (
                          <button onClick={() => handleRetrySceneAudio(scene)}
                            className="text-xs text-red-400 hover:text-red-300 font-bold underline">
                            ↻ Retry Audio
                          </button>
                        )}
                        {audioStatus === 'idle'       && (
                          <button onClick={() => handleRetrySceneAudio(scene)}
                            className="text-xs text-textSub hover:text-primary font-bold underline">
                            Generate
                          </button>
                        )}
                      </div>
                      <p className="text-textMain italic">"{scene.narration}"</p>
                    </div>

                    {/* Image prompt */}
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-primary uppercase font-bold tracking-wider">Image Prompt</p>
                        <button onClick={() => navigator.clipboard.writeText(scene.imagePrompt)}
                          className="text-xs text-primary hover:text-white underline">Copy</button>
                      </div>
                      <p className="text-textSub text-sm">{scene.imagePrompt}</p>
                    </div>
                  </div>

                  {/* Right: image upload */}
                  <div className="h-full flex flex-col justify-center">
                    <p className="text-xs text-textSub uppercase font-bold tracking-wider mb-2 text-center">Storyboard Image</p>
                    {sceneImages[scene.id] ? (
                      <div className="relative group rounded-xl overflow-hidden border-2 border-primary/50 aspect-[16/9]">
                        <img src={sceneImages[scene.id]} alt={`Scene ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <label className="cursor-pointer bg-black/50 hover:bg-black p-2 rounded-full text-white border border-border">
                            <input type="file" accept="image/*" className="hidden"
                              onChange={(e) => e.target.files && handleImageUpload(scene.id, e.target.files[0])} />
                            <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-border hover:border-textSub bg-black/10 hover:bg-black/20 rounded-xl aspect-[16/9] flex flex-col items-center justify-center cursor-pointer transition-colors group p-4 text-center">
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => e.target.files && handleImageUpload(scene.id, e.target.files[0])} />
                        <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-textSub group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-textSub group-hover:text-white">Upload Generated Image</span>
                        <span className="text-xs text-textSub mt-1">16:9 aspect ratio recommended</span>
                      </label>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIVideoGenerator;
