
import React, { useState } from 'react';
import { generateVideoScript, generateVeoVideo, VideoScene } from '../services/videoService';
import SpinnerIcon from './icons/SpinnerIcon';
import VideoIcon from './icons/VideoIcon';
import PlayIcon from './icons/PlayIcon';
import DownloadIcon from './icons/DownloadIcon';

interface ProVideoMakerProps {
  onUsage: () => void;
}

const ProVideoMaker: React.FC<ProVideoMakerProps> = ({ onUsage }) => {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState<VideoScene[] | null>(null);
  const [isScripting, setIsScripting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateScript = async () => {
    if (!topic.trim()) return;
    setIsScripting(true);
    setError(null);
    try {
      const result = await generateVideoScript(topic);
      setScript(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScripting(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!script) return;
    
    // Check for API key per Veo requirements
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // Proceed assuming success as per race condition mitigation rule
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);

    // Combine script visual prompts for a comprehensive generation
    const combinedPrompt = script.map(s => s.visual_prompt).join(" Then, ");

    try {
      const url = await generateVeoVideo(combinedPrompt, setStatusMsg);
      setVideoUrl(url);
      onUsage();
    } catch (err: any) {
      if (err.message === "API_KEY_EXPIRED") {
          setError("Your session expired or the project was not found. Please select your API key again.");
          await (window as any).aistudio.openSelectKey();
      } else {
          setError(err.message || "An error occurred during production.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="bg-surface p-6 rounded-2xl backdrop-blur-sm border border-border shadow-xl">
        <h2 className="text-2xl font-bold text-textMain mb-4 flex items-center gap-2">
          <span className="text-primary">PRO</span> Video Director
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., 'A journey through a black hole')"
            className="flex-1 px-4 py-3 bg-black/30 border border-border rounded-xl text-textMain focus:ring-2 focus:ring-primary outline-none transition-all"
            disabled={isScripting || isGenerating}
          />
          <button
            onClick={handleCreateScript}
            disabled={isScripting || isGenerating || !topic.trim()}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-all"
          >
            {isScripting ? <SpinnerIcon /> : 'Draft Script'}
          </button>
        </div>
        {error && <p className="mt-4 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/30">{error}</p>}
      </div>

      {/* Script Review */}
      {script && !isGenerating && !videoUrl && (
        <div className="bg-surface p-8 rounded-2xl border border-border animate-pop-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-accent uppercase tracking-widest">Storyboards</h3>
            <button
              onClick={handleGenerateVideo}
              className="px-8 py-3 bg-secondary text-white font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-secondary/20"
            >
              Start Production (Veo 3.1)
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {script.map((scene, i) => (
              <div key={i} className="p-4 bg-black/20 border border-border rounded-xl flex flex-col gap-2">
                <div className="text-xs font-bold text-textSub uppercase">Scene {i + 1}</div>
                <p className="text-sm text-textMain italic">"{scene.visual_prompt}"</p>
                <div className="mt-2 text-[10px] text-textMuted uppercase font-bold">Audio: {scene.audio_prompt}</div>
                <div className="text-[10px] text-primary/70">{scene.transition_note}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Production Loading State */}
      {isGenerating && (
        <div className="bg-surface p-12 rounded-2xl border border-border flex flex-col items-center justify-center text-center animate-pulse">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-secondary blur-3xl opacity-20 animate-pulse"></div>
            <VideoIcon className="w-24 h-24 text-secondary relative z-10" />
          </div>
          <h3 className="text-2xl font-bold text-textMain mb-2">Generating Cinematic Video</h3>
          <p className="text-textSub mb-6">{statusMsg}</p>
          <div className="w-full max-w-md bg-black/30 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-secondary animate-[loading_20s_ease-in-out_infinite]"></div>
          </div>
          <p className="mt-6 text-xs text-textMuted max-w-xs">
            High-quality AI rendering takes time. Veo 3.1 is currently processing your request at 1080p.
          </p>
        </div>
      )}

      {/* Final Theater Mode */}
      {videoUrl && (
        <div className="bg-black p-4 rounded-3xl border border-border shadow-2xl animate-slide-fade-in overflow-hidden">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 group">
            <video 
              src={videoUrl} 
              className="w-full h-full object-contain" 
              controls 
              autoPlay 
              loop
            />
          </div>
          <div className="mt-4 flex justify-between items-center px-2">
            <div>
              <h3 className="text-lg font-bold text-white">The Final Cut</h3>
              <p className="text-xs text-zinc-400">Produced by Pro Video Director x Veo 3.1</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setVideoUrl(null)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
              >
                Discard
              </button>
              <a 
                href={videoUrl} 
                download="veo-production.mp4"
                className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors"
              >
                <DownloadIcon />
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 95%; }
        }
      `}</style>
    </div>
  );
};

export default ProVideoMaker;
