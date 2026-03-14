
import React, { useState } from 'react';
import { editImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/file';
import FileUpload from './FileUpload';
import SpinnerIcon from './icons/SpinnerIcon';
import DownloadIcon from './icons/DownloadIcon';
import TrashIcon from './icons/TrashIcon';
import WandIcon from './icons/WandIcon';

interface ImageItem {
  id: string;
  original: string;
  processed: string | null;
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMsg?: string;
  name: string;
}

type TaskType = 'WATERMARK' | 'ENHANCE';
type QualityType = 'STANDARD' | 'HIGH';

interface BulkImageEditorProps {
  onUsage: () => void;
}

const BulkImageEditor: React.FC<BulkImageEditorProps> = ({ onUsage }) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [task, setTask] = useState<TaskType>('WATERMARK');
  const [quality, setQuality] = useState<QualityType>('STANDARD');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (files: FileList) => {
    const newImages: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await fileToBase64(file);
        newImages.push({
          id: Math.random().toString(36).substring(7),
          original: base64,
          processed: null,
          status: 'pending',
          name: file.name
        });
      } catch (e) {
        console.error("Failed to load image", file.name);
      }
    }
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const getPrompt = (t: TaskType, q: QualityType) => {
    if (t === 'WATERMARK') {
      if (q === 'STANDARD') {
        return "Task: Remove Watermarks. Action: Identify and erase all text overlays and logos. Refinement: Inpaint the background to fill gaps seamlessly. Constraint: Output a clean, natural-looking image without altering the main subject.";
      } else {
        return "Task: Enhance and Clean Image. Action: Remove all text overlays, watermarks, and unwanted artifacts. Refinement: Upscale resolution and improve detail. Constraint: Maintain the main subject's integrity and fill in removed areas naturally.";
      }
    } else { // ENHANCE
      if (q === 'STANDARD') {
        return "Task: Restore Old Photo. Action: Fix scratches, dust, and visual noise. Improve overall sharpness and lighting. Refinement: Clean up the image while maintaining a natural look. Constraint: Do not alter the subject's identity.";
      } else {
        return "Task: Professional Photo Restoration. Action: Repair scratches, tears, dust, and fold marks. Denoise and sharpen details. Correct fading and restore natural color balance. Refinement: Significantly upscale resolution and enhance facial clarity. Constraint: Strictly preserve the identity of people, facial features, and the original composition.";
      }
    }
  };

  const getModel = (q: QualityType) => {
    return q === 'HIGH' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  };

  const processImages = async () => {
    if (images.length === 0) return;
    
    // Check key for High Quality
    if (quality === 'HIGH') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }

    setIsProcessing(true);
    const prompt = getPrompt(task, quality);
    const model = getModel(quality);

    // Process sequentially to manage state updates clearly, though could be parallelized
    const newImages = [...images];
    
    for (let i = 0; i < newImages.length; i++) {
      if (newImages[i].status === 'done') continue; // Skip already done

      newImages[i] = { ...newImages[i], status: 'processing' };
      setImages([...newImages]);

      try {
        const resultBase64 = await editImage(newImages[i].original, prompt, model);
        newImages[i] = { ...newImages[i], processed: resultBase64, status: 'done' };
        onUsage();
      } catch (err: any) {
        let msg = err.message || "Processing failed";
        if (err.message && err.message.includes("not found") && quality === 'HIGH') {
           msg = "API Key Error. Please re-select key.";
        }
        newImages[i] = { ...newImages[i], status: 'error', errorMsg: msg };
      }
      setImages([...newImages]);
    }

    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-slide-fade-in pb-12">
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-xl">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-3 bg-primary/10 rounded-xl">
             <WandIcon className="w-8 h-8 text-primary" />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-textMain">Bulk Image Editor</h2>
             <p className="text-textSub text-sm">AI-powered restoration and cleaning.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div className="space-y-3">
              <label className="text-xs font-bold text-textSub uppercase tracking-wider">Select Task</label>
              <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setTask('WATERMARK')} className={`p-4 rounded-xl border transition-all text-sm font-bold ${task === 'WATERMARK' ? 'bg-primary text-white border-primary' : 'bg-black/20 text-textMain border-border hover:border-textSub'}`}>
                      Remove Watermark
                  </button>
                  <button onClick={() => setTask('ENHANCE')} className={`p-4 rounded-xl border transition-all text-sm font-bold ${task === 'ENHANCE' ? 'bg-secondary text-white border-secondary' : 'bg-black/20 text-textMain border-border hover:border-textSub'}`}>
                      Enhance Old Photo
                  </button>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-xs font-bold text-textSub uppercase tracking-wider">Quality Mode</label>
              <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setQuality('STANDARD')} className={`p-4 rounded-xl border transition-all text-sm font-bold flex flex-col items-center gap-1 ${quality === 'STANDARD' ? 'bg-accent/20 border-accent text-accent' : 'bg-black/20 text-textMain border-border hover:border-textSub'}`}>
                      <span>Standard</span>
                      <span className="text-[10px] opacity-70 font-normal">Fast • Gemini 2.5 Flash</span>
                  </button>
                  <button onClick={() => setQuality('HIGH')} className={`p-4 rounded-xl border transition-all text-sm font-bold flex flex-col items-center gap-1 ${quality === 'HIGH' ? 'bg-gradient-to-br from-purple-600 to-blue-600 border-white/20 text-white shadow-lg' : 'bg-black/20 text-textMain border-border hover:border-textSub'}`}>
                      <span>High Quality</span>
                      <span className="text-[10px] opacity-70 font-normal">Pro • Gemini 3 Pro</span>
                  </button>
              </div>
           </div>
        </div>

        <FileUpload onFileSelect={handleFileUpload} disabled={isProcessing} label="Upload Images for Batch Processing" />
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
           <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-textMain">Queue ({images.length})</h3>
              <button 
                onClick={processImages} 
                disabled={isProcessing}
                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isProcessing ? 'bg-surface text-textSub cursor-wait' : 'bg-textMain text-background hover:scale-105'}`}
              >
                 {isProcessing ? <><SpinnerIcon /> Processing...</> : 'Start Processing'}
              </button>
           </div>

           <div className="grid grid-cols-1 gap-6">
              {images.map((img) => (
                  <div key={img.id} className="bg-surface p-4 rounded-2xl border border-border shadow-lg">
                      <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-textSub truncate max-w-[200px]">{img.name}</span>
                          <div className="flex items-center gap-2">
                             {img.status === 'processing' && <span className="text-xs text-primary animate-pulse">Processing...</span>}
                             {img.status === 'error' && <span className="text-xs text-red-400">{img.errorMsg}</span>}
                             {img.status === 'done' && <span className="text-xs text-green-400 font-bold">Done</span>}
                             <button onClick={() => removeImage(img.id)} disabled={isProcessing} className="p-1 hover:text-red-400 disabled:opacity-50"><TrashIcon className="w-4 h-4" /></button>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 h-64">
                          <div className="relative rounded-xl overflow-hidden bg-black/40 border border-border">
                              <img src={`data:image/jpeg;base64,${img.original}`} className="w-full h-full object-contain" />
                              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-bold">ORIGINAL</div>
                          </div>
                          <div className="relative rounded-xl overflow-hidden bg-black/40 border border-border flex items-center justify-center">
                              {img.processed ? (
                                  <>
                                    <img src={`data:image/jpeg;base64,${img.processed}`} className="w-full h-full object-contain" />
                                    <div className="absolute top-2 left-2 bg-secondary text-white text-[10px] px-2 py-1 rounded font-bold">PROCESSED</div>
                                    <a 
                                        href={`data:image/jpeg;base64,${img.processed}`} 
                                        download={`processed-${img.name}`} 
                                        className="absolute bottom-2 right-2 p-2 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform"
                                    >
                                        <DownloadIcon />
                                    </a>
                                  </>
                              ) : (
                                  <div className="text-textMuted text-xs text-center p-4">
                                      {img.status === 'processing' ? <SpinnerIcon /> : (img.status === 'error' ? 'Failed' : 'Waiting...')}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default BulkImageEditor;
