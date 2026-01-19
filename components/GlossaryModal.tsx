import React, { useState } from 'react';
import { X, Plus, Trash2, Book, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { GlossaryTerm } from '../types';
import { mergeGlossaryTerms, normalizeGlossaryKey } from '../services/glossaryService';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  terms: GlossaryTerm[];
  onUpdateTerms: (terms: GlossaryTerm[]) => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose, terms, onUpdateTerms }) => {
  const [newTerm, setNewTerm] = useState('');
  const [newDef, setNewDef] = useState('');
  const [importText, setImportText] = useState('');
  const [mode, setMode] = useState<'list' | 'import'>('list');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newTerm.trim() && newDef.trim()) {
      const normalizedKey = normalizeGlossaryKey(newTerm);
      const existing = terms.find(t => normalizeGlossaryKey(t.term) === normalizedKey);

      if (existing) {
        onUpdateTerms(
          terms.map(t =>
            t.id === existing.id
              ? { ...t, term: newTerm.trim(), definition: newDef.trim() }
              : t
          )
        );
        setNewTerm('');
        setNewDef('');
        return;
      }

      const newEntry: GlossaryTerm = {
        id: Math.random().toString(36).substr(2, 9),
        term: newTerm.trim(),
        definition: newDef.trim()
      };
      onUpdateTerms(mergeGlossaryTerms(terms, [newEntry]));
      setNewTerm('');
      setNewDef('');
    }
  };

  const handleDelete = (id: string) => {
    onUpdateTerms(terms.filter(t => t.id !== id));
  };

  const handleBulkImport = () => {
    if (!importText.trim()) return;

    const lines = importText.split('\n');
    const parsed: GlossaryTerm[] = [];
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Supports CSV style: Term, Definition (comma or tab or colon)
        let parts = trimmedLine.split('\t');
        if (parts.length < 2) parts = trimmedLine.split(':'); // Simple Colon
        if (parts.length < 2) parts = trimmedLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Comma ignoring quotes

        if (parts.length >= 2) {
            const term = parts[0].trim().replace(/^"|"$/g, '');
            const def = parts.slice(1).join(',').trim().replace(/^"|"$/g, '');
            if (term && def) {
                parsed.push({
                    id: Math.random().toString(36).substr(2, 9),
                    term,
                    definition: def
                });
            }
        }
    });

    if (parsed.length > 0) {
        onUpdateTerms(mergeGlossaryTerms(terms, parsed));
        setImportText('');
        setMode('list');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-fade-in border border-stone-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-stone-100 bg-stone-50/50 rounded-t-2xl">
          <div>
             <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2 font-sans">
                <Book size={20} className="text-brand-orange"/>
                Glossary Management
             </h2>
             <p className="text-xs text-stone-500 mt-1 font-serif">Define terms to be automatically injected into prompts.</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full p-1 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-stone-100 flex gap-2 bg-white">
            <button 
                onClick={() => setMode('list')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-2 transition-all font-sans ${mode === 'list' ? 'bg-brand-orange/10 text-brand-orange' : 'text-stone-500 hover:bg-stone-50'}`}
            >
                <Book size={14}/> Term List ({terms.length})
            </button>
            <button 
                onClick={() => setMode('import')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-2 transition-all font-sans ${mode === 'import' ? 'bg-brand-orange/10 text-brand-orange' : 'text-stone-500 hover:bg-stone-50'}`}
            >
                <FileSpreadsheet size={14}/> Bulk Import
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-stone-50 custom-scrollbar">
            {mode === 'list' ? (
                <div className="space-y-4">
                    {/* Add New Row */}
                    <div className="flex gap-2 items-end bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 block font-sans">Term</label>
                            <input 
                                value={newTerm}
                                onChange={(e) => setNewTerm(e.target.value)}
                                placeholder="e.g. LLM"
                                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none font-serif text-stone-800"
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                        </div>
                        <div className="flex-[2]">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 block font-sans">Definition / Translation</label>
                            <input 
                                value={newDef}
                                onChange={(e) => setNewDef(e.target.value)}
                                placeholder="e.g. Large Language Model"
                                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none font-serif text-stone-800"
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                        </div>
                        <button 
                            onClick={handleAdd}
                            disabled={!newTerm.trim() || !newDef.trim()}
                            className="h-[38px] px-4 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        {terms.length === 0 ? (
                            <div className="text-center py-8 text-stone-400 text-sm font-serif italic">
                                No terms defined yet. Add one above or use Bulk Import.
                            </div>
                        ) : (
                            terms.map((t) => (
                                <div key={t.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-stone-200 hover:border-stone-300 transition-all group">
                                    <div className="flex-1 font-medium text-stone-800 text-sm font-sans">{t.term}</div>
                                    <div className="flex-[2] text-stone-600 text-sm font-serif">{t.definition}</div>
                                    <button 
                                        onClick={() => handleDelete(t.id)}
                                        className="text-stone-300 hover:text-rose-500 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col">
                    <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-lg p-3 mb-4 flex gap-2 text-xs text-brand-blue">
                        <AlertCircle size={16} className="shrink-0 mt-0.5"/>
                        <p className="font-serif">Paste your glossary here. One entry per line. Format: <b>Term, Definition</b> or <b>Term: Definition</b>. Works with copy-paste from Excel.</p>
                    </div>
                    <textarea 
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        className="flex-1 w-full p-4 border border-stone-200 rounded-xl resize-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none text-sm font-mono bg-white"
                        placeholder={`LLM, Large Language Model\nAgent, 智能体\nRAG, Retrieval Augmented Generation`}
                    />
                    <button 
                        onClick={handleBulkImport}
                        disabled={!importText.trim()}
                        className="mt-4 w-full py-2.5 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-sans"
                    >
                        <FileSpreadsheet size={16}/> Parse and Add
                    </button>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-stone-100 flex justify-end gap-3 rounded-b-2xl bg-white font-sans">
          <button onClick={onClose} className="px-6 py-2.5 bg-stone-100 text-stone-700 font-bold rounded-lg hover:bg-stone-200 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
