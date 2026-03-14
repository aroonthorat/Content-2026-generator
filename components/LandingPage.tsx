
import React from 'react';
import LogoIcon from './icons/LogoIcon';
import MCQIcon from './icons/MCQIcon';
import ReaderIcon from './icons/ReaderIcon';
import VideoIcon from './icons/VideoIcon';
import ImageGenIcon from './icons/ImageGenIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import { AppTheme } from '../types';

interface LandingPageProps {
  onLoginClick: () => void;
  currentTheme: AppTheme;
  onToggleTheme: () => void;
  onGuestAccess: (files?: FileList) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, currentTheme, onToggleTheme, onGuestAccess }) => {
  return (
    <div className="w-full min-h-screen flex flex-col text-textMain animate-slide-fade-in relative z-10 overflow-y-auto custom-scrollbar">
      
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <LogoIcon className="w-10 h-10" />
          <span className="text-xl font-bold tracking-tight">Synapse</span>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={onToggleTheme}
                className="p-2 rounded-full hover:bg-textMain/10 transition-colors text-textMain"
                title="Toggle Theme"
            >
                {currentTheme.id === 'NOCTURNE' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
            <button 
            onClick={onLoginClick}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/25 active:scale-95"
            >
            Login
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-10 mb-20">
        <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-6 animate-pop-in">
          Powered by Gemini AI
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 max-w-4xl mx-auto leading-tight">
          The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">AI Toolkit</span> for Education & Creators
        </h1>
        <p className="text-lg md:text-xl text-textSub max-w-2xl mx-auto mb-10 leading-relaxed">
          Transform static images into quizzes, generate neural voiceovers, animate stories, and design political campaigns—all in one secure platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onLoginClick}
            className="px-8 py-4 bg-textMain text-background font-black rounded-2xl text-lg hover:scale-105 transition-transform shadow-xl"
          >
            Get Started Now
          </button>
          <button className="px-8 py-4 bg-surface border border-border text-textMain font-bold rounded-2xl text-lg hover:bg-black/10 transition-colors backdrop-blur-md">
            View Demo
          </button>
        </div>
      </header>

      {/* Features Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-surface p-8 rounded-3xl border border-border hover:border-primary transition-all group">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MCQIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">MCQ Scanner</h3>
            <p className="text-sm text-textSub leading-relaxed">
              Upload any exam paper image. AI extracts questions, reads them aloud, and handles the grading timer automatically.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-surface p-8 rounded-3xl border border-border hover:border-secondary transition-all group">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ReaderIcon className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Neural Reader</h3>
            <p className="text-sm text-textSub leading-relaxed">
              Convert text to lifelike speech. Clone voices or use professional presets with atmospheric background music.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-surface p-8 rounded-3xl border border-border hover:border-accent transition-all group">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <VideoIcon className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Animation Studio</h3>
            <p className="text-sm text-textSub leading-relaxed">
              Turn prompts into frame-by-frame animations. Visualize stories with consistent character consistency.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-surface p-8 rounded-3xl border border-border hover:border-textSub transition-all group">
            <div className="w-14 h-14 bg-textSub/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ImageGenIcon className="w-8 h-8 text-textMain" />
            </div>
            <h3 className="text-xl font-bold mb-3">Campaign Architect</h3>
            <p className="text-sm text-textSub leading-relaxed">
              Design complex political posters. Manage candidate hierarchies and party branding with AI precision.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border mt-auto bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2 text-textMain opacity-50">
             <LogoIcon className="w-6 h-6" />
             <span className="font-bold text-sm">Synapse © 2024</span>
           </div>
           <div className="flex gap-8 text-sm text-textSub font-medium">
             <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
             <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
           </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
