import React, { useState, useEffect, useRef } from 'react';
import { fetchConjugationChallenge } from './services/geminiService';
import { ConjugationChallenge, FrenchTense } from './types';
import { AccentKeyboard } from './components/AccentKeyboard';
import { SettingsModal } from './components/SettingsModal';
import { 
  Sparkles, 
  RefreshCcw, 
  CheckCircle2, 
  Trophy, 
  Settings2,
  Heart,
  BookOpen,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [challenge, setChallenge] = useState<ConjugationChallenge | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [status, setStatus] = useState<'loading' | 'active' | 'reviewed' | 'error'>('loading');
  const [streak, setStreak] = useState(0);
  const [selectedTenses, setSelectedTenses] = useState<FrenchTense[]>(['Présent']);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Refs for input fields to manage focus
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loadNewChallenge = async (tenses = selectedTenses) => {
    setStatus('loading');
    setChallenge(null);
    setUserAnswers([]);
    setFocusedIndex(null);
    
    try {
      const newChallenge = await fetchConjugationChallenge(tenses);
      setChallenge(newChallenge);
      setUserAnswers(new Array(newChallenge.items.length).fill(''));
      setStatus('active');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  // Initial load
  useEffect(() => {
    loadNewChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-focus first input when active
  useEffect(() => {
    if (status === 'active' && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
      setFocusedIndex(0);
    }
  }, [status]);

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const handleCheck = () => {
    if (!challenge) return;
    
    // Check if all correct
    const allCorrect = challenge.items.every((item, index) => 
      item.conjugation.toLowerCase() === userAnswers[index].trim().toLowerCase()
    );

    if (allCorrect) {
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    
    setStatus('reviewed');
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If last input, check answers. Otherwise move next.
      if (index === userAnswers.length - 1) {
        handleCheck();
      } else {
        const nextInput = inputRefs.current[index + 1];
        nextInput?.focus();
        setFocusedIndex(index + 1);
      }
    }
  };

  const insertAccent = (char: string) => {
    if (focusedIndex !== null && status === 'active') {
      const currentVal = userAnswers[focusedIndex];
      handleInputChange(focusedIndex, currentVal + char);
      inputRefs.current[focusedIndex]?.focus();
    }
  };

  const toggleTense = (tense: FrenchTense) => {
    setSelectedTenses((prev) => {
      if (prev.includes(tense)) {
        if (prev.length === 1) return prev; 
        return prev.filter((t) => t !== tense);
      }
      return [...prev, tense];
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
      {/* Background Decor */}
      <div className="fixed top-10 left-10 text-pink-200 animate-float opacity-50 pointer-events-none">
        <Heart size={48} fill="currentColor" />
      </div>
      <div className="fixed bottom-20 right-10 text-purple-200 animate-float opacity-50 pointer-events-none" style={{ animationDelay: '1s' }}>
        <Sparkles size={64} />
      </div>
      
      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
         <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full shadow-sm text-purple-900 font-bold">
            <Trophy className="text-yellow-500" size={20} />
            <span>Streak: {streak}</span>
         </div>
         <button 
           onClick={() => setIsSettingsOpen(true)}
           className="p-3 bg-white/60 backdrop-blur-md rounded-full text-slate-600 hover:bg-white hover:text-purple-600 transition-colors shadow-sm"
           aria-label="Settings"
         >
           <Settings2 size={24} />
         </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border-4 border-white p-6 sm:p-8 relative overflow-hidden min-h-[500px] flex flex-col">
        
        {status === 'loading' ? (
          <div className="flex flex-col items-center justify-center flex-1 space-y-6">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-purple-500 font-bold animate-pulse">Summoning conjugation table...</p>
          </div>
        ) : challenge ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header */}
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                {challenge.mood} • {challenge.tense}
              </span>
              <h1 className="text-4xl font-extrabold text-slate-800 capitalize mb-1">
                {challenge.verb}
              </h1>
              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
                <BookOpen size={16} />
                <span>{challenge.translation}</span>
              </div>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
              {challenge.items.map((item, index) => {
                const isCorrect = status === 'reviewed' && userAnswers[index].trim().toLowerCase() === item.conjugation.toLowerCase();
                const isWrong = status === 'reviewed' && !isCorrect;

                return (
                  <div key={index} className="flex flex-col gap-1 relative">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                      {item.pronoun}
                    </label>
                    <div className="relative">
                      <input
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        value={userAnswers[index]}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onFocus={() => setFocusedIndex(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        disabled={status === 'reviewed'}
                        className={`w-full p-3 rounded-xl border-2 outline-none font-bold text-lg transition-all
                          ${isWrong 
                            ? 'border-red-300 bg-red-50 text-red-600' 
                            : isCorrect 
                              ? 'border-green-300 bg-green-50 text-green-700'
                              : 'border-slate-200 bg-slate-50 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100'
                          }
                        `}
                        placeholder="..."
                        autoComplete="off"
                      />
                      {isCorrect && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                          <CheckCircle2 size={20} />
                        </div>
                      )}
                      {isWrong && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                          <AlertCircle size={20} />
                        </div>
                      )}
                    </div>
                    
                    {isWrong && (
                      <div className="text-sm font-bold text-purple-600 px-1 animate-in slide-in-from-top-1">
                        ➜ {item.conjugation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="mt-auto">
               {/* Accent Keyboard only visible when typing */}
               {status === 'active' && (
                  <div className="mb-6">
                    <AccentKeyboard onInsert={insertAccent} />
                  </div>
               )}

               {status === 'active' && (
                 <button
                   onClick={handleCheck}
                   className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all"
                 >
                   Check Answers
                 </button>
               )}

               {status === 'reviewed' && (
                 <button
                   onClick={() => loadNewChallenge()}
                   className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                 >
                   <span>Next Verb</span>
                   <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </button>
               )}
            </div>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-red-400 font-bold">
            <div className="text-center">
               <p className="mb-4">Something went wrong loading the data.</p>
               <button onClick={() => loadNewChallenge()} className="px-4 py-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200">Retry</button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-slate-400 text-sm font-semibold flex items-center gap-2">
        <span>Conjugaison Mignonne</span>
        <span>•</span>
        <span className="flex items-center gap-1"><Sparkles size={12}/> AI Powered</span>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        selectedTenses={selectedTenses}
        onToggleTense={toggleTense}
      />
    </div>
  );
};

export default App;