
import React from 'react';
import ReaderIcon from './icons/ReaderIcon';
import MCQIcon from './icons/MCQIcon';
import AdminIcon from './icons/AdminIcon';
import PaletteIcon from './icons/PaletteIcon';
import VideoIcon from './icons/VideoIcon';
import ImageGenIcon from './icons/ImageGenIcon';
import WandIcon from './icons/WandIcon';
import LockIcon from './icons/LockIcon';
import MathIcon from './icons/MathIcon';
import ClapboardIcon from './icons/ClapboardIcon';
import { User } from '../types';

interface HomeScreenProps {
  onSelectMCQReader: () => void;
  onSelectReader: () => void;
  onSelectVideoMaker: () => void;
  onSelectProVideoMaker: () => void;
  onSelectPosterMaker: () => void;
  onSelectBulkEditor: () => void;
  onSelectMathReplicator: () => void;
  onSelectAIVideoGenerator: () => void;
  onSelectAdmin: () => void;
  onOpenSettings: () => void;
  user: User;
  mcqReaderTitle: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onSelectMCQReader, 
  onSelectReader, 
  onSelectVideoMaker, 
  onSelectProVideoMaker,
  onSelectPosterMaker,
  onSelectBulkEditor,
  onSelectMathReplicator,
  onSelectAIVideoGenerator,
  onSelectAdmin, 
  onOpenSettings, 
  user, 
  mcqReaderTitle 
}) => {
  // STRICT: Only this email can access admin features.
  const isAdmin = user.email.toLowerCase() === 'aroonthorat@dev.com';
  
  const permissions = user.permissions || { mcq: true, reader: true, video: true, proVideo: false, poster: true, bulkEditor: true, mathReplicator: true, aiVideoGenerator: true };
  const { mcq, reader, video, proVideo, poster, bulkEditor, mathReplicator, aiVideoGenerator } = permissions;

  const renderToolCard = (
    title: string,
    description: string,
    icon: React.ReactNode,
    onClick: () => void,
    hasPermission: boolean,
    themeClasses: {
        border: string;
        shadow: string;
        iconText: string;
    }
  ) => (
    <div
      onClick={hasPermission ? onClick : undefined}
      className={`group relative p-6 bg-surface rounded-2xl backdrop-blur-sm border transition-all duration-300 
        ${hasPermission 
            ? `border-border cursor-pointer ${themeClasses.border} hover:scale-105 hover:shadow-2xl ${themeClasses.shadow}` 
            : 'border-border/40 opacity-70 cursor-not-allowed grayscale-[0.6] hover:border-border/60'
        }`}
    >
      {!hasPermission && (
          <div className="absolute top-4 right-4 text-textSub z-20 bg-surface/80 rounded-full p-1 border border-border">
              <LockIcon className="w-5 h-5" />
          </div>
      )}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className={`w-20 h-20 transition-colors ${hasPermission ? themeClasses.iconText : 'text-textSub'}`}>
           {icon}
        </div>
        <h3 className="mt-4 text-2xl font-bold text-textMain">{title}</h3>
        <p className="mt-2 text-sm text-textSub">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-12 pb-12">
        <div className={`grid grid-cols-1 gap-6 animate-pop-in ${isAdmin ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        
        {/* Option 1: MCQ Reader */}
        {renderToolCard(
            mcqReaderTitle,
            "Extract questions from images.",
            <MCQIcon className="w-full h-full" />,
            onSelectMCQReader,
            mcq,
            { border: 'hover:border-primary', shadow: 'hover:shadow-primary/20', iconText: 'text-primary group-hover:text-accent' }
        )}

        {/* Option 2: Reader */}
        {renderToolCard(
            "Reader",
            "Type text to generate high-quality audio.",
            <ReaderIcon className="w-full h-full" />,
            onSelectReader,
            reader,
            { border: 'hover:border-primary', shadow: 'hover:shadow-primary/20', iconText: 'text-primary group-hover:text-accent' }
        )}

        {/* Option 3: Campaign Studio */}
        {renderToolCard(
            "Campaign Studio",
            "Generate AI blueprints for political posters.",
            <ImageGenIcon className="w-full h-full" />,
            onSelectPosterMaker,
            poster,
            { border: 'hover:border-secondary', shadow: 'hover:shadow-secondary/20', iconText: 'text-secondary group-hover:text-accent' }
        )}

        {/* Option 4: Bulk Editor */}
        {renderToolCard(
            "Photo Editor",
            "Remove watermarks & enhance old photos.",
            <WandIcon className="w-full h-full" />,
            onSelectBulkEditor,
            bulkEditor,
            { border: 'hover:border-accent', shadow: 'hover:shadow-accent/20', iconText: 'text-accent group-hover:text-white' }
        )}

        {/* Option 5: Docu-Replica (Math) */}
        {renderToolCard(
            "Docu-Replica",
            "Digitize math docs into editable LaTeX layers.",
            <MathIcon className="w-full h-full" />,
            onSelectMathReplicator,
            mathReplicator,
            { border: 'hover:border-blue-500', shadow: 'hover:shadow-blue-500/20', iconText: 'text-blue-500 group-hover:text-white' }
        )}

        {/* Option 5.5: AI Video Generator */}
        {renderToolCard(
            "AI Storyteller",
            "Generate scripts & animated scenes.",
            <ClapboardIcon className="w-full h-full" />,
            onSelectAIVideoGenerator,
            aiVideoGenerator ?? true,
            { border: 'hover:border-primary', shadow: 'hover:shadow-primary/20', iconText: 'text-primary group-hover:text-white' }
        )}

        {/* Option 6: Animation Sketch */}
        {renderToolCard(
            "Animation Sketch",
            "Create sequential AI frame sketches.",
            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-current rounded-xl"><span className="font-bold text-xl">Frames</span></div>,
            onSelectVideoMaker,
            video,
            { border: 'hover:border-accent', shadow: 'hover:shadow-accent/20', iconText: 'text-accent group-hover:text-white' }
        )}

        {/* Option 7: PRO VIDEO DIRECTOR (Custom Card) */}
        <div
            onClick={proVideo ? onSelectProVideoMaker : undefined}
            className={`group relative p-6 bg-gradient-to-br from-black/80 to-purple-900/50 rounded-2xl backdrop-blur-sm border transition-all duration-300 col-span-1 md:col-span-2 lg:col-span-1
                ${proVideo 
                    ? 'border-secondary cursor-pointer hover:border-white hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20' 
                    : 'border-secondary/30 opacity-70 cursor-not-allowed grayscale-[0.8]'}
            `}
        >
            <div className={`absolute top-3 right-3 text-[10px] font-black uppercase px-2 py-1 rounded-full ${proVideo ? 'bg-secondary text-white animate-pulse' : 'bg-gray-700 text-gray-400'}`}>
                Pro Tool
            </div>
            {!proVideo && (
                <div className="absolute top-3 left-3 text-white/50 bg-black/50 rounded-full p-1">
                    <LockIcon className="w-4 h-4" />
                </div>
            )}
            <div className="relative z-10 flex flex-col items-center text-center">
            <VideoIcon className={`w-20 h-20 transition-transform ${proVideo ? 'text-white group-hover:scale-110' : 'text-gray-400'}`} />
            <h3 className={`mt-4 text-2xl font-black ${proVideo ? 'text-white' : 'text-gray-300'}`}>Video Director</h3>
            <p className="mt-2 text-sm text-gray-400">Generate cinematic AI videos with Veo 3.1.</p>
            </div>
        </div>

        {/* Option 8: Appearance */}
        <div
            onClick={onOpenSettings}
            className="group relative p-6 bg-surface rounded-2xl backdrop-blur-sm border border-border cursor-pointer transition-all duration-300 hover:border-textSub hover:scale-105 hover:shadow-2xl hover:shadow-textSub/20"
        >
            <div className="relative z-10 flex flex-col items-center text-center">
            <PaletteIcon className="w-20 h-20 text-textSub group-hover:text-white transition-colors" />
            <h3 className="mt-4 text-2xl font-bold text-textMain">Appearance</h3>
            <p className="mt-2 text-sm text-textSub">Customize visuals.</p>
            </div>
        </div>

        {/* Admin Panel - Only visible to super admin */}
        {isAdmin && (
            <div
                onClick={onSelectAdmin}
                className="group relative p-6 bg-surface rounded-2xl backdrop-blur-sm border border-secondary cursor-pointer transition-all duration-300 hover:border-accent hover:scale-105 hover:shadow-2xl hover:shadow-accent/20"
            >
                <div className="relative z-10 flex flex-col items-center text-center">
                <AdminIcon className="w-20 h-20 text-secondary group-hover:text-accent transition-colors" />
                <h3 className="mt-4 text-2xl font-bold text-textMain">Admin Panel</h3>
                <p className="mt-2 text-sm text-textSub">System status and user controls.</p>
                </div>
            </div>
        )}
        </div>

        {/* INFO SECTION */}
        <div className="w-full bg-surface/50 rounded-3xl p-8 border border-border">
            <h2 className="text-2xl font-bold text-textMain mb-6 border-b border-border/50 pb-4">Tool Capabilities Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div>
                    <h4 className="text-primary font-bold mb-1 flex items-center gap-2"><MCQIcon className="w-4 h-4" /> {mcqReaderTitle}</h4>
                    <p className="text-sm text-textSub leading-relaxed">Instantly scans images of exam papers or quizzes. It extracts the text, identifies options, reads them aloud using TTS, and manages a countdown timer for self-testing.</p>
                </div>
                <div>
                    <h4 className="text-primary font-bold mb-1 flex items-center gap-2"><ReaderIcon className="w-4 h-4" /> Neural Reader</h4>
                    <p className="text-sm text-textSub leading-relaxed">A professional Text-to-Speech studio. Features AI voice cloning, preset personas (Alpha, Bravo, Delta), and atmospheric background mixing (Lofi, Nature, Space).</p>
                </div>
                <div>
                    <h4 className="text-blue-500 font-bold mb-1 flex items-center gap-2"><MathIcon className="w-4 h-4" /> Docu-Replica</h4>
                    <p className="text-sm text-textSub leading-relaxed">Advanced document analysis using Gemini Vision. Detects mathematical formulas and converts them into editable LaTeX code while preserving the original page layout.</p>
                </div>
                <div>
                    <h4 className="text-secondary font-bold mb-1 flex items-center gap-2"><ImageGenIcon className="w-4 h-4" /> Campaign Studio</h4>
                    <p className="text-sm text-textSub leading-relaxed">Architecture for political and event posters. Automates hierarchy placement for candidates, secondary leaders, and party branding/logos based on themes.</p>
                </div>
                <div>
                    <h4 className="text-accent font-bold mb-1 flex items-center gap-2"><WandIcon className="w-4 h-4" /> Photo Lab</h4>
                    <p className="text-sm text-textSub leading-relaxed">Bulk image processing tool. enhancing old photographs, removing watermarks, and upscaling resolution using Gemini 2.5 and 3 Pro Vision models.</p>
                </div>
                <div>
                    <h4 className="text-accent font-bold mb-1 flex items-center gap-2"><span>🎞️</span> Animation Sketch</h4>
                    <p className="text-sm text-textSub leading-relaxed">Frame-by-frame animation generator. Turns text prompts into sequential storyboard sketches, allowing for rapid visualization of concepts.</p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-1 flex items-center gap-2"><VideoIcon className="w-4 h-4" /> Video Director (Pro)</h4>
                    <p className="text-sm text-textSub leading-relaxed">Powered by Veo 3.1. Generates high-definition, cinematic 1080p videos from complex prompts. Includes automatic script drafting and scene planning.</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default HomeScreen;
