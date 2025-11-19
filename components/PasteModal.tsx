import React, { useState } from 'react';
import { X, Clipboard } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clipboard size={20} className="text-primary"/>
            Manual Text Input
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
        </div>
        <textarea
          className="flex-1 p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-mono bg-slate-50 mb-4 min-h-[300px]"
          placeholder="Paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={handleImport} className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600">Import Text</button>
        </div>
      </div>
    </div>
  );
};
