import React from 'react';
import { SplitConfig, SplitMode } from '../types';
import { AlignJustify, Scissors, FileText, Type, Layers, Info } from 'lucide-react';

interface SidebarProps {
  splitConfig: SplitConfig;
  setSplitConfig: (config: SplitConfig) => void;
  prePrompt: string;
  setPrePrompt: (val: string) => void;
  isParallel: boolean;
  setIsParallel: (val: boolean) => void;
  concurrencyLimit: number;
  setConcurrencyLimit: (val: number) => void;
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
  disabled = false
}) => {
  return (
    <div className="w-80 bg-white border-r border-slate-200 h-full flex flex-col overflow-y-auto">
      <div className="p-5 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-primary text-white p-1.5 rounded-md">
            <AlignJustify size={20} />
          </span>
          AI Flow
        </h1>
        <p className="text-xs text-slate-500 mt-1">Long-Text Pipeline v1.0</p>
      </div>

      <div className={`flex-1 p-5 space-y-8 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Slicer Section */}
        <section>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Scissors size={16} /> Slicer Engine
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Split Mode</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                {[
                    { val: SplitMode.CHARACTER, icon: Type, label: 'Char' },
                    { val: SplitMode.LINE, icon: AlignJustify, label: 'Line' },
                    { val: SplitMode.CUSTOM, icon: Scissors, label: 'Custom' },
                ].map((opt) => (
                    <button
                        key={opt.val}
                        onClick={() => setSplitConfig({ ...splitConfig, mode: opt.val })}
                        className={`flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-all ${
                            splitConfig.mode === opt.val 
                            ? 'bg-white text-primary shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <opt.icon size={14} className="mb-1"/>
                        {opt.label}
                    </button>
                ))}
              </div>
            </div>

            {splitConfig.mode === SplitMode.CHARACTER && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chunk Size (chars)</label>
                <input
                  type="number"
                  value={splitConfig.chunkSize}
                  onChange={(e) => setSplitConfig({ ...splitConfig, chunkSize: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            )}

            {splitConfig.mode === SplitMode.LINE && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Lines per Chunk</label>
                <input
                  type="number"
                  value={splitConfig.lineCount}
                  onChange={(e) => setSplitConfig({ ...splitConfig, lineCount: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            )}

            {splitConfig.mode === SplitMode.CUSTOM && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Separator (String or /Regex/)</label>
                <input
                  type="text"
                  value={splitConfig.customSeparator}
                  onChange={(e) => setSplitConfig({ ...splitConfig, customSeparator: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="###"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Batch Size (Merge Chunks)</label>
              <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={splitConfig.batchSize}
                    onChange={(e) => setSplitConfig({ ...splitConfig, batchSize: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <div className="group relative cursor-help">
                    <Info size={16} className="text-slate-400"/>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                        Combines multiple split items into a single API request.
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Prompts Section */}
        <section>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText size={16} /> Prompting
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pre-prompt (User Message Header)</label>
            <textarea
              value={prePrompt}
              onChange={(e) => setPrePrompt(e.target.value)}
              className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              placeholder="e.g., 'Translate the following text to Spanish:'"
            />
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Execution Section */}
        <section>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers size={16} /> Execution
          </h3>
          
          <div className="bg-slate-50 rounded-lg p-1 flex mb-4 border border-slate-200">
             <button
                onClick={() => setIsParallel(false)}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${!isParallel ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
             >
                Serial
             </button>
             <button
                onClick={() => setIsParallel(true)}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${isParallel ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
             >
                Parallel
             </button>
          </div>

          {isParallel && (
             <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Max Concurrency: {concurrencyLimit}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={concurrencyLimit}
                  onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
                  className="w-full accent-primary"
                />
             </div>
          )}
        </section>

      </div>
      
      <div className="p-4 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400">All processing happens client-side.</p>
      </div>
    </div>
  );
};
