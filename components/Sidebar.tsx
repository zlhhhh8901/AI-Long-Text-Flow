import React from 'react';
import { PromptMode, SplitConfig, SplitMode, GlossaryTerm } from '../types';
import { 
  AlignJustify, 
  Scissors, 
  FileText, 
  Type, 
  Layers, 
  Zap, 
  ArrowDownToLine, 
  Settings2, 
  Info,
  MessageSquare,
  Book,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  splitConfig: SplitConfig;
  setSplitConfig: (config: SplitConfig) => void;
  prePrompt: string;
  setPrePrompt: (val: string) => void;
  isParallel: boolean;
  setIsParallel: (val: boolean) => void;
  concurrencyLimit: number;
  setConcurrencyLimit: (val: number) => void;
  promptMode: PromptMode;
  setPromptMode: (val: PromptMode) => void;
  isContextual: boolean;
  setIsContextual: (val: boolean) => void;
  glossaryTerms: GlossaryTerm[];
  isGlossaryEnabled: boolean;
  setIsGlossaryEnabled: (val: boolean) => void;
  onOpenGlossary: () => void;
  disabled?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  splitConfig,
  setSplitConfig,
  prePrompt,
  setPrePrompt,
  isParallel,
  setIsParallel,
  concurrencyLimit,
  setConcurrencyLimit,
  promptMode,
  setPromptMode,
  isContextual,
  setIsContextual,
  glossaryTerms,
  isGlossaryEnabled,
  setIsGlossaryEnabled,
  onOpenGlossary,
  disabled = false
}) => {
  return (
    <div className="w-80 h-full bg-surface/50 glass border-r border-stone-100 flex flex-col z-20 font-sans transition-all duration-300">
      {/* Header - More Abstract/Personal */}
      <div className="px-6 py-6 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-light to-white flex items-center justify-center shadow-soft">
          <Sparkles size={20} className="text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-base font-bold text-stone-800 tracking-tight">AI Flow</h1>
          <p className="text-[11px] font-medium text-stone-400">Harmonious Processing</p>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar px-6 py-2 space-y-8 ${disabled ? 'opacity-50 pointer-events-none grayscale-[0.3]' : ''}`}>
        
        {/* Slicer Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">
            <Scissors size={12} />
            <span>Fragmentation</span>
          </div>
          
          <div className="space-y-4">
            {/* Mode Selector - Softer Pills */}
            <div className="bg-stone-100/80 p-1.5 rounded-2xl grid grid-cols-3 gap-1">
                {[
                    { val: SplitMode.CHARACTER, icon: Type, label: 'Chars' },
                    { val: SplitMode.LINE, icon: AlignJustify, label: 'Lines' },
                    { val: SplitMode.CUSTOM, icon: Settings2, label: 'Custom' },
                ].map((opt) => (
                    <button
                        key={opt.val}
                        onClick={() => setSplitConfig({ ...splitConfig, mode: opt.val })}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-[10px] font-medium transition-all duration-300 ${
                            splitConfig.mode === opt.val 
                            ? 'bg-white text-primary shadow-soft scale-[1.02]' 
                            : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                        }`}
                    >
                        <opt.icon size={14} className="mb-1 opacity-80"/>
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Config Cards */}
            <div className="space-y-3">
              {splitConfig.mode === SplitMode.CHARACTER && (
                <div className="animate-fade-in group">
                  <label className="flex justify-between text-[11px] font-medium text-stone-500 mb-2 group-focus-within:text-primary transition-colors">
                    Chunk Size <span className="text-stone-300">chars</span>
                  </label>
                  <input
                    type="number"
                    value={splitConfig.chunkSize}
                    onChange={(e) => setSplitConfig({ ...splitConfig, chunkSize: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border-none rounded-xl text-sm text-stone-700 focus:ring-2 focus:ring-primary/10 shadow-sm transition-all outline-none font-mono"
                  />
                </div>
              )}

              {splitConfig.mode === SplitMode.LINE && (
                <div className="animate-fade-in group">
                  <label className="flex justify-between text-[11px] font-medium text-stone-500 mb-2 group-focus-within:text-primary transition-colors">
                    Lines per Chunk <span className="text-stone-300">count</span>
                  </label>
                  <input
                    type="number"
                    value={splitConfig.lineCount}
                    onChange={(e) => setSplitConfig({ ...splitConfig, lineCount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border-none rounded-xl text-sm text-stone-700 focus:ring-2 focus:ring-primary/10 shadow-sm transition-all outline-none font-mono"
                  />
                </div>
              )}

              {splitConfig.mode === SplitMode.CUSTOM && (
                <div className="animate-fade-in group">
                  <label className="flex justify-between text-[11px] font-medium text-stone-500 mb-2 group-focus-within:text-primary transition-colors">
                    Separator <span className="text-stone-300">Regex supported</span>
                  </label>
                  <input
                    type="text"
                    value={splitConfig.customSeparator}
                    onChange={(e) => setSplitConfig({ ...splitConfig, customSeparator: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-none rounded-xl text-sm text-stone-700 focus:ring-2 focus:ring-primary/10 shadow-sm transition-all outline-none font-mono placeholder:text-stone-300"
                    placeholder="###"
                  />
                </div>
              )}
              
              {/* Batch Size */}
               <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-medium text-stone-500">Batch Size</label>
                    <div className="group relative flex items-center">
                         <Info size={12} className="text-stone-300 hover:text-primary cursor-help transition-colors"/>
                         <div className="absolute right-0 bottom-full mb-1.5 w-40 p-3 bg-stone-800 text-stone-50 text-[10px] leading-relaxed rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                            Combine smaller pieces to flow together efficiently.
                         </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={splitConfig.batchSize}
                    onChange={(e) => setSplitConfig({ ...splitConfig, batchSize: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border-none rounded-xl text-sm text-stone-700 focus:ring-2 focus:ring-primary/10 shadow-sm transition-all outline-none font-mono"
                  />
              </div>
            </div>
          </div>
        </section>

        {/* Prompts Section */}
        <section className="space-y-4">
           <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2 text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                <FileText size={12} />
                <span>Guidance</span>
              </div>
              
              <label className={`flex items-center gap-2 cursor-pointer group select-none ${isParallel ? 'opacity-40 pointer-events-none' : ''}`} title={isParallel ? "Not available in Parallel mode" : "Inject guidance only in the first chunk"}>
                  <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${promptMode === 'first' ? 'text-primary' : 'text-stone-300 group-hover:text-stone-400'}`}>
                    Initial Only
                  </span>
                   <div className="relative inline-flex items-center">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={promptMode === 'first'}
                            onChange={(e) => setPromptMode(e.target.checked ? 'first' : 'every')}
                            disabled={isParallel}
                        />
                        <div className="w-7 h-3.5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1.5px] after:left-[1.5px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[11px] after:w-[11px] after:transition-all peer-checked:bg-primary"></div>
                    </div>
              </label>
          </div>

          <div className="space-y-4">
            <div>
                <div className="relative group">
                    <textarea
                        value={prePrompt}
                        onChange={(e) => setPrePrompt(e.target.value)}
                        className="w-full h-32 px-4 py-4 bg-white border-none rounded-2xl text-xs text-stone-600 focus:ring-2 focus:ring-primary/10 transition-all resize-none leading-relaxed placeholder:text-stone-300 shadow-sm"
                        placeholder="Enter a prefix prompt. By default it appears before every text block; in INITIAL ONLY mode, only before the first."
                    />
                </div>
            </div>

            {/* Glossary Config */}
            <div className="bg-white rounded-2xl p-4 space-y-3 shadow-soft">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                         <div className="relative inline-flex items-center">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={isGlossaryEnabled}
                                onChange={(e) => setIsGlossaryEnabled(e.target.checked)}
                            />
                            <div className="w-8 h-4 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                        <span className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
                            <Book size={12} className="opacity-70"/> Glossary
                        </span>
                    </label>
                    <span className="text-[10px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">{glossaryTerms.length}</span>
                </div>
                
                <button 
                    onClick={onOpenGlossary}
                    className="w-full py-2 text-[10px] font-medium text-stone-500 hover:text-primary hover:bg-primary-light/20 rounded-lg transition-colors"
                >
                    Manage Terms
                </button>
            </div>
          </div>
        </section>

        {/* Execution Section */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">
            <Layers size={12} />
            <span>Execution</span>
          </div>
          
          <div className="bg-white rounded-2xl p-4 space-y-4 shadow-soft">
             <div className="flex bg-stone-100/50 p-1 rounded-xl">
                 <button
                    onClick={() => setIsParallel(false)}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all ${!isParallel ? 'bg-white text-primary shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                 >
                    Serial
                 </button>
                 <button
                    onClick={() => {
                        setIsParallel(true);
                        setPromptMode('every');
                    }}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all ${isParallel ? 'bg-white text-primary shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                 >
                    Parallel
                 </button>
             </div>

              {isParallel && (
                 <div className="animate-fade-in px-1">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-[11px] font-medium text-stone-600">Concurrency Limit</label>
                        <span className="text-[10px] font-mono text-primary bg-primary-light/30 px-2 py-0.5 rounded-full">{concurrencyLimit}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={concurrencyLimit}
                      onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
                      className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover"
                    />
                 </div>
              )}
              
              {!isParallel && (
                <div className="animate-fade-in pt-1">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative inline-flex items-center">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={isContextual}
                                onChange={(e) => setIsContextual(e.target.checked)}
                            />
                            <div className="w-8 h-4 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                        <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5 group-hover:text-primary transition-colors">
                            Contextual Memory
                        </span>
                    </label>
                    <div className="mt-3 text-[10px] text-stone-400 leading-relaxed pl-1">
                        Maintains conversation history across chunks for better continuity.
                    </div>
                </div>
              )}
          </div>
        </section>
      </div>
      
      <div className="p-4 bg-surface/30 backdrop-blur-sm text-center shrink-0">
        <p className="text-[9px] font-medium text-stone-300 tracking-wide">Privacy Focused • Local Execution</p>
      </div>
    </div>
  );
};