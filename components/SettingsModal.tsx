import React from 'react';
import { FrenchTense, ALL_TENSES } from '../types';
import { X, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTenses: FrenchTense[];
  onToggleTense: (tense: FrenchTense) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedTenses,
  onToggleTense,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border-4 border-pink-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
            <Settings size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-700">Practice Settings</h2>
        </div>

        <p className="mb-4 text-slate-500 text-sm">Select the tenses you want to practice. You need at least one!</p>

        <div className="grid grid-cols-1 gap-3">
          {ALL_TENSES.map((tense) => {
            const isSelected = selectedTenses.includes(tense);
            return (
              <button
                key={tense}
                onClick={() => onToggleTense(tense)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-purple-400 bg-purple-50 text-purple-800'
                    : 'border-slate-100 bg-white text-slate-400 hover:border-purple-200'
                }`}
              >
                <span className="font-semibold">{tense}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                   isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-300'
                }`}>
                  {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};