import React, { useState, useEffect, useRef } from 'react';
import { generateVideoScript, VideoScript, textToSpeech, VideoScene } from '../services/geminiService';
import { fileToBase64 } from '../utils/file';
import { playAudio, initAudio } from '../utils/audio';
import SpinnerIcon from './icons/SpinnerIcon';

interface AIVideoGeneratorProps {
  onUsage?: () => void;
}

const AIVideoGenerator: React.FC<AIVideoGeneratorProps> = ({ onUsage }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoType, setVideoType] = useState<'SHORT' | 'LONG'>('SHORT');
  
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [error, setError] = useState('');
  
  const [sceneImages, setSceneImages] = useState<Record<string, string>>({});
  const [sceneAudio, setSceneAudio] = useState<Record<string, string>>({});
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(-1);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleGenerateScript = async () => {
    if (!title || !description) {
      setError('Please provide both title and description');
      return;
    }
    setError('');
    setIsGeneratingScript(true);
    setScript(null);
    setSceneImages({});
    setSceneAudio({});
    
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

  const handleGenerateAllAudio = async () => {
    if (!script) return;
    setIsGeneratingAudio(true);
    try {
      const newAudio: Record<string, string> = {};
      for (const scene of script.scenes) {
        if (!sceneAudio[scene.id]) {
          const audioBase64 = await textToSpeech(scene.narration, 'English', 'Professional', 'Charon');
          newAudio[scene.id] = audioBase64;
        }
      }
      setSceneAudio(prev => ({ ...prev, ...newAudio }));
    } catch (err: any) {
      setError('Failed to generate audio for some scenes.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleImageUpload = async (sceneId: string, file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setSceneImages(prev => ({ ...prev, [sceneId]: base64 }));
    } catch (e) {
      setError('Failed to upload image');
    }
  };

  const allImagesUploaded = script && script.scenes.every(s => sceneImages[s.id]);
  const allAudioGenerated = script && script.scenes.every(s => sceneAudio[s.id]);

  const handlePlayAnimation = async () => {
    if (!script || !allImagesUploaded) return;
    initAudio();
    setIsPlaying(true);
    setCurrentSceneIndex(0);
    
    // We'll run the animation loop here
    let idx = 0;
    for (const scene of script.scenes) {
      if (!isPlaying) break; // In case user stops
      setCurrentSceneIndex(idx);
      
      const p = new Promise<void>((resolve) => {
        if (sceneAudio[scene.id]) {
          const playAudioPromise = playAudio(sceneAudio[scene.id]) as Promise<any> | any;
          if (playAudioPromise && typeof playAudioPromise.then === 'function') {
             playAudioPromise
               .then((playback: any) => {
                  if (playback && playback.onEnded) {
                      playback.onEnded.catch(() => {}).finally(() => resolve());
                  } else {
                      resolve();
                  }
               })
               .catch(() => resolve());
          } else if (playAudioPromise && playAudioPromise.onEnded) {
             playAudioPromise.onEnded.catch(() => {}).finally(() => resolve());
          } else {
             resolve();
          }
        } else {
          // Fallback to purely duration
          setTimeout(resolve, scene.duration * 1000);
        }
      });
      await p;
      idx++;
    }
    setCurrentSceneIndex(-1);
    setIsPlaying(false);
  };

  const handleStopAnimation = () => {
    setIsPlaying(false);
    setCurrentSceneIndex(-1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isPlaying && script && currentSceneIndex >= 0) {
    const currentScene = script.scenes[currentSceneIndex];
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
         <div ref={previewRef} className="relative w-full max-w-4xl aspect-[16/9] bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center animate-zoom-slow">
            {sceneImages[currentScene.id] && (
               <img src={sceneImages[currentScene.id]} alt="Scene" className="w-full h-full object-cover opacity-90 transition-opacity duration-1000" />
            )}
            <div className="absolute bottom-10 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/70 to-transparent text-center">
                <p className="text-2xl text-white font-bold tracking-wide drop-shadow-md">{currentScene.narration}</p>
            </div>
         </div>
         <button onClick={handleStopAnimation} className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold uppercase tracking-wider transition-transform hover:scale-105">
            Stop Playback
         </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-pop-in pb-12">
      <div className="p-8 bg-surface rounded-2xl border border-border shadow-lg">
        <h2 className="text-2xl font-black text-textMain mb-6 flex items-center gap-3">
          🎬 AI Animated Video Generator
        </h2>
        
        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500 text-red-500 rounded-xl">{error}</div>}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-textSub mb-2">Video Title</label>
              <input
                type="text"
                placeholder="e.g. History of the Roman Empire"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/30 border border-border rounded-xl p-3 text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-textSub mb-2">Video Format</label>
              <select
                value={videoType}
                onChange={(e) => setVideoType(e.target.value as 'SHORT' | 'LONG')}
                className="w-full bg-black/30 border border-border rounded-xl p-3 text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="SHORT">Short-form (Shorts/Reels)</option>
                <option value="LONG">Long-form (YouTube)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-textSub mb-2">Video Description</label>
            <textarea
              rows={4}
              placeholder="Describe the storyboard, theme, message..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/30 border border-border rounded-xl p-3 text-textMain focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            />
          </div>

          <button
            onClick={handleGenerateScript}
            disabled={isGeneratingScript || !title || !description}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGeneratingScript ? <SpinnerIcon /> : 'Generate Script & Storyboard'}
          </button>
        </div>
      </div>

      {script && (
        <div className="bg-surface rounded-2xl border border-border shadow-lg overflow-hidden">
          <div className="p-6 bg-black/20 border-b border-border flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-textMain">{script.title}</h3>
              <p className="text-textSub text-sm mt-1">{script.scenes.length} Scenes • {script.totalDuration} seconds estimated</p>
            </div>
            <div className="flex gap-4">
              {!allAudioGenerated && (
                <button 
                  onClick={handleGenerateAllAudio} 
                  disabled={isGeneratingAudio}
                  className="px-4 py-2 bg-secondary/80 hover:bg-secondary text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                >
                  {isGeneratingAudio ? <SpinnerIcon /> : 'Generate Voiceovers'}
                </button>
              )}
              {allImagesUploaded && (
                <button 
                  onClick={handlePlayAnimation} 
                  className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-bold transition-colors animate-pulse"
                >
                  ▶ Play Video
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-border">
            {script.scenes.map((scene, index) => (
              <div key={scene.id} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start hover:bg-black/10 transition-colors">
                
                {/* Text and Prompt Side */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <h4 className="font-bold text-textMain text-lg border-b border-primary/30 pb-1 inline-block">Scene {index + 1}</h4>
                     <span className="text-xs bg-black/40 text-textSub px-2 py-1 rounded">~{scene.duration}s</span>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 border border-border">
                    <p className="text-xs text-textSub uppercase font-bold tracking-wider mb-2">Narration</p>
                    <p className="text-textMain italic">"{scene.narration}"</p>
                    {sceneAudio[scene.id] && <span className="text-xs text-primary mt-2 inline-block">✓ Audio Ready</span>}
                  </div>

                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-xs text-primary uppercase font-bold tracking-wider">Image Prompt</p>
                       <button onClick={() => copyToClipboard(scene.imagePrompt)} className="text-xs text-primary hover:text-white underline">Copy</button>
                    </div>
                    <p className="text-textSub text-sm">{scene.imagePrompt}</p>
                  </div>
                </div>

                {/* Image Upload Side */}
                <div className="h-full flex flex-col justify-center">
                  <p className="text-xs text-textSub uppercase font-bold tracking-wider mb-2 text-center">Storyboard Image</p>
                  {sceneImages[scene.id] ? (
                    <div className="relative group rounded-xl overflow-hidden border-2 border-primary/50 aspect-[16/9]">
                      <img src={sceneImages[scene.id]} alt={`Scene ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <label className="cursor-pointer bg-black/50 hover:bg-black p-2 rounded-full text-white border border-border">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleImageUpload(scene.id, e.target.files[0])} />
                          <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-border hover:border-textSub bg-black/10 hover:bg-black/20 rounded-xl aspect-[16/9] flex flex-col items-center justify-center cursor-pointer transition-colors group p-4 text-center">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleImageUpload(scene.id, e.target.files[0])} />
                      <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-textSub group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </div>
                      <span className="text-sm font-bold text-textSub group-hover:text-white">Upload Generated Image</span>
                      <span className="text-xs text-textSub mt-1">16:9 aspect ratio recommended</span>
                    </label>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIVideoGenerator;
