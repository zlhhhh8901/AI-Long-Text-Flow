import React, { useState } from 'react';
import { X, ClipboardCheck } from 'lucide-react';

interface PasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string) => void;
}

export const PasteModal: React.FC<PasteModalProps> = ({ isOpen, onClose, onImport }) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleImport = () => {
    if (text.trim()) {
      onImport(text);
      setText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] animate-fade-in">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="bg-indigo-50 p-2 rounded-lg">
                <ClipboardCheck size={20} className="text-primary"/>
            </div>
            Manual Text Import
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full p-1 transition-all">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 p-6 bg-slate-50/50">
            <textarea
            className="w-full h-full p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-mono bg-white shadow-sm min-h-[300px] text-slate-700 placeholder:text-slate-400"
            placeholder="Paste your content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            />
        </div>

        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">Cancel</button>
          <button onClick={handleImport} className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95">
            Import Content
          </button>
        </div>
      </div>
    </div>
  );
};