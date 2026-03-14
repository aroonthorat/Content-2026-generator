
import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { AppState, QuestionData, User, UserAccount, AppTheme, LogoVariant, UserPermissions } from './types';
import { fileToBase64 } from './utils/file';
import { playAudio, playBeep, initAudio } from './utils/audio';
import { processQuestionImage, textToSpeech } from './services/geminiService';
import { useScreenRecorder } from './hooks/useScreenRecorder';
import { userService } from './services/userService';

import FileUpload from './components/FileUpload';
import QuestionDisplay from './components/QuestionDisplay';
import SpinnerIcon from './components/icons/SpinnerIcon';
import LogoIcon from './components/icons/LogoIcon';
import HomeScreen from './components/HomeScreen';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import ArrowLeftIcon from './components/icons/ArrowLeftIcon';
import BackgroundController from './components/BackgroundController';
import SettingsIcon from './components/icons/SettingsIcon';
import SettingsModal from './components/SettingsModal';

const Reader = React.lazy(() => import('./components/Reader'));
const AnimationTool = React.lazy(() => import('./components/AnimationTool'));
const PosterMaker = React.lazy(() => import('./components/PosterMaker'));
const ProVideoMaker = React.lazy(() => import('./components/ProVideoMaker'));
const BulkImageEditor = React.lazy(() => import('./components/BulkImageEditor'));
const MathLayoutReplicator = React.lazy(() => import('./components/MathLayoutReplicator'));
const AIVideoGenerator = React.lazy(() => import('./components/AIVideoGenerator'));

const THEMES: Record<string, AppTheme> = {
  PRISM: { id: 'PRISM', name: 'Geometric Prism', category: 'Basic', colors: { '--color-background': '#1f2937', '--color-surface': 'rgba(255, 255, 255, 0.15)', '--color-primary': '#2dd4bf', '--color-primary-hover': '#14b8a6', '--color-secondary': '#fb923c', '--color-accent': '#94a3b8', '--color-border': 'rgba(45, 212, 191, 0.3)', '--color-text-main': '#f1f5f9', '--color-text-sub': '#cbd5e1', '--color-text-muted': 'rgba(203, 213, 225, 0.5)' } },
  FLUX: { id: 'FLUX', name: 'Aurora Flux', category: 'Basic', colors: { '--color-background': '#111827', '--color-surface': 'rgba(17, 17, 39, 0.6)', '--color-primary': '#22d3ee', '--color-primary-hover': '#06b6d4', '--color-secondary': '#c026d3', '--color-accent': '#818cf8', '--color-border': 'rgba(34, 211, 238, 0.3)', '--color-text-main': '#f9fafb', '--color-text-sub': '#9ca3af', '--color-text-muted': 'rgba(156, 163, 175, 0.5)' } },
  RETROWAVE: { id: 'RETROWAVE', name: 'Retrowave 80s', category: 'Basic', colors: { '--color-background': '#120421', '--color-surface': 'rgba(26, 11, 46, 0.8)', '--color-primary': '#00f2ff', '--color-primary-hover': '#00c2cc', '--color-secondary': '#ff0055', '--color-accent': '#fcd34d', '--color-border': 'rgba(0, 242, 255, 0.4)', '--color-text-main': '#ffffff', '--color-text-sub': '#e0aaff', '--color-text-muted': 'rgba(224, 170, 255, 0.5)' } },
  WATERCOLOR: { id: 'WATERCOLOR', name: 'Soft Watercolor', category: 'Basic', colors: { '--color-background': '#fdfbf7', '--color-surface': 'rgba(255, 255, 255, 0.65)', '--color-primary': '#6366f1', '--color-primary-hover': '#4f46e5', '--color-secondary': '#ec4899', '--color-accent': '#f59e0b', '--color-border': 'rgba(99, 102, 241, 0.15)', '--color-text-main': '#1f2937', '--color-text-sub': '#475569', '--color-text-muted': 'rgba(71, 85, 105, 0.5)' } },
  NOCTURNE: { id: 'NOCTURNE', name: 'Midnight Ink', category: 'Basic', colors: { '--color-background': '#020617', '--color-surface': 'rgba(15, 23, 42, 0.6)', '--color-primary': '#f472b6', '--color-primary-hover': '#ec4899', '--color-secondary': '#818cf8', '--color-accent': '#2dd4bf', '--color-border': 'rgba(244, 114, 182, 0.2)', '--color-text-main': '#f8fafc', '--color-text-sub': '#94a3b8', '--color-text-muted': 'rgba(148, 163, 184, 0.5)' } },
  BW_WATERCOLOR: { id: 'BW_WATERCOLOR', name: 'Ink & Wash', category: 'Basic', colors: { '--color-background': '#f8f9fa', '--color-surface': 'rgba(255, 255, 255, 0.7)', '--color-primary': '#111111', '--color-primary-hover': '#333333', '--color-secondary': '#525252', '--color-accent': '#d4d4d4', '--color-border': 'rgba(0, 0, 0, 0.1)', '--color-text-main': '#000000', '--color-text-sub': '#4a4a4a', '--color-text-muted': 'rgba(0, 0, 0, 0.4)' } },
  BOKEH: { id: 'BOKEH', name: 'Golden Bokeh', category: 'Basic', colors: { '--color-background': '#2a1b26', '--color-surface': 'rgba(60, 40, 50, 0.5)', '--color-primary': '#fbbf24', '--color-primary-hover': '#f59e0b', '--color-secondary': '#be185d', '--color-accent': '#f472b6', '--color-border': 'rgba(251, 191, 36, 0.2)', '--color-text-main': '#fffbeb', '--color-text-sub': '#fde68a', '--color-text-muted': 'rgba(253, 230, 138, 0.5)' } },
  NEBULA: { id: 'NEBULA', name: 'Abstract Waves', category: 'Basic', colors: { '--color-background': '#0f172a', '--color-surface': 'rgba(30, 41, 59, 0.7)', '--color-primary': '#38bdf8', '--color-primary-hover': '#0ea5e9', '--color-secondary': '#818cf8', '--color-accent': '#c084fc', '--color-border': 'rgba(56, 189, 248, 0.3)', '--color-text-main': '#f0f9ff', '--color-text-sub': '#bae6fd', '--color-text-muted': 'rgba(186, 230, 253, 0.5)' } },
  MATRIX: { id: 'MATRIX', name: 'The Construct', category: 'Basic', colors: { '--color-background': '#020602', '--color-surface': 'rgba(10, 30, 10, 0.7)', '--color-primary': '#22c55e', '--color-primary-hover': '#16a34a', '--color-secondary': '#064e3b', '--color-accent': '#4ade80', '--color-border': 'rgba(34, 197, 94, 0.4)', '--color-text-main': '#f0fdf4', '--color-text-sub': '#86efac', '--color-text-muted': 'rgba(134, 239, 172, 0.5)' } },
  LABORATORY: { id: 'LABORATORY', name: 'Scientific Lab', category: 'Chemistry', colors: { '--color-background': '#0f172a', '--color-surface': 'rgba(15, 23, 42, 0.75)', '--color-primary': '#a855f7', '--color-primary-hover': '#9333ea', '--color-secondary': '#22c55e', '--color-accent': '#3b82f6', '--color-border': 'rgba(168, 85, 247, 0.3)', '--color-text-main': '#f8fafc', '--color-text-sub': '#e2e8f0', '--color-text-muted': 'rgba(203, 213, 225, 0.5)' } },
};

const SUPER_ADMIN_EMAIL = 'aroonthorat@dev.com';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(userService.getSession());
  const [users, setUsers] = useState<UserAccount[]>(userService.getAllUsers());
  const [showLogin, setShowLogin] = useState(false);

  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    try {
        const saved = localStorage.getItem('global_theme_pref');
        if (saved && THEMES[saved]) return THEMES[saved];
    } catch(e) {}
    if (typeof window !== 'undefined' && window.matchMedia) {
         const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
         return prefersDark ? THEMES.NOCTURNE : THEMES.WATERCOLOR;
    }
    return THEMES.WATERCOLOR;
  });

  const [currentLogo, setCurrentLogo] = useState<LogoVariant>('DEFAULT');
  const [showSettings, setShowSettings] = useState(false);
  const [mcqReaderTitle, setMcqReaderTitle] = useState<string>('MCQ Reader');
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<'HOME' | 'MCQ_READER' | 'READER' | 'ADMIN_DASHBOARD' | 'VIDEO_MAKER' | 'POSTER_MAKER' | 'PRO_VIDEO_MAKER' | 'BULK_EDITOR' | 'MATH_REPLICATOR' | 'AI_VIDEO_GENERATOR'>('HOME');
  const [questionQueue, setQuestionQueue] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [highlightedOption, setHighlightedOption] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const appContainerRef = useRef<HTMLDivElement>(null);
  
  const refreshUserData = () => {
    setUsers(userService.getAllUsers());
    const session = userService.getSession();
    setUser(session);
  };

  useEffect(() => {
    if (user) {
        if (user.email === 'guest@synapse.ai') {
           setSettingsLoaded(true);
           return;
        }

        const savedSettings = localStorage.getItem(`settings_${user.email}`);
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                if (parsed.themeId && THEMES[parsed.themeId]) {
                    setCurrentTheme(THEMES[parsed.themeId]);
                }
                if (parsed.logo) setCurrentLogo(parsed.logo as LogoVariant);
                if (parsed.mcqTitle) setMcqReaderTitle(parsed.mcqTitle);
            } catch (e) {}
        } else {
            setCurrentLogo('DEFAULT');
            setMcqReaderTitle('MCQ Reader');
        }
        setSettingsLoaded(true);
    } else {
        setSettingsLoaded(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && settingsLoaded && user.email !== 'guest@synapse.ai') {
        const settings = { themeId: currentTheme.id, logo: currentLogo, mcqTitle: mcqReaderTitle };
        localStorage.setItem(`settings_${user.email}`, JSON.stringify(settings));
    }
    localStorage.setItem('global_theme_pref', currentTheme.id);
  }, [currentTheme, currentLogo, mcqReaderTitle, user, settingsLoaded]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-background', currentTheme.colors['--color-background']);
    root.style.setProperty('--color-surface', currentTheme.colors['--color-surface']);
    root.style.setProperty('--color-primary', currentTheme.colors['--color-primary']);
    root.style.setProperty('--color-primary-hover', currentTheme.colors['--color-primary-hover']);
    root.style.setProperty('--color-secondary', currentTheme.colors['--color-secondary']);
    root.style.setProperty('--color-accent', currentTheme.colors['--color-accent']);
    root.style.setProperty('--color-border', currentTheme.colors['--color-border']);
    root.style.setProperty('--color-text-main', currentTheme.colors['--color-text-main']);
    root.style.setProperty('--color-text-sub', currentTheme.colors['--color-text-sub']);
    root.style.setProperty('--color-text-muted', currentTheme.colors['--color-text-muted']);
  }, [currentTheme]);

  const { isEnabled: isRecordingEnabled, setIsEnabled: setIsRecordingEnabled, isActive: isRecordingActive, isFinalizing: isFinalizingRecording, finalRecording, error: recordingError, startRecording, stopRecording, resetRecording } = useScreenRecorder();

  const currentQuestion = currentQuestionIndex >= 0 ? questionQueue[currentQuestionIndex] : null;

  const handleUpdatePermissions = (email: string, permissions: UserPermissions) => {
      userService.updatePermissions(email, permissions);
      refreshUserData();
  };

  const handleRegister = async (newUser: UserAccount) => {
      try {
          const loggedInUser = await userService.register(newUser);
          setUser(loggedInUser);
          refreshUserData();
      } catch (e) {
          console.error(e);
      }
  };

  const toggleTheme = () => {
    if (currentTheme.id === 'NOCTURNE') {
        setCurrentTheme(THEMES.WATERCOLOR);
    } else {
        setCurrentTheme(THEMES.NOCTURNE);
    }
  };

  const trackUsage = useCallback((type: string, count: number = 1) => {
    if (!user || user.email === 'guest@synapse.ai') return;
    userService.trackUsage(user.email);
  }, [user]);

  const resetToHome = useCallback(() => {
    resetRecording();
    setQuestionQueue([]);
    setCurrentQuestionIndex(-1);
    setAppState(AppState.IDLE);
    setHighlightedOption(null);
    setGeneralError(null);
    setCountdown(null);
    setCurrentView('HOME');
  }, [resetRecording]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questionQueue.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setHighlightedOption(null);
        setCountdown(null);
        setAppState(AppState.DISPLAYING_QUESTION);
      }, 2000);
    }
  }, [currentQuestionIndex, questionQueue.length]);

  const handleFileSelect = async (files: FileList) => {
    initAudio();
    setGeneralError(null);
    setQuestionQueue([]);
    setCurrentQuestionIndex(-1);
    setHighlightedOption(null);
    setCountdown(null);
    trackUsage('MCQ', files.length);
    await startRecording();
    setAppState(AppState.PROCESSING_IMAGE);
    try {
      const processingPromises = Array.from(files).map(async (file) => {
        const base64Image = await fileToBase64(file);
        return await processQuestionImage(base64Image);
      });
      const results = await Promise.all(processingPromises);
      setAppState(AppState.PREPARING_AUDIO);
      const audioEnhancedQuestions = await Promise.all(results.map(async (q: QuestionData) => {
        const qText = `${q.question}. ${q.options.map(o => `Option ${o.letter}. ${o.text}`).join('. ')}`;
        const correct = q.options.find(o => o.letter === q.correctOption);
        const aText = `The correct answer is option ${correct?.letter}. ${correct?.text}.`;
        const [questionAudio, answerAudio] = await Promise.all([textToSpeech(qText), textToSpeech(aText)]);
        return { ...q, questionAudio, answerAudio };
      }));
      setQuestionQueue(audioEnhancedQuestions);
      setCurrentQuestionIndex(0);
      setAppState(AppState.DISPLAYING_QUESTION);
    } catch (err: any) {
      setGeneralError(`Failed to process batch. ${err.message || String(err)}`);
      setAppState(AppState.IDLE);
      resetRecording(); 
    }
  };

  const handleGuestAccess = (files?: FileList) => {
    const guestUser: User = {
        email: 'guest@synapse.ai',
        name: 'Guest',
        role: 'USER',
        permissions: { mcq: true, reader: true, video: true, proVideo: true, poster: true, bulkEditor: true, mathReplicator: true, aiVideoGenerator: true }
    };
    setUser(guestUser);
    if (files && files.length > 0) {
        setCurrentView('MCQ_READER');
        handleFileSelect(files);
    }
  };

  useEffect(() => {
    if (appState === AppState.DISPLAYING_QUESTION && currentQuestion) {
      const timer = setTimeout(() => setAppState(AppState.READING_ALOUD), 3000);
      return () => clearTimeout(timer);
    }
  }, [appState, currentQuestion]);

  useEffect(() => {
    const runAudioWorkflow = async () => {
      if (appState === AppState.READING_ALOUD && currentQuestion?.questionAudio) {
        try {
          await playAudio(currentQuestion.questionAudio);
          setAppState(AppState.COUNTDOWN);
        } catch (err) {
          setAppState(AppState.IDLE);
        }
      } else if (appState === AppState.REVEALING_ANSWER && currentQuestion?.answerAudio) {
        const correctOption = currentQuestion.options.find(o => o.letter === currentQuestion.correctOption);
        if (correctOption) {
          setHighlightedOption(correctOption.letter);
          try {
            await playAudio(currentQuestion.answerAudio);
            goToNextQuestion();
          } catch (err) {}
        }
      }
    };
    runAudioWorkflow();
  }, [appState, currentQuestion, goToNextQuestion]);

  useEffect(() => {
    if (appState !== AppState.COUNTDOWN) return;
    let currentCount = 5;
    setCountdown(currentCount);
    playBeep();
    const intervalId = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
        playBeep();
      } else {
        clearInterval(intervalId);
        setAppState(AppState.REVEALING_ANSWER);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [appState]);
  
  const isLastQuestion = questionQueue.length > 0 && currentQuestionIndex === questionQueue.length - 1;
  const showTryAgain = isLastQuestion && appState === AppState.REVEALING_ANSWER;

  useEffect(() => {
    if (showTryAgain && isRecordingActive) stopRecording();
  }, [showTryAgain, isRecordingActive, stopRecording]);

  const handleDownloadRecording = () => {
    if (!finalRecording) return;
    const blob = finalRecording as Blob;
    const url = window.URL.createObjectURL(blob);
    const firstWord = questionQueue[0]?.question.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '') || 'session';
    const a = document.createElement('a');
    a.href = url;
    a.download = `${firstWord}-reader-session.${blob.type.split('/')[1] || 'webm'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const getStatusMessage = () => {
    if (isFinalizingRecording) return "Finalizing screen recording...";
    if (appState === AppState.PROCESSING_IMAGE || appState === AppState.PREPARING_AUDIO) return "Loading...";
    if (appState === AppState.REVEALING_ANSWER && isLastQuestion) return "All questions complete!";
    return null;
  };
  
  const getHeaderContent = () => {
    switch(currentView) {
        case 'MCQ_READER': return { title: mcqReaderTitle, subtitle: '', logoSize: 'w-24 h-24', titleSize: 'text-3xl', subtitleSize: 'text-base', headerMargin: 'mb-4' };
        case 'READER': return { title: 'Neural Reader', subtitle: 'High-fidelity TTS', logoSize: 'w-24 h-24', titleSize: 'text-3xl', subtitleSize: 'text-base', headerMargin: 'mb-4' };
        case 'VIDEO_MAKER': return { title: 'Animation Studio', subtitle: 'AI Sequential Art', logoSize: 'w-24 h-24', titleSize: 'text-3xl', subtitleSize: 'text-base', headerMargin: 'mb-4' };
        case 'PRO_VIDEO_MAKER': return { title: 'Video Director', subtitle: 'Powered by Veo 3.1', logoSize: 'w-24 h-24', titleSize: 'text-3xl', subtitleSize: 'text-base', headerMargin: 'mb-4' };
        case 'BULK_EDITOR': return { title: 'Photo Lab', subtitle: 'Intelligent Restoration', logoSize: 'w-24 h-24', titleSize: 'text-3xl', subtitleSize: 'text-base', headerMargin: 'mb-4' };
        case 'POSTER_MAKER': return { title: 'Campaign Planner', subtitle: 'Political Strategy', logoSize: 'w-24 h-24', titleSize: 'text-3xl', subtitleSize: 'text-base', headerMargin: 'mb-4' };
        case 'MATH_REPLICATOR': return { title: 'Docu-Replica', subtitle: 'Math Reconstruction', logoSize: 'w-24 h-24', titleSize: 'text-3xl', subtitleSize: 'text-base', headerMargin: 'mb-4' };
        case 'AI_VIDEO_GENERATOR': return { title: 'AI Storyteller', subtitle: 'Automated Scripts & Scenes', logoSize: 'w-24 h-24', titleSize: 'text-3xl', subtitleSize: 'text-base', headerMargin: 'mb-4' };
        case 'ADMIN_DASHBOARD': return { title: 'Admin Console', subtitle: 'User Control Panel', logoSize: 'w-24 h-24', titleSize: 'text-3xl', subtitleSize: 'text-base', headerMargin: 'mb-4' };
        default: return { title: 'Synapse', subtitle: 'AI Laboratory', logoSize: 'w-40 h-40', titleSize: 'text-4xl', subtitleSize: 'text-lg', headerMargin: 'mb-8' };
    }
  };

  const isSuperAdmin = user?.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  if (!user) return (
    <div className="min-h-screen text-textMain flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden z-10">
      <BackgroundController theme={currentTheme} />
      {showLogin ? (
        <LoginPage 
          onLogin={setUser} 
          onRegister={handleRegister} 
          onBack={() => setShowLogin(false)}
          users={users} 
          logoVariant={currentLogo} 
        />
      ) : (
        <LandingPage 
            onLoginClick={() => setShowLogin(true)} 
            currentTheme={currentTheme}
            onToggleTheme={toggleTheme}
            onGuestAccess={handleGuestAccess}
        />
      )}
    </div>
  );

  const headerContent = getHeaderContent();
  const displayError = (generalError || recordingError) as string | null;

  return (
    <div ref={appContainerRef} className="min-h-screen text-textMain flex flex-col items-center justify-center p-4 font-sans relative transition-colors duration-500 overflow-hidden z-0">
      <BackgroundController theme={currentTheme} />
      {currentView !== 'HOME' && <button onClick={resetToHome} className="absolute top-4 left-4 text-textSub hover:text-textMain transition-colors p-2 rounded-full hover:bg-surface z-20"><ArrowLeftIcon className="w-8 h-8" /></button>}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
         {isSuperAdmin && <div className="px-3 py-1 bg-surface border border-primary rounded-full text-xs text-primary font-bold uppercase tracking-wider">Admin</div>}
         <button onClick={() => setShowSettings(true)} className="p-2 text-textSub hover:text-textMain hover:bg-surface rounded-full border border-transparent hover:border-border"><SettingsIcon className="w-6 h-6" /></button>
         {user && user.email === 'guest@synapse.ai' && (
             <div className="px-3 py-1 bg-accent/20 border border-accent rounded-full text-xs text-accent font-bold uppercase tracking-wider">Guest</div>
         )}
      </div>
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} themes={Object.values(THEMES)} currentTheme={currentTheme} onSetTheme={setCurrentTheme} currentLogo={currentLogo} onSetLogo={setCurrentLogo} mcqReaderTitle={mcqReaderTitle} onSetMcqReaderTitle={setMcqReaderTitle} />
      <div className="w-full max-w-5xl mx-auto animate-slide-fade-in flex flex-col items-center relative z-10">
        <header className={`text-center flex flex-col items-center transition-all ${headerContent.headerMargin}`}>
            <LogoIcon variant={currentLogo} className={`transition-all ${headerContent.logoSize}`} />
            <h1 className={`font-extrabold text-textMain tracking-tight mt-4 animate-text-glow transition-all ${headerContent.titleSize}`}>{headerContent.title}</h1>
            <p className={`text-textSub mt-2 transition-opacity ${headerContent.subtitleSize}`}>{headerContent.subtitle}</p>
        </header>
        <main className="w-full">
            {currentView === 'HOME' && (
              <HomeScreen 
                user={user} 
                onSelectMCQReader={() => setCurrentView('MCQ_READER')} 
                onSelectReader={() => setCurrentView('READER')} 
                onSelectVideoMaker={() => setCurrentView('VIDEO_MAKER')}
                onSelectProVideoMaker={() => setCurrentView('PRO_VIDEO_MAKER')}
                onSelectPosterMaker={() => setCurrentView('POSTER_MAKER')}
                onSelectBulkEditor={() => setCurrentView('BULK_EDITOR')}
                onSelectMathReplicator={() => setCurrentView('MATH_REPLICATOR')}
                onSelectAIVideoGenerator={() => setCurrentView('AI_VIDEO_GENERATOR')}
                onSelectAdmin={() => setCurrentView('ADMIN_DASHBOARD')} 
                onOpenSettings={() => setShowSettings(true)} 
                mcqReaderTitle={mcqReaderTitle} 
              />
            )}
            {currentView === 'ADMIN_DASHBOARD' && isSuperAdmin && <AdminDashboard users={users} onAddUser={(u) => { userService.addUser(u); refreshUserData(); }} onDeleteUser={(e) => { userService.deleteUser(e); refreshUserData(); }} onUpdatePermissions={handleUpdatePermissions} currentUserEmail={user.email} themes={Object.values(THEMES)} currentTheme={currentTheme} onSetTheme={setCurrentTheme} />}
            {currentView === 'MCQ_READER' && (
            <div className="max-w-2xl mx-auto">
              {displayError && <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 mb-6 rounded-md text-center"><p className="font-bold">Error</p><p>{displayError}</p></div>}
              <div className="h-8 mb-4 text-center text-textSub flex items-center justify-center space-x-2">{(getStatusMessage()) && <SpinnerIcon />}<span>{getStatusMessage()}</span>{questionQueue.length > 0 && !showTryAgain && <span className="font-semibold">({currentQuestionIndex + 1}/{questionQueue.length})</span>}</div>
              {!currentQuestion && !showTryAgain ? (
                <>
                  <div className="flex items-center justify-center mb-4 space-x-2 p-2 rounded-md bg-surface"><input type="checkbox" id="record-session" checked={isRecordingEnabled} onChange={(e) => setIsRecordingEnabled(e.target.checked)} className="w-4 h-4 text-primary bg-gray-700 border-border rounded" /><label htmlFor="record-session" className="text-sm font-medium text-textSub cursor-pointer">Record Session</label></div>
                  <FileUpload onFileSelect={handleFileSelect} disabled={appState === AppState.PROCESSING_IMAGE} />
                </>
              ) : (currentQuestion && <div className="relative bg-surface rounded-2xl p-6 border border-border animate-pulse-glow"><QuestionDisplay questionData={currentQuestion} highlightedOption={highlightedOption} />{appState === AppState.COUNTDOWN && countdown !== null && <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg z-10"><span key={countdown} className="text-9xl font-bold text-white animate-pop-in">{countdown}</span></div>}</div>)}
              {showTryAgain && <div className="mt-8 text-center flex flex-col sm:flex-row gap-4 justify-center"><button onClick={resetToHome} className="px-8 py-3 bg-secondary text-white font-semibold rounded-lg hover:opacity-90">Back to Home</button>{finalRecording && <button onClick={handleDownloadRecording} className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover">Download Recording</button>}</div>}
            </div>
            )}
            {currentView === 'READER' && <Suspense fallback={<div className="flex justify-center p-10 text-primary"><SpinnerIcon /></div>}><Reader onUsage={() => trackUsage('TTS')} /></Suspense>}
            {currentView === 'VIDEO_MAKER' && <Suspense fallback={<div className="flex justify-center p-10 text-primary"><SpinnerIcon /></div>}><AnimationTool onUsage={() => trackUsage('ANIMATION')} /></Suspense>}
            {currentView === 'POSTER_MAKER' && <Suspense fallback={<div className="flex justify-center p-10 text-primary"><SpinnerIcon /></div>}><PosterMaker onUsage={() => trackUsage('POSTER')} /></Suspense>}
            {currentView === 'PRO_VIDEO_MAKER' && <Suspense fallback={<div className="flex justify-center p-10 text-primary"><SpinnerIcon /></div>}><ProVideoMaker onUsage={() => trackUsage('VEO')} /></Suspense>}
            {currentView === 'BULK_EDITOR' && <Suspense fallback={<div className="flex justify-center p-10 text-primary"><SpinnerIcon /></div>}><BulkImageEditor onUsage={() => trackUsage('BULK')} /></Suspense>}
            {currentView === 'MATH_REPLICATOR' && <Suspense fallback={<div className="flex justify-center p-10 text-primary"><SpinnerIcon /></div>}><MathLayoutReplicator onUsage={() => trackUsage('MATH')} /></Suspense>}
            {currentView === 'AI_VIDEO_GENERATOR' && <Suspense fallback={<div className="flex justify-center p-10 text-primary"><SpinnerIcon /></div>}><AIVideoGenerator onUsage={() => trackUsage('AI_VIDEO')} /></Suspense>}
        </main>
        <footer className="text-center mt-8 text-sm text-textSub"><p>Powered by Google Gemini</p><button onClick={() => { userService.logout(); setUser(null); }} className="text-xs mt-2 text-primary hover:text-textMain underline">Logout ({user.name})</button></footer>
      </div>
    </div>
  );
};

export default App;
