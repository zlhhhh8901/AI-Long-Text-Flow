import React from 'react';
import { SplitConfig, SplitMode, GlossaryTerm } from '../types';
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
  isParallel: boolean;
  setIsParallel: (val: boolean) => void;
  concurrencyLimit: number;
  setConcurrencyLimit: (val: number) => void;
  isContextual: boolean;
  setIsContextual: (val: boolean) => void;
  systemPrompt: string;
  setSystemPrompt: (val: string) => void;
  glossaryTerms: GlossaryTerm[];
  isGlossaryEnabled: boolean;
  setIsGlossaryEnabled: (val: boolean) => void;
  onOpenGlossary: () => void;
  disabled?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  splitConfig,
  setSplitConfig,
  isParallel,
  setIsParallel,
  concurrencyLimit,
  setConcurrencyLimit,
  isContextual,
  setIsContextual,
  systemPrompt,
  setSystemPrompt,
  glossaryTerms,
  isGlossaryEnabled,
  setIsGlossaryEnabled,
  onOpenGlossary,
  disabled = false
}) => {
  return (
    <div className="w-80 h-full bg-stone-50 border-r border-stone-200 flex flex-col z-20 font-sans transition-all duration-300">
      {/* Header */}
      <div className="px-6 py-8 flex items-center gap-4 shrink-0">
        <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center shadow-md">
          <Sparkles size={20} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-dark tracking-tight font-sans">AI Flow</h1>
          <p className="text-xs font-serif italic text-stone-500">Editorial Processing</p>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar px-6 py-2 space-y-8 ${disabled ? 'opacity-50 pointer-events-none grayscale-[0.3]' : ''}`}>
        
        {/* Slicer Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 font-sans">
            <Scissors size={12} />
            <span>Fragmentation</span>
          </div>
          
          <div className="space-y-4">
            {/* Mode Selector */}
            <div className="bg-stone-200/50 p-1 rounded-xl grid grid-cols-3 gap-1">
                {[
                    { val: SplitMode.CHARACTER, icon: Type, label: 'Chars' },
                    { val: SplitMode.LINE, icon: AlignJustify, label: 'Lines' },
                    { val: SplitMode.CUSTOM, icon: Settings2, label: 'Custom' },
                ].map((opt) => (
                    <button
                        key={opt.val}
                        onClick={() => setSplitConfig({ ...splitConfig, mode: opt.val })}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-[10px] font-semibold transition-all duration-300 ${
                            splitConfig.mode === opt.val 
                            ? 'bg-white text-brand-orange shadow-sm ring-1 ring-stone-200' 
                            : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200'
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
                  <label className="flex justify-between text-[11px] font-medium text-stone-500 mb-2 group-focus-within:text-brand-orange transition-colors">
                    Chunk Size <span className="text-stone-300">chars</span>
                  </label>
                  <input
                    type="number"
                    value={splitConfig.chunkSize}
                    onChange={(e) => setSplitConfig({ ...splitConfig, chunkSize: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange shadow-sm transition-all outline-none font-serif"
                  />
                </div>
              )}

              {splitConfig.mode === SplitMode.LINE && (
                <div className="animate-fade-in group">
                  <label className="flex justify-between text-[11px] font-medium text-stone-500 mb-2 group-focus-within:text-brand-orange transition-colors">
                    Lines per Chunk <span className="text-stone-300">count</span>
                  </label>
                  <input
                    type="number"
                    value={splitConfig.lineCount}
                    onChange={(e) => setSplitConfig({ ...splitConfig, lineCount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange shadow-sm transition-all outline-none font-serif"
                  />
                </div>
              )}

              {splitConfig.mode === SplitMode.CUSTOM && (
                <div className="animate-fade-in group">
                  <label className="flex justify-between text-[11px] font-medium text-stone-500 mb-2 group-focus-within:text-brand-orange transition-colors">
                    Separator <span className="text-stone-300">Regex supported</span>
                  </label>
                  <input
                    type="text"
                    value={splitConfig.customSeparator}
                    onChange={(e) => setSplitConfig({ ...splitConfig, customSeparator: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange shadow-sm transition-all outline-none font-serif placeholder:text-stone-300"
                    placeholder="###"
                  />
                </div>
              )}
              
              {/* Batch Size */}
               <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-medium text-stone-500">Batch Size</label>
                    <div className="group relative flex items-center">
                         <Info size={12} className="text-stone-300 hover:text-brand-orange cursor-help transition-colors"/>
                         <div className="absolute right-0 bottom-full mb-1.5 w-48 p-3 bg-brand-dark text-stone-50 text-[10px] leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 font-serif">
                            Combine smaller pieces to flow together efficiently.
                         </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={splitConfig.batchSize}
                    onChange={(e) => setSplitConfig({ ...splitConfig, batchSize: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange shadow-sm transition-all outline-none font-serif"
                  />
              </div>
            </div>
          </div>
        </section>

	        {/* Prompts Section */}
	        <section className="space-y-4">
	           <div className="flex items-center justify-between mb-2">
	               <div className="flex items-center gap-2 text-[11px] font-bold text-stone-400 uppercase tracking-widest font-sans">
	                <FileText size={12} />
	                <span>Prompt</span>
	              </div>
	          </div>

	          <div className="space-y-4">
	            <div>
	                <div className="relative group">
	                    <textarea
	                        value={systemPrompt}
	                        onChange={(e) => setSystemPrompt(e.target.value)}
	                        className="w-full h-32 px-4 py-4 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all resize-none leading-7 placeholder:text-stone-300 shadow-sm font-serif"
	                        placeholder="Enter your main prompt (applies globally)."
	                    />
	                </div>
	            </div>

            {/* Glossary Config */}
            <div className="bg-white rounded-xl p-4 space-y-3 shadow-card border border-stone-200">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                         <div className="relative inline-flex items-center">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={isGlossaryEnabled}
                                onChange={(e) => setIsGlossaryEnabled(e.target.checked)}
                            />
                            <div className="w-8 h-4 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand-orange"></div>
                        </div>
                        <span className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5 font-sans">
                            <Book size={12} className="opacity-70"/> Glossary
                        </span>
                    </label>
                    <span className="text-[10px] text-stone-500 font-serif bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">{glossaryTerms.length}</span>
                </div>
                
                <button 
                    onClick={onOpenGlossary}
                    className="w-full py-2 text-[10px] font-semibold text-stone-500 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-colors font-sans"
                >
                    Manage Terms
                </button>
            </div>
          </div>
        </section>

        {/* Execution Section */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 font-sans">
            <Layers size={12} />
            <span>Execution</span>
          </div>
          
          <div className="bg-white rounded-xl p-4 space-y-4 shadow-card border border-stone-200">
             <div className="flex bg-stone-100 p-1 rounded-lg">
                 <button
                    onClick={() => setIsParallel(false)}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${!isParallel ? 'bg-white text-brand-orange shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                 >
                    Serial
                 </button>
	                 <button
	                    onClick={() => {
	                        setIsParallel(true);
	                    }}
	                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${isParallel ? 'bg-white text-brand-orange shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
	                 >
	                    Parallel
	                 </button>
             </div>

              {isParallel && (
                 <div className="animate-fade-in px-1">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-[11px] font-medium text-stone-600">Concurrency Limit</label>
                        <span className="text-[10px] font-mono text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">{concurrencyLimit}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={concurrencyLimit}
                      onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
                      className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-orange hover:accent-brand-orange"
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
                            <div className="w-8 h-4 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand-orange"></div>
                        </div>
                        <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5 group-hover:text-brand-orange transition-colors font-sans">
                            Contextual Memory
                        </span>
                    </label>
                    <div className="mt-3 text-[10px] text-stone-500 leading-relaxed pl-1 font-serif italic">
                        Maintains conversation history across chunks for better continuity.
                    </div>
                </div>
              )}
          </div>
        </section>
      </div>
      
      <div className="p-4 bg-stone-50 border-t border-stone-200 text-center shrink-0">
        <p className="text-[9px] font-medium text-stone-400 tracking-wide font-sans">Privacy Focused • Local Execution</p>
      </div>
    </div>
  );
};
