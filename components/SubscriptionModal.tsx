
import React, { useState } from 'react';
import { UserAccount, UserPermissions } from '../types';
import CloseIcon from './icons/CloseIcon';
import CheckIcon from './icons/CheckIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import CreditCardIcon from './icons/CreditCardIcon';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (user: UserAccount) => void;
  existingEmails: string[];
}

type PlanType = 'STUDENT' | 'CREATOR' | 'PRO';

const PLANS: Record<PlanType, { 
  name: string; 
  price: string; 
  features: string[]; 
  permissions: UserPermissions; 
  color: string;
}> = {
  STUDENT: {
    name: 'Student',
    price: 'Free',
    features: ['TTS Reader', 'Basic Voice Access'],
    permissions: { mcq: false, reader: true, video: false, proVideo: false, poster: false, bulkEditor: false, mathReplicator: false },
    color: 'bg-slate-500'
  },
  CREATOR: {
    name: 'Creator',
    price: '$12/mo',
    features: ['Animation Studio', 'TTS Reader', 'Voice Cloning', 'Bulk Photo Editor'],
    permissions: { mcq: false, reader: true, video: true, proVideo: false, poster: false, bulkEditor: true, mathReplicator: true },
    color: 'bg-secondary'
  },
  PRO: {
    name: 'Professional',
    price: '$39/mo',
    features: ['Cinematic Video (Veo)', 'Poster Architect', 'Full Suite Access', 'Priority Processing'],
    permissions: { mcq: true, reader: true, video: true, proVideo: true, poster: true, bulkEditor: true, mathReplicator: true },
    color: 'bg-gradient-to-r from-primary to-accent'
  }
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onRegister, existingEmails }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  
  // Registration State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Payment State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNextStep = () => {
    setError(null);
    if (step === 1 && selectedPlan) {
      setStep(2);
    } else if (step === 2) {
      if (!name || !email || !password) {
        setError("Please fill in all account details.");
        return;
      }
      if (existingEmails.includes(email.toLowerCase())) {
        setError("Email already exists. Please login.");
        return;
      }
      // Skip payment for free plan
      if (PLANS[selectedPlan!].price === 'Free') {
        handleSubmit();
      } else {
        setStep(3);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedPlan) return;

    // Basic mock validation
    if (PLANS[selectedPlan].price !== 'Free') {
        if (cardNumber.length < 12 || expiry.length < 4 || cvc.length < 3) {
            setError("Please enter valid card details (Mock: Any 16 digits).");
            return;
        }
    }

    setIsLoading(true);
    
    // Simulate API processing
    setTimeout(() => {
        onRegister({
            name,
            email,
            password,
            role: 'USER',
            permissions: PLANS[selectedPlan].permissions,
            stats: { mcqGenerations: 0, ttsGenerations: 0, lastActive: 'Just Joined' }
        });
        setIsLoading(false);
        onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-surface rounded-3xl border border-border shadow-2xl animate-pop-in flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-black/20">
            <div>
                <h2 className="text-xl font-bold text-textMain">
                    {step === 1 && "Choose Your Plan"}
                    {step === 2 && "Create Your Account"}
                    {step === 3 && "Secure Payment"}
                </h2>
                <div className="flex gap-2 mt-2">
                    <div className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-700'}`}></div>
                    <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-700'}`}></div>
                    <div className={`h-1 w-8 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-gray-700'}`}></div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 text-textSub hover:text-white"><CloseIcon className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            
            {/* Step 1: Plans */}
            {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(Object.keys(PLANS) as PlanType[]).map((type) => {
                        const plan = PLANS[type];
                        const isSelected = selectedPlan === type;
                        return (
                            <div 
                                key={type}
                                onClick={() => setSelectedPlan(type)}
                                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col ${isSelected ? 'border-primary bg-primary/10 scale-105 shadow-xl' : 'border-border bg-black/20 hover:border-textSub'}`}
                            >
                                <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-xl ${plan.color}`}></div>
                                <h3 className="text-lg font-bold text-textMain mt-2">{plan.name}</h3>
                                <div className="text-2xl font-black text-textMain my-2">{plan.price}</div>
                                <ul className="flex-1 space-y-3 mt-4 mb-6">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-textSub">
                                            <div className="text-primary"><CheckIcon /></div> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-2 rounded-lg font-bold text-sm ${isSelected ? 'bg-primary text-white' : 'bg-surface text-textSub'}`}>
                                    {isSelected ? 'Selected' : 'Choose Plan'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Step 2: Account Info */}
            {step === 2 && (
                <div className="max-w-md mx-auto space-y-6 animate-slide-fade-in">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-textSub uppercase mb-1 block">Full Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-textMain focus:ring-1 focus:ring-primary outline-none" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-textSub uppercase mb-1 block">Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-textMain focus:ring-1 focus:ring-primary outline-none" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-textSub uppercase mb-1 block">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-textMain focus:ring-1 focus:ring-primary outline-none" placeholder="••••••••" />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
                <div className="max-w-md mx-auto space-y-6 animate-slide-fade-in">
                    <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-border shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCardIcon className="w-32 h-32 text-white" /></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-center text-white/50 text-xs font-mono">
                                <span>CREDIT CARD</span>
                                <span>SECURE</span>
                            </div>
                            <div>
                                <label className="text-[10px] text-white/70 uppercase tracking-widest block mb-1">Card Number</label>
                                <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} maxLength={19} className="w-full bg-transparent border-b border-white/20 text-xl font-mono text-white placeholder-white/20 outline-none focus:border-primary" placeholder="0000 0000 0000 0000" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] text-white/70 uppercase tracking-widest block mb-1">Expiry</label>
                                    <input type="text" value={expiry} onChange={e => setExpiry(e.target.value)} maxLength={5} className="w-full bg-transparent border-b border-white/20 text-lg font-mono text-white placeholder-white/20 outline-none focus:border-primary" placeholder="MM/YY" />
                                </div>
                                <div className="w-24">
                                    <label className="text-[10px] text-white/70 uppercase tracking-widest block mb-1">CVC</label>
                                    <input type="text" value={cvc} onChange={e => setCvc(e.target.value)} maxLength={3} className="w-full bg-transparent border-b border-white/20 text-lg font-mono text-white placeholder-white/20 outline-none focus:border-primary" placeholder="123" />
                                </div>
                            </div>
                            <div className="text-right text-xs text-white/50">{name || 'YOUR NAME'}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">i</div>
                        <p className="text-xs text-blue-200">This is a mock payment. You won't be charged.</p>
                    </div>
                </div>
            )}
            
            {error && <p className="text-center text-red-400 text-sm bg-red-900/10 p-2 rounded-lg border border-red-500/20 mt-4">{error}</p>}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-black/20 flex justify-between items-center">
            {step > 1 ? (
                <button onClick={() => setStep(prev => prev - 1 as any)} className="text-textSub hover:text-textMain text-sm font-semibold">Back</button>
            ) : (
                <div></div>
            )}
            
            <button 
                onClick={step === 3 || (step === 2 && selectedPlan && PLANS[selectedPlan].price === 'Free') ? handleSubmit : handleNextStep}
                disabled={!selectedPlan || isLoading}
                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${!selectedPlan ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-hover shadow-lg'}`}
            >
                {isLoading && <SpinnerIcon />}
                {step === 3 ? `Pay ${selectedPlan ? PLANS[selectedPlan].price : ''} & Join` : (step === 2 && selectedPlan && PLANS[selectedPlan].price === 'Free' ? 'Create Free Account' : 'Continue')}
            </button>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionModal;
