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
  Book
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
    <div className="w-72 h-full bg-white border-r border-slate-200 flex flex-col shadow-xl shadow-slate-200/50 z-20 font-sans">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30 backdrop-blur-sm flex items-center gap-3 shrink-0">
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-2 rounded-lg shadow-md shadow-primary/20">
          <AlignJustify size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-none">AI Flow</h1>
          <p className="text-[10px] font-medium text-slate-400 mt-1">Text Processing Workflow</p>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 ${disabled ? 'opacity-60 pointer-events-none grayscale-[0.5]' : ''}`}>
        
        {/* Slicer Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            <Scissors size={14} className="text-primary" />
            <span>Split Strategy</span>
          </div>
          
          <div className="space-y-3">
            {/* Mode Selector */}
            <div className="bg-slate-100 p-1 rounded-lg grid grid-cols-3 gap-1">
                {[
                    { val: SplitMode.CHARACTER, icon: Type, label: 'Chars' },
                    { val: SplitMode.LINE, icon: AlignJustify, label: 'Lines' },
                    { val: SplitMode.CUSTOM, icon: Settings2, label: 'Custom' },
                ].map((opt) => (
                    <button
                        key={opt.val}
                        onClick={() => setSplitConfig({ ...splitConfig, mode: opt.val })}
                        className={`flex flex-col items-center justify-center py-2 rounded-md text-[10px] font-semibold transition-all duration-200 ${
                            splitConfig.mode === opt.val 
                            ? 'bg-white text-primary shadow-sm ring-1 ring-black/5 scale-[1.02]' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        <opt.icon size={14} className="mb-1"/>
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Dynamic Inputs based on Mode */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-3 shadow-sm">
              {splitConfig.mode === SplitMode.CHARACTER && (
                <div className="animate-fade-in">
                  <label className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                    Chunk Size <span className="text-slate-400 font-normal">chars</span>
                  </label>
                  <input
                    type="number"
                    value={splitConfig.chunkSize}
                    onChange={(e) => setSplitConfig({ ...splitConfig, chunkSize: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono shadow-sm"
                  />
                </div>
              )}

              {splitConfig.mode === SplitMode.LINE && (
                <div className="animate-fade-in">
                  <label className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                    Lines per Chunk <span className="text-slate-400 font-normal">count</span>
                  </label>
                  <input
                    type="number"
                    value={splitConfig.lineCount}
                    onChange={(e) => setSplitConfig({ ...splitConfig, lineCount: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono shadow-sm"
                  />
                </div>
              )}

              {splitConfig.mode === SplitMode.CUSTOM && (
                <div className="animate-fade-in">
                  <label className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                    Separator <span className="text-slate-400 font-normal">Str or /Regex/</span>
                  </label>
                  <input
                    type="text"
                    value={splitConfig.customSeparator}
                    onChange={(e) => setSplitConfig({ ...splitConfig, customSeparator: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono shadow-sm"
                    placeholder="###"
                  />
                </div>
              )}
              
              {/* Batch Size */}
               <div className="pt-2 border-t border-slate-200/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-500">Batch Size</label>
                    <div className="group relative flex items-center">
                         <Info size={12} className="text-slate-300 hover:text-primary cursor-help transition-colors"/>
                         <div className="absolute right-0 bottom-full mb-1.5 w-40 p-2.5 bg-slate-800 text-white text-[10px] leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                            Merges multiple chunks into a single API request to optimize context window usage.
                         </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <input
                        type="number"
                        min="1"
                        value={splitConfig.batchSize}
                        onChange={(e) => setSplitConfig({ ...splitConfig, batchSize: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono shadow-sm"
                      />
                  </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prompts Section */}
        <section className="space-y-3">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            <FileText size={14} className="text-primary" />
            <span>Instructions</span>
          </div>

          <div className="space-y-3">
            <div>
                <div className="relative group">
                    <textarea
                        value={prePrompt}
                        onChange={(e) => setPrePrompt(e.target.value)}
                        className="w-full h-28 px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed placeholder:text-slate-400 shadow-sm group-hover:border-slate-300"
                        placeholder="Add instructions for the model (Pre-prompt)..."
                    />
                    <div className="absolute bottom-2 right-2 pointer-events-none opacity-60">
                         <FileText size={12} className="text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Glossary Config */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                         <div className="relative inline-flex items-center">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={isGlossaryEnabled}
                                onChange={(e) => setIsGlossaryEnabled(e.target.checked)}
                            />
                            <div className="w-7 h-3.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                            <Book size={12}/> Glossary
                        </span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">{glossaryTerms.length} terms</span>
                </div>
                
                <button 
                    onClick={onOpenGlossary}
                    className="w-full py-1.5 text-[10px] font-semibold bg-white border border-slate-200 hover:border-primary hover:text-primary rounded-lg transition-colors shadow-sm"
                >
                    Manage Terms
                </button>
            </div>

            <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Injection Mode</label>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setPromptMode('every')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                            promptMode === 'every'
                            ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Zap size={12}/> Every
                    </button>
                    <button
                        onClick={() => setPromptMode('first')}
                        disabled={isParallel}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                            promptMode === 'first'
                            ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' 
                            : 'text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                    >
                        <ArrowDownToLine size={12}/> First Only
                    </button>
                </div>
                {isParallel && promptMode === 'every' && (
                    <p className="text-[9px] text-slate-400 mt-1.5 px-1 text-center">
                        "First Only" disabled in Parallel.
                    </p>
                )}
            </div>
          </div>
        </section>

        {/* Execution Section */}
        <section className="space-y-3">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            <Layers size={14} className="text-primary" />
            <span>Processing</span>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-4 shadow-sm">
             <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                 <button
                    onClick={() => setIsParallel(false)}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${!isParallel ? 'bg-indigo-50 text-primary ring-1 ring-primary/10' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    Serial
                 </button>
                 <button
                    onClick={() => {
                        setIsParallel(true);
                        setPromptMode('every');
                    }}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${isParallel ? 'bg-indigo-50 text-primary ring-1 ring-primary/10' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    Parallel
                 </button>
             </div>

              {isParallel && (
                 <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[11px] font-semibold text-slate-600">Concurrency</label>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 shadow-sm">{concurrencyLimit}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={concurrencyLimit}
                      onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1.5">
                        <span>Conservative</span>
                        <span>Aggressive</span>
                    </div>
                 </div>
              )}
              
              {!isParallel && (
                <>
                    <div className="animate-fade-in bg-white rounded-lg border border-slate-200 p-2.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className="relative inline-flex items-center">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={isContextual}
                                    onChange={(e) => setIsContextual(e.target.checked)}
                                />
                                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1.5">
                                Continuous Context
                            </span>
                        </label>
                        <div className="mt-2 text-[9px] text-slate-400 leading-relaxed flex gap-1.5 items-start">
                            <MessageSquare size={10} className="mt-0.5 shrink-0" />
                            Chunks are sent in a single conversation history.
                        </div>
                    </div>

                    <div className="flex gap-2 items-start px-1">
                        <Info size={12} className="text-indigo-400 mt-0.5 shrink-0"/>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            Processes one chunk at a time. 
                            {isContextual ? ' Context is maintained across all chunks.' : ' Each chunk is an independent request.'}
                        </p>
                    </div>
                </>
              )}
          </div>
        </section>
      </div>
      
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center shrink-0">
        <p className="text-[9px] font-medium text-slate-400">Local Processing • No Server Data</p>
      </div>
    </div>
  );
};