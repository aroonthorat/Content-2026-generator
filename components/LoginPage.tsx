
import React, { useState } from 'react';
import LogoIcon from './icons/LogoIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import SubscriptionModal from './SubscriptionModal';
import { User, UserAccount, LogoVariant } from '../types';
import { userService } from '../services/userService';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onRegister?: (user: UserAccount) => void;
  onBack?: () => void;
  users: UserAccount[];
  logoVariant?: LogoVariant;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, onBack, users, logoVariant = 'DEFAULT' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubscription, setShowSubscription] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        const user = await userService.login(email, password);
        onLogin(user);
    } catch (err: any) {
        setError(err.message || 'Invalid email or password.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegisterSuccess = (newUser: UserAccount) => {
      if (onRegister) {
          onRegister(newUser);
      }
  };

  return (
    <>
    <SubscriptionModal 
        isOpen={showSubscription} 
        onClose={() => setShowSubscription(false)} 
        onRegister={handleRegisterSuccess}
        existingEmails={users.map(u => u.email.toLowerCase())}
    />
    
    <div className="w-full max-w-md mx-auto animate-slide-fade-in px-4 relative">
      {onBack && (
        <button 
          onClick={onBack} 
          className="absolute -top-16 left-4 p-2 text-textSub hover:text-textMain hover:bg-surface rounded-full transition-colors flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="text-sm font-bold">Back</span>
        </button>
      )}

      <div className="bg-surface p-8 rounded-2xl backdrop-blur-md border border-border shadow-2xl shadow-black/20">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
             <div className="absolute inset-0 bg-primary blur-xl opacity-20 rounded-full animate-pulse"></div>
             <LogoIcon variant={logoVariant} className="w-24 h-24 mb-4 relative z-10" />
          </div>
          <h1 className="text-3xl font-bold text-textMain text-center tracking-tight">Welcome Back</h1>
          <p className="text-textSub text-center mt-2">Sign in to access your tools</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-textSub ml-1">Email / ID</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-textMain placeholder-textMuted focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="user@example.com or username"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-textSub ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-textMain placeholder-textMuted focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-sm text-center animate-pop-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <SpinnerIcon />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-border pt-6">
            <p className="text-textSub text-sm mb-3">Don't have an account?</p>
            <button 
                onClick={() => setShowSubscription(true)}
                className="text-sm font-bold text-secondary hover:text-white transition-colors uppercase tracking-wider flex items-center justify-center gap-2 mx-auto hover:underline"
            >
                Get Premium Access
            </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoginPage;
