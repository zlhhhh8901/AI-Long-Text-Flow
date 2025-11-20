import React from 'react';
import { PromptMode, SplitConfig, SplitMode } from '../types';
import { AlignJustify, Scissors, FileText, Type, Layers, Info, Zap, ArrowDownToLine } from 'lucide-react';

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
  disabled = false
}) => {
  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-20">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
          <div className="bg-primary text-white p-1.5 rounded-lg shadow-lg shadow-primary/30">
            <AlignJustify size={20} strokeWidth={2.5} />
          </div>
          <span className="tracking-tight">AI Flow</span>
        </h1>
        <p className="text-xs font-medium text-slate-400 mt-1 ml-1">Professional Text Splitting</p>
      </div>

      <div className={`flex-1 overflow-y-auto p-6 space-y-8 ${disabled ? 'opacity-60 pointer-events-none grayscale-[0.5]' : ''} custom-scrollbar`}>
        
        {/* Slicer Section */}
        <section>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="p-1 bg-slate-100 rounded text-slate-500"><Scissors size={12} /></span> 
            Slicer Engine
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Split Mode</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                {[
                    { val: SplitMode.CHARACTER, icon: Type, label: 'Char' },
                    { val: SplitMode.LINE, icon: AlignJustify, label: 'Line' },
                    { val: SplitMode.CUSTOM, icon: Scissors, label: 'Custom' },
                ].map((opt) => (
                    <button
                        key={opt.val}
                        onClick={() => setSplitConfig({ ...splitConfig, mode: opt.val })}
                        className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            splitConfig.mode === opt.val 
                            ? 'bg-white text-primary shadow-sm scale-[1.02]' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        <opt.icon size={14} className={`mb-1 ${splitConfig.mode === opt.val ? 'text-primary' : 'text-slate-400'}`}/>
                        {opt.label}
                    </button>
                ))}
              </div>
            </div>

            {splitConfig.mode === SplitMode.CHARACTER && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-semibold text-slate-500 mb-2">Chunk Size (chars)</label>
                <input
                  type="number"
                  value={splitConfig.chunkSize}
                  onChange={(e) => setSplitConfig({ ...splitConfig, chunkSize: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300"
                />
              </div>
            )}

            {splitConfig.mode === SplitMode.LINE && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-semibold text-slate-500 mb-2">Lines per Chunk</label>
                <input
                  type="number"
                  value={splitConfig.lineCount}
                  onChange={(e) => setSplitConfig({ ...splitConfig, lineCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            )}

            {splitConfig.mode === SplitMode.CUSTOM && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-semibold text-slate-500 mb-2">Separator (String or /Regex/)</label>
                <input
                  type="text"
                  value={splitConfig.customSeparator}
                  onChange={(e) => setSplitConfig({ ...splitConfig, customSeparator: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="###"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 flex justify-between">
                  Batch Size
                  <span className="text-[10px] font-normal bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Merge chunks</span>
              </label>
              <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={splitConfig.batchSize}
                    onChange={(e) => setSplitConfig({ ...splitConfig, batchSize: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 group cursor-help">
                    <Info size={14} className="text-slate-300 hover:text-primary transition-colors"/>
                    <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] leading-snug rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-y-2 group-hover:translate-y-0 z-50">
                        Combines multiple split items into a single API request to save tokens/requests.
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Prompts Section */}
        <section>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="p-1 bg-slate-100 rounded text-slate-500"><FileText size={12} /></span>
            Prompting
          </h3>
          <div className="space-y-5">
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Pre-prompt (Instructions)</label>
                <textarea
                value={prePrompt}
                onChange={(e) => setPrePrompt(e.target.value)}
                className="w-full h-32 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
                placeholder="e.g., 'Translate the following text to Spanish:'"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Injection Strategy</label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setPromptMode('every')}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            promptMode === 'every'
                            ? 'bg-white text-primary shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Zap size={12}/> Every Chunk
                    </button>
                    <button
                        onClick={() => setPromptMode('first')}
                        disabled={isParallel}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            promptMode === 'first'
                            ? 'bg-white text-primary shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                    >
                        <ArrowDownToLine size={12}/> First Only
                    </button>
                </div>
                {isParallel && promptMode === 'every' && (
                    <p className="text-[10px] text-slate-400 mt-2 px-1 text-center">
                        "First Only" is disabled in Parallel mode.
                    </p>
                )}
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Execution Section */}
        <section>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="p-1 bg-slate-100 rounded text-slate-500"><Layers size={12} /></span>
            Execution
          </h3>
          
          <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200 flex mb-4">
             <button
                onClick={() => setIsParallel(false)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${!isParallel ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Serial Queue
             </button>
             <button
                onClick={() => {
                    setIsParallel(true);
                    setPromptMode('every');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${isParallel ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Parallel Async
             </button>
          </div>

          {isParallel && (
             <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                <label className="block text-xs font-semibold text-indigo-800 mb-2 flex justify-between">
                    Concurrency Limit
                    <span className="bg-white px-1.5 py-0.5 rounded text-indigo-600 border border-indigo-200 shadow-sm">{concurrencyLimit}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={concurrencyLimit}
                  onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-indigo-400 mt-1">
                    <span>1x</span>
                    <span>10x</span>
                </div>
             </div>
          )}
        </section>

      </div>
      
      <div className="p-4 border-t border-slate-200 text-center bg-slate-50/50">
        <p className="text-[10px] font-medium text-slate-400">Client-side processing only.</p>
      </div>
    </div>
  );
};