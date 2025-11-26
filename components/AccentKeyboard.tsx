import React from 'react';

interface AccentKeyboardProps {
  onInsert: (char: string) => void;
}

const ACCENTS = ['é', 'è', 'à', 'ù', 'ç', 'ê', 'î', 'ô', 'û', 'ë', 'ï', "'"];

export const AccentKeyboard: React.FC<AccentKeyboardProps> = ({ onInsert }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Helper Keyboard</div>
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {ACCENTS.map((char) => (
          <button
            key={char}
            onMouseDown={(e) => {
              // Prevent default to keep focus on the input field
              e.preventDefault();
              onInsert(char);
            }}
            type="button"
            className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-lg font-bold shadow-sm transition-all hover:-translate-y-1 active:translate-y-0 active:scale-95"
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
};
