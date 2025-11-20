import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PasteModal } from './components/PasteModal';
import { ResultCard } from './components/ResultCard';
import { AppConfig, ChunkItem, DEFAULT_CONFIG, DEFAULT_SPLIT_CONFIG, ProcessingStatus, PromptMode, SplitConfig } from './types';
import { splitText } from './services/splitterService';
import { processChunkWithLLM } from './services/llmService';
import { Settings, Play, Pause, Trash2, Upload, Clipboard, Download, Activity } from 'lucide-react';

function App() {
  // --- State ---
  const [sourceText, setSourceText] = useState<string>('');
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  
  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('ai-flow-config');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with default to ensure new fields (like 'provider') are present
        return { ...DEFAULT_CONFIG, ...parsed };
    }
    return DEFAULT_CONFIG;
  });
  const [splitConfig, setSplitConfig] = useState<SplitConfig>(DEFAULT_SPLIT_CONFIG);
  const [prePrompt, setPrePrompt] = useState('');
  const [isParallel, setIsParallel] = useState(false);
  const [concurrencyLimit, setConcurrencyLimit] = useState(3);
  const [promptMode, setPromptMode] = useState<PromptMode>('every');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeRequestCount, setActiveRequestCount] = useState(0); // Visual counter
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  
  // Refs for Queue Management to avoid closure staleness
  const activeRequestsRef = useRef(0);
  const isProcessingRef = useRef(false);
  
  // Sync processing state to ref
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Re-split when source text or config changes
  useEffect(() => {
    if (sourceText) {
        // Note: This resets the chunks. If users had results, they are lost when config changes.
        const newChunks = splitText(sourceText, splitConfig);
        setChunks(newChunks);
    } else {
        setChunks([]);
    }
  }, [sourceText, splitConfig]);

  // Persist Config
  const saveConfig = (newConfig: AppConfig) => {
    setAppConfig(newConfig);
    localStorage.setItem('ai-flow-config', JSON.stringify(newConfig));
  };

  // --- Handlers ---

  const handlePaste = async () => {
    try {
      // Attempt to read from clipboard
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceText(text);
      } else {
         // Empty clipboard or failed
         setIsPasteModalOpen(true);
      }
    } catch (err) {
      // Permission denied or not supported
      console.warn("Clipboard API failed, opening manual input", err);
      setIsPasteModalOpen(true);
    }
  };

  const handleManualImport = (text: string) => {
      setSourceText(text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        setSourceText(text);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const handleClear = () => {
    if (isProcessing) setIsProcessing(false);
    setSourceText('');
    setChunks([]);
    activeRequestsRef.current = 0;
    setActiveRequestCount(0);
  };

  const handleExport = () => {
    const content = chunks
      .filter(c => c.result)
      .map(c => c.result)
      .join('\n\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-flow-export.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Processing Engine ---

  const updateChunkStatus = useCallback((id: string, status: ProcessingStatus, result?: string, errorMsg?: string) => {
    setChunks(prev => prev.map(c => 
      c.id === id ? { ...c, status, result, errorMsg } : c
    ));
  }, []);

  const processQueue = useCallback(async () => {
    if (!isProcessingRef.current) return;

    setChunks(currentChunks => {
        const processingCount = activeRequestsRef.current;
        const limit = isParallel ? concurrencyLimit : 1;
        
        if (processingCount >= limit) return currentChunks; // Maxed out

        let candidates = [...currentChunks];
        let toTrigger: ChunkItem[] = [];

        if (isParallel) {
            // Find first N idle items
            const availableSlots = limit - processingCount;
            toTrigger = candidates
                .filter(c => c.status === ProcessingStatus.IDLE || c.status === ProcessingStatus.WAITING)
                .slice(0, availableSlots);
        } else {
            // Serial: Find the FIRST incomplete item. If it's idle, trigger it.
            const firstIncomplete = candidates.find(c => c.status !== ProcessingStatus.SUCCESS && c.status !== ProcessingStatus.ERROR);
            if (firstIncomplete && (firstIncomplete.status === ProcessingStatus.IDLE || firstIncomplete.status === ProcessingStatus.WAITING)) {
                toTrigger = [firstIncomplete];
            }
        }

        if (toTrigger.length === 0) {
             // Check if all done
             const allDone = candidates.every(c => c.status === ProcessingStatus.SUCCESS || c.status === ProcessingStatus.ERROR);
             if (allDone && processingCount === 0) {
                 setTimeout(() => setIsProcessing(false), 0); 
             }
             return currentChunks;
        }

        // Mark as processing in state immediately
        const idsToTrigger = new Set(toTrigger.map(c => c.id));
        const newChunks = candidates.map(c => 
            idsToTrigger.has(c.id) ? { ...c, status: ProcessingStatus.PROCESSING } : c
        );
        
        // Fire side effects (Requests)
        toTrigger.forEach(chunk => {
            activeRequestsRef.current++;
            setActiveRequestCount(activeRequestsRef.current);

            // Determine specific prompt for this chunk based on Prompt Mode
            let chunkPrePrompt = prePrompt;
            if (promptMode === 'first' && !isParallel) {
                // If 'first' mode is active and we are in serial, only send prompt for the first chunk
                // Note: chunk.index is 1-based from splitterService
                if (chunk.index !== 1) {
                    chunkPrePrompt = '';
                }
            }

            processChunkWithLLM(chunk.rawContent, appConfig, chunkPrePrompt)
                .then(result => {
                    updateChunkStatus(chunk.id, ProcessingStatus.SUCCESS, result);
                })
                .catch(err => {
                    updateChunkStatus(chunk.id, ProcessingStatus.ERROR, undefined, err.message);
                })
                .finally(() => {
                    activeRequestsRef.current--;
                    setActiveRequestCount(activeRequestsRef.current);
                    processQueue(); 
                });
        });

        return newChunks;
    });
  }, [appConfig, prePrompt, isParallel, concurrencyLimit, updateChunkStatus, promptMode]);


  // Watcher to kickstart or keep queue moving when state changes
  useEffect(() => {
    if (isProcessing) {
        processQueue();
    }
  }, [isProcessing, chunks, processQueue]);

  const handleRetry = (id: string) => {
    updateChunkStatus(id, ProcessingStatus.IDLE, undefined, undefined);
    if (!isProcessing) {
        setIsProcessing(true);
    }
  };

  // --- UI ---
  
  const completedCount = chunks.filter(c => c.status === ProcessingStatus.SUCCESS).length;
  const totalCount = chunks.length;
  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  return (
    <div className="flex h-screen w-screen bg-background">
      <Sidebar 
        splitConfig={splitConfig}
        setSplitConfig={setSplitConfig}
        prePrompt={prePrompt}
        setPrePrompt={setPrePrompt}
        isParallel={isParallel}
        setIsParallel={setIsParallel}
        concurrencyLimit={concurrencyLimit}
        setConcurrencyLimit={setConcurrencyLimit}
        promptMode={promptMode}
        setPromptMode={setPromptMode}
        disabled={isProcessing}
      />

      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Toolbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button 
                onClick={handlePaste} 
                disabled={isProcessing}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clipboard size={16} /> Paste
            </button>
            <label className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={16} /> Import
              <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" disabled={isProcessing}/>
            </label>
            <button 
                onClick={handleClear} 
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>

          <div className="flex items-center gap-4">
             {chunks.length > 0 && (
                 <div className="flex items-center gap-4 mr-2">
                    {/* Status Indicator */}
                    {isProcessing && (
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                            <Activity size={14} className="text-blue-500 animate-pulse"/>
                            <span className="text-xs font-bold text-blue-700">
                                {isParallel ? `Parallel (${activeRequestCount} active)` : 'Serial Mode'}
                            </span>
                        </div>
                    )}

                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-700">{completedCount} / {totalCount}</span>
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    {completedCount > 0 && (
                        <button onClick={handleExport} className="p-2 text-slate-500 hover:text-primary transition-colors" title="Export Markdown">
                            <Download size={20} />
                        </button>
                    )}
                 </div>
             )}

             <button 
                onClick={() => setIsProcessing(!isProcessing)}
                disabled={chunks.length === 0}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold shadow-lg transition-all ${
                    isProcessing 
                    ? 'bg-amber-400 text-amber-950 hover:bg-amber-500' 
                    : 'bg-primary text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
             >
                {isProcessing ? <><Pause size={18} fill="currentColor"/> Pause</> : <><Play size={18} fill="currentColor"/> Start</>}
             </button>

             <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-slate-700 transition-colors">
                <Settings size={24} />
             </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 scroll-smooth relative">
            {chunks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Clipboard size={32} className="text-slate-300"/>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-600">Ready to process</h2>
                    <p className="max-w-sm text-center mt-2 text-sm">
                        Paste text or upload a file to split it into chunks. Configure your API settings before starting.
                    </p>
                    {!appConfig.apiKey && (
                         <button onClick={() => setIsSettingsOpen(true)} className="mt-6 text-primary text-sm font-bold hover:underline">
                            Configure API Key &rarr;
                         </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl mx-auto pb-20">
                    {chunks.map(chunk => {
                        // Calculate effective prompt for preview purposes
                        const effectivePrePrompt = (promptMode === 'first' && !isParallel && chunk.index > 1) 
                            ? '' 
                            : prePrompt;
                        
                        return (
                            <ResultCard 
                                key={chunk.id} 
                                chunk={chunk} 
                                onRetry={handleRetry} 
                                systemPrompt={appConfig.systemPrompt}
                                prePrompt={effectivePrePrompt}
                                model={appConfig.model}
                            />
                        );
                    })}
                </div>
            )}
        </div>
      </main>

      <ApiKeyModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={appConfig} 
        onSave={saveConfig} 
      />
      
      <PasteModal 
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onImport={handleManualImport}
      />
    </div>
  );
}

export default App;