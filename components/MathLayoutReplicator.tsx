
import React, { useState, useRef } from 'react';
import { replicateMathDocument } from '../services/geminiService';
import { fileToBase64 } from '../utils/file';
import { ReplicaData, ReplicaElement } from '../types';
import FileUpload from './FileUpload';
import SpinnerIcon from './icons/SpinnerIcon';
import DownloadIcon from './icons/DownloadIcon';
import MathIcon from './icons/MathIcon';

interface MathLayoutReplicatorProps {
  onUsage: () => void;
}

const MathLayoutReplicator: React.FC<MathLayoutReplicatorProps> = ({ onUsage }) => {
  const [step, setStep] = useState<'UPLOAD' | 'PROCESSING' | 'EDITOR'>('UPLOAD');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [replicaData, setReplicaData] = useState<ReplicaData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'ORIGINAL' | 'EDITABLE'>('EDITABLE');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return;
    setStep('PROCESSING');
    setError(null);
    try {
      const base64 = await fileToBase64(files[0]);
      setImageBase64(base64);
      
      const data = await replicateMathDocument(base64);
      setReplicaData(data);
      setStep('EDITOR');
      onUsage();
    } catch (err: any) {
      setError(err.message || "Failed to process document.");
      setStep('UPLOAD');
    }
  };

  const handleUpdateElement = (id: string, key: keyof ReplicaElement, value: any) => {
    if (!replicaData) return;
    const newElements = replicaData.elements.map(el => 
      el.id === id ? { ...el, [key]: value } : el
    );
    setReplicaData({ ...replicaData, elements: newElements });
  };

  const selectedElement = replicaData?.elements.find(el => el.id === selectedId);

  const handleExport = () => {
    if (!replicaData) return;
    const blob = new Blob([JSON.stringify(replicaData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `math-replica-layout.json`;
    a.click();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-slide-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
      {/* Header / Toolbar */}
      <div className="flex justify-between items-center bg-surface p-4 rounded-2xl border border-border shadow-md">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
             <MathIcon className="w-6 h-6" />
           </div>
           <div>
             <h2 className="text-lg font-bold text-textMain">Docu-Replica</h2>
             <p className="text-xs text-textSub">Math & LaTeX Layout Engine</p>
           </div>
        </div>

        {step === 'EDITOR' && (
            <div className="flex items-center gap-4">
                <div className="bg-black/30 p-1 rounded-lg border border-border flex">
                    <button 
                        onClick={() => setViewMode('ORIGINAL')}
                        className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${viewMode === 'ORIGINAL' ? 'bg-textMain text-background' : 'text-textSub hover:text-textMain'}`}
                    >
                        Original
                    </button>
                    <button 
                        onClick={() => setViewMode('EDITABLE')}
                        className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${viewMode === 'EDITABLE' ? 'bg-primary text-white' : 'text-textSub hover:text-textMain'}`}
                    >
                        Replica
                    </button>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary/80 transition-colors"
                >
                    <DownloadIcon /> Export JSON
                </button>
                <button 
                    onClick={() => { setStep('UPLOAD'); setReplicaData(null); setImageBase64(null); }}
                    className="text-xs text-textSub hover:text-red-400 underline ml-2"
                >
                    Reset
                </button>
            </div>
        )}
      </div>

      {step === 'UPLOAD' && (
        <div className="flex-1 flex flex-col justify-center items-center p-12 bg-surface rounded-3xl border border-border shadow-2xl animate-pop-in">
           <h3 className="text-2xl font-bold text-textMain mb-2">Math Page Reconstruction</h3>
           <p className="text-textSub mb-8 text-center max-w-md">Digitize complex math sheets into editable LaTeX layers while maintaining exact visual geometry.</p>
           <div className="w-full max-w-md">
             <FileUpload onFileSelect={handleFileSelect} disabled={false} label="Upload Image or PDF Page" />
           </div>
           {error && <p className="mt-6 text-red-400 bg-red-900/10 px-4 py-2 rounded-lg border border-red-500/20">{error}</p>}
        </div>
      )}

      {step === 'PROCESSING' && (
        <div className="flex-1 flex flex-col justify-center items-center bg-surface rounded-3xl border border-border shadow-2xl">
            <div className="w-20 h-20 text-primary mb-6 relative">
                 <SpinnerIcon /> 
            </div>
            <h3 className="text-xl font-bold text-textMain mb-2 animate-pulse">Deconstructing Layout...</h3>
            <p className="text-textSub">Gemini is identifying formulas and text blocks.</p>
        </div>
      )}

      {step === 'EDITOR' && replicaData && (
          <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
              {/* Canvas Area */}
              <div className="flex-1 bg-black/40 rounded-2xl border border-border overflow-auto flex items-center justify-center p-8 relative custom-scrollbar">
                  <div 
                    className="relative bg-white shadow-2xl transition-all duration-300"
                    style={{ 
                        width: '100%', 
                        maxWidth: '800px',
                        aspectRatio: `${replicaData.aspectRatio}`,
                    }}
                  >
                      {viewMode === 'ORIGINAL' && imageBase64 && (
                          <img src={`data:image/jpeg;base64,${imageBase64}`} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                      )}

                      {viewMode === 'EDITABLE' && replicaData.elements.map((el) => (
                          <div
                            key={el.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                            className={`absolute flex items-start overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 group
                                ${selectedId === el.id ? 'ring-2 ring-primary z-50 bg-blue-50/20' : ''}
                                ${el.type === 'math' ? 'border border-dashed border-secondary/30' : ''}
                                ${el.type === 'shape' ? 'border border-gray-300 bg-gray-50/50' : ''}
                            `}
                            style={{
                                left: `${el.x}%`,
                                top: `${el.y}%`,
                                width: `${el.width}%`,
                                height: `${el.height}%`,
                                fontSize: `${el.fontSize || 16}px`,
                            }}
                          >
                              {el.type === 'math' ? (
                                  <div className="w-full h-full font-mono text-secondary font-bold p-1 overflow-hidden break-words leading-tight bg-secondary/5">
                                      {el.content}
                                  </div>
                              ) : el.type === 'shape' ? (
                                  <div className="w-full h-full" style={{ backgroundColor: el.bgColor }}></div>
                              ) : (
                                  <div className="w-full h-full text-black p-0.5 leading-snug whitespace-pre-wrap font-serif" style={{ color: el.color || 'black' }}>
                                      {el.content}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Sidebar Properties */}
              <div className="w-80 bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-xl overflow-y-auto custom-scrollbar">
                  <h3 className="text-sm font-bold text-textSub uppercase tracking-wider border-b border-border pb-2">Editor</h3>
                  
                  {selectedElement ? (
                      <div className="space-y-6 animate-slide-fade-in">
                          <div>
                              <label className="text-xs font-bold text-textMuted uppercase mb-1 block">Element Type</label>
                              <div className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase ${selectedElement.type === 'math' ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>
                                  {selectedElement.type}
                              </div>
                          </div>

                          <div>
                              <label className="text-xs font-bold text-textMuted uppercase mb-1 block">
                                  {selectedElement.type === 'math' ? 'LaTeX Formula' : 'Text Content'}
                              </label>
                              <textarea 
                                value={selectedElement.content}
                                onChange={(e) => handleUpdateElement(selectedElement.id, 'content', e.target.value)}
                                className={`w-full h-40 bg-black/20 border rounded-xl p-3 text-sm focus:ring-1 outline-none resize-none transition-all ${selectedElement.type === 'math' ? 'font-mono border-secondary/40 focus:ring-secondary' : 'border-border focus:ring-primary'}`}
                              />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-[10px] font-bold text-textMuted uppercase mb-1 block">Font Size (px)</label>
                                  <input 
                                    type="number" 
                                    value={selectedElement.fontSize || 16}
                                    onChange={(e) => handleUpdateElement(selectedElement.id, 'fontSize', parseInt(e.target.value))}
                                    className="w-full bg-black/20 border border-border rounded-lg px-2 py-1 text-sm text-textMain"
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold text-textMuted uppercase mb-1 block">X-Pos (%)</label>
                                  <input 
                                    type="number" 
                                    value={selectedElement.x}
                                    onChange={(e) => handleUpdateElement(selectedElement.id, 'x', parseFloat(e.target.value))}
                                    className="w-full bg-black/20 border border-border rounded-lg px-2 py-1 text-sm text-textMain"
                                  />
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-textMuted opacity-50 text-center">
                          <MathIcon className="w-12 h-12 mb-2" />
                          <p className="text-xs">Click any element on the digital canvas to edit its properties or LaTeX code.</p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default MathLayoutReplicator;
