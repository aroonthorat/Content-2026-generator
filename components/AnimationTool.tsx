
import React, { useState, useEffect, useRef } from 'react';
import { generateImageFrame } from '../services/geminiService';
import SpinnerIcon from './icons/SpinnerIcon';
import PlayIcon from './icons/PlayIcon';
import DownloadIcon from './icons/DownloadIcon';

interface AnimationToolProps {
  onUsage: () => void;
}

const AnimationTool: React.FC<AnimationToolProps> = ({ onUsage }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('3D Render');
  const [frames, setFrames] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(4); 

  const styles = [
      '3D Render', 
      'Unreal Engine 5', 
      'Pixar Style', 
      'Cinematic', 
      'Cyberpunk', 
      'Realistic', 
      'Anime', 
      'Oil Painting', 
      'Claymation'
  ];
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIntervalRef = useRef<number | null>(null);
  const TOTAL_FRAMES = 8; // Increased for smoother/longer animation

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setFrames([]);
    setError(null);
    setCurrentFrameIndex(0);
    setGenerationProgress(0);
    setIsPlaying(false);
    
    const newFrames: string[] = [];

    try {
        // Frame 1: Base Generation
        const frame1Base64 = await generateImageFrame(prompt, style);
        newFrames.push(`data:image/jpeg;base64,${frame1Base64}`);
        setFrames([...newFrames]);
        setGenerationProgress(1);

        // Subsequent Frames: Image-to-Image for consistency
        let previousFrame = frame1Base64;
        for (let i = 1; i < TOTAL_FRAMES; i++) {
            // Slight variation in prompt for movement
            const movementPrompt = `Continue the action: ${prompt}. Frame ${i + 1} of ${TOTAL_FRAMES}. Slight movement.`;
            
            const nextFrameBase64 = await generateImageFrame(movementPrompt, style, previousFrame);
            newFrames.push(`data:image/jpeg;base64,${nextFrameBase64}`);
            setFrames([...newFrames]);
            setGenerationProgress(i + 1);
            previousFrame = nextFrameBase64;
        }
        
        onUsage();
        setIsPlaying(true); // Auto-play on finish
    } catch (err: any) {
        setError("Failed to generate frames. Please try again.");
        console.error(err);
    } finally {
        setIsGenerating(false);
    }
  };

  // Animation Loop
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
       animationIntervalRef.current = window.setInterval(() => {
           setCurrentFrameIndex(prev => (prev + 1) % frames.length);
       }, 1000 / fps);
    } else {
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current);
        }
    }
    return () => {
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };
  }, [isPlaying, frames, fps]);

  // Draw to Canvas
  useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas && frames.length > 0 && frames[currentFrameIndex]) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
              // Maintain aspect ratio
              const aspectRatio = img.width / img.height;
              canvas.height = canvas.width / aspectRatio;
              
              // Clear and Draw
              ctx?.clearRect(0, 0, canvas.width, canvas.height);
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = frames[currentFrameIndex];
      }
  }, [currentFrameIndex, frames]);

  const handleDownloadVideo = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const stream = (canvas as any).captureStream(30); // Capture at 30 FPS for smoothness
      
      // Prefer better codecs if available
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { 
          mimeType,
          videoBitsPerSecond: 5000000 // 5 Mbps for high quality
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          // Cast URL.createObjectURL result to string to prevent unknown to string assignment error
          const url = URL.createObjectURL(blob) as string;
          const a = document.createElement('a');
          a.href = url;
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          a.download = `ai-animation-hq.${ext}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
      };
      
      mediaRecorder.start();
      
      // Force play through all frames once to record
      setIsPlaying(false); // Stop UI loop
      let frame = 0;
      const recInterval = setInterval(() => {
          if (frame >= frames.length) {
              clearInterval(recInterval);
              mediaRecorder.stop();
              setIsPlaying(true); // Resume UI loop
          } else {
             setCurrentFrameIndex(frame);
             frame++;
          }
      }, 1000 / fps);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Controls Section */}
        <div className="bg-surface p-6 rounded-2xl backdrop-blur-sm border border-border animate-pop-in shadow-xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-textMain mb-1 flex items-center gap-2">
                        <span className="text-secondary">AI</span> Animation Studio
                    </h2>
                    <p className="text-textSub text-sm">Create high-fidelity sequential animations.</p>
                </div>
                <span className="px-2 py-1 bg-accent/20 border border-accent/50 rounded text-[10px] font-bold text-accent tracking-wide uppercase">
                    High Quality
                </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                    <label className="text-xs text-textSub font-bold mb-2 block uppercase tracking-wider">Animation Prompt</label>
                    <div className="relative">
                        <input 
                            type="text"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="e.g. A futuristic city with flying cars..."
                            className="w-full pl-4 pr-4 py-3 bg-black/20 border border-border rounded-xl text-textMain focus:ring-2 focus:ring-secondary outline-none transition-all"
                            disabled={isGenerating}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-textSub font-bold mb-2 block uppercase tracking-wider">Art Style</label>
                    <select 
                        value={style}
                        onChange={e => setStyle(e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-textMain focus:ring-2 focus:ring-secondary outline-none cursor-pointer transition-all"
                        disabled={isGenerating}
                    >
                        {styles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className={`w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-lg
                    ${isGenerating 
                        ? 'bg-surface border border-border text-textSub cursor-wait' 
                        : 'bg-gradient-to-r from-secondary to-primary text-white hover:scale-[1.01] active:scale-[0.99]'
                    }`}
            >
                {isGenerating ? (
                    <>
                        <SpinnerIcon /> 
                        <span>Generating Frame {generationProgress + 1} / {TOTAL_FRAMES}...</span>
                    </>
                ) : (
                    'Generate Video'
                )}
            </button>
            
            {/* Progress Bar */}
            {isGenerating && (
                <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden">
                    <div 
                        className="h-full bg-secondary transition-all duration-500 ease-out"
                        style={{ width: `${(generationProgress / TOTAL_FRAMES) * 100}%` }}
                    ></div>
                </div>
            )}
            
            {error && <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 text-red-200 rounded-lg text-center text-sm">{error}</div>}
        </div>

        {/* Player Section */}
        {frames.length > 0 && (
            <div className="bg-surface p-6 rounded-2xl backdrop-blur-sm border border-border animate-slide-fade-in flex flex-col items-center shadow-2xl">
                 
                 {/* Canvas / Screen */}
                 <div className="relative w-full max-w-[600px] aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 mb-6 group">
                     <canvas ref={canvasRef} className="w-full h-full object-contain" width={800} height={450} />
                     
                     {/* Overlay Controls */}
                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                         <span className="text-white text-xs font-mono">
                             {currentFrameIndex + 1} / {frames.length}
                         </span>
                         <div className="flex gap-2">
                             <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-secondary transition-colors">
                                 {isPlaying ? (
                                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                 ) : (
                                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                 )}
                             </button>
                         </div>
                     </div>
                 </div>

                 {/* Playback Controls */}
                 <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-[600px]">
                     
                     <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full transition-all shadow-lg ${isPlaying ? 'bg-secondary text-white' : 'bg-white text-secondary hover:scale-110'}`}
                     >
                         {isPlaying ? (
                             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                         ) : (
                             <PlayIcon />
                         )}
                     </button>

                     <div className="flex-1 w-full bg-black/20 px-6 py-3 rounded-2xl border border-border flex items-center gap-4">
                         <span className="text-xs text-textSub font-bold uppercase">Speed</span>
                         <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={fps} 
                            onChange={e => setFps(parseInt(e.target.value))} 
                            className="flex-1 accent-secondary cursor-pointer h-2 bg-black/30 rounded-lg appearance-none"
                         />
                         <span className="text-xs text-textMain font-mono w-12 text-right">{fps} FPS</span>
                     </div>
                     
                     <button 
                        onClick={handleDownloadVideo}
                        className="flex-shrink-0 p-4 text-textMain bg-primary/20 hover:bg-primary/40 rounded-full transition-all border border-primary/30"
                        title="Download HD Video"
                     >
                         <DownloadIcon />
                     </button>
                 </div>
                 
                 {/* Film Strip */}
                 <div className="mt-8 w-full overflow-x-auto pb-2 custom-scrollbar">
                     <div className="flex gap-3 px-2">
                        {frames.map((frame, i) => (
                            <div 
                                key={i}
                                onClick={() => { setIsPlaying(false); setCurrentFrameIndex(i); }}
                                className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${currentFrameIndex === i ? 'border-secondary ring-2 ring-secondary/50' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={frame} alt={`Frame ${i}`} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 right-0 bg-black/60 text-[10px] text-white px-1">{i + 1}</div>
                            </div>
                        ))}
                     </div>
                 </div>
            </div>
        )}
    </div>
  );
};

export default AnimationTool;
