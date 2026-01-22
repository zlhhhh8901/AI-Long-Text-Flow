import React, { useState } from 'react';
import { X, ClipboardCheck } from 'lucide-react';
import { useTranslation } from '../locales';

interface PasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string) => void;
}

export const PasteModal: React.FC<PasteModalProps> = ({ isOpen, onClose, onImport }) => {
  const [text, setText] = useState('');
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleImport = () => {
    if (text.trim()) {
      onImport(text);
      setText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/20 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-[95vw] sm:w-full max-w-3xl flex flex-col max-h-[85vh] animate-fade-in border border-stone-200">
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-stone-100">
          <h2 className="text-base sm:text-lg font-bold text-brand-dark flex items-center gap-2 font-sans">
            <div className="bg-brand-orange/10 p-2 rounded-lg">
                <ClipboardCheck size={18} className="text-brand-orange sm:w-5 sm:h-5"/>
            </div>
            {t('pasteModal.title')}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full p-1 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-6 bg-stone-50">
            <textarea
            className="w-full h-full p-4 sm:p-6 border border-stone-200 rounded-xl resize-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none text-sm font-mono bg-white shadow-sm min-h-[300px] text-stone-700 placeholder:text-stone-400"
            placeholder={t('pasteModal.placeholder')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            />
        </div>

        <div className="p-4 sm:p-5 border-t border-stone-100 flex justify-end gap-3 bg-white rounded-b-2xl font-sans">
          <button onClick={onClose} className="px-4 sm:px-5 py-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-50 rounded-lg font-medium text-sm transition-colors">{t('common.cancel')}</button>
          <button onClick={handleImport} className="px-5 sm:px-6 py-2.5 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-orange/90 shadow-lg shadow-brand-orange/20 transition-all active:scale-95">
            {t('pasteModal.importButton')}
          </button>
        </div>
      </div>
    </div>
  );
};