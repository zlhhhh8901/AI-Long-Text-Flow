import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PasteModal } from './components/PasteModal';
import { GlossaryModal } from './components/GlossaryModal';
import { ResultCard } from './components/ResultCard';
import { AppConfig, ChunkItem, DEFAULT_CONFIG, DEFAULT_SPLIT_CONFIG, ProcessingStatus, PromptMode, SplitConfig, GlossaryTerm } from './types';
import { splitText } from './services/splitterService';
import { processChunkWithLLM, initializeSession, LLMSession } from './services/llmService';
import { constructUserMessageWithGlossary } from './services/glossaryService';
import { Settings, Play, Pause, Trash2, Upload, Clipboard, Download, Sparkles, FileText, MessageSquare } from 'lucide-react';

function App() {
  // --- State ---
  const [sourceText, setSourceText] = useState<string>('');
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  
  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('ai-flow-config');
    if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_CONFIG, ...parsed };
    }
    return DEFAULT_CONFIG;
  });
  const [splitConfig, setSplitConfig] = useState<SplitConfig>(DEFAULT_SPLIT_CONFIG);
  const [prePrompt, setPrePrompt] = useState('');
  const [isParallel, setIsParallel] = useState(false);
  const [isContextual, setIsContextual] = useState(false);
  const [concurrencyLimit, setConcurrencyLimit] = useState(3);
  const [promptMode, setPromptMode] = useState<PromptMode>('every');
  
  // Glossary State
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>(() => {
    const saved = localStorage.getItem('ai-flow-glossary');
    return saved ? JSON.parse(saved) : [];
  });
  const [isGlossaryEnabled, setIsGlossaryEnabled] = useState(false);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeRequestCount, setActiveRequestCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for Queue Management
  const activeRequestsRef = useRef(0);
  const isProcessingRef = useRef(false);
  const sessionRef = useRef<LLMSession | undefined>(undefined);
  
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Re-split when source text or config changes
  useEffect(() => {
    if (sourceText) {
        const newChunks = splitText(sourceText, splitConfig);
        setChunks(newChunks);
    } else {
        setChunks([]);
    }
  }, [sourceText, splitConfig]);

  // Clear session when critical config changes or source changes
  useEffect(() => {
    sessionRef.current = undefined;
  }, [appConfig.provider, appConfig.apiKey, appConfig.model, appConfig.systemPrompt, isContextual, sourceText]);

  // Persist Glossary
  useEffect(() => {
    localStorage.setItem('ai-flow-glossary', JSON.stringify(glossaryTerms));
  }, [glossaryTerms]);

  const saveConfig = (newConfig: AppConfig) => {
    setAppConfig(newConfig);
    localStorage.setItem('ai-flow-config', JSON.stringify(newConfig));
  };

  // --- Handlers ---

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceText(text);
      } else {
         setIsPasteModalOpen(true);
      }
    } catch (err) {
      setIsPasteModalOpen(true);
    }
  };

  const handleManualImport = (text: string) => {
      setSourceText(text);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        setSourceText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
      processFile(file);
    }
  };

  const handleClear = () => {
    if (isProcessing) setIsProcessing(false);
    setSourceText('');
    setChunks([]);
    activeRequestsRef.current = 0;
    setActiveRequestCount(0);
    sessionRef.current = undefined;
  };

  const handleExport = (includeInput: boolean) => {
    const content = chunks
      .filter(c => c.result)
      .map(c => {
        if (includeInput) {
            return `### Source (${c.index})\n\n${c.rawContent}\n\n### Response (${c.index})\n\n${c.result}`;
        }
        return c.result;
      })
      .join('\n\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = includeInput ? 'ai-flow-export-full.md' : 'ai-flow-export-results.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
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
        
        if (processingCount >= limit) return currentChunks;

        // Initialize Session if Contextual Mode and not initialized
        if (!isParallel && isContextual && !sessionRef.current) {
            try {
                sessionRef.current = initializeSession(appConfig);
            } catch (e: any) {
                console.error("Failed to init session", e);
                setIsProcessing(false);
                // We can't easily update state here for error msg on a specific chunk without iterating
                // But the next iteration won't run because isProcessing becomes false
                return currentChunks;
            }
        }

        let candidates = [...currentChunks];
        let toTrigger: ChunkItem[] = [];

        if (isParallel) {
            const availableSlots = limit - processingCount;
            toTrigger = candidates
                .filter(c => c.status === ProcessingStatus.IDLE || c.status === ProcessingStatus.WAITING)
                .slice(0, availableSlots);
        } else {
            // Serial: Find first incomplete
            const firstIncomplete = candidates.find(c => c.status !== ProcessingStatus.SUCCESS && c.status !== ProcessingStatus.ERROR);
            if (firstIncomplete && (firstIncomplete.status === ProcessingStatus.IDLE || firstIncomplete.status === ProcessingStatus.WAITING)) {
                toTrigger = [firstIncomplete];
            }
        }

        if (toTrigger.length === 0) {
             const allDone = candidates.every(c => c.status === ProcessingStatus.SUCCESS || c.status === ProcessingStatus.ERROR);
             if (allDone && processingCount === 0) {
                 setTimeout(() => setIsProcessing(false), 0); 
             }
             return currentChunks;
        }

        const idsToTrigger = new Set(toTrigger.map(c => c.id));
        const newChunks = candidates.map(c => 
            idsToTrigger.has(c.id) ? { ...c, status: ProcessingStatus.PROCESSING } : c
        );
        
        toTrigger.forEach(chunk => {
            activeRequestsRef.current++;
            setActiveRequestCount(activeRequestsRef.current);

            let chunkPrePrompt = prePrompt;
            if (promptMode === 'first') {
                // Only first chunk gets the prompt
                if (chunk.index !== 1) {
                    chunkPrePrompt = '';
                }
            }

            // Construct Full Message with Glossary (Just-in-Time Injection)
            // This now includes Pre-Prompt + Glossary + Original Content
            const finalUserMessage = constructUserMessageWithGlossary(
                chunk.rawContent,
                chunkPrePrompt,
                glossaryTerms,
                isGlossaryEnabled
            );

            // Determine valid session to pass
            const activeSession = (!isParallel && isContextual) ? sessionRef.current : undefined;

            // CRITICAL CHANGE: We pass an empty string '' as the 3rd argument (prePrompt)
            // because we have already baked the prePrompt (instructions) into the finalUserMessage.
            // This moves the instructions from System Prompt (in the old logic) to User Prompt (new logic).
            // AppConfig.systemPrompt (global settings) is still handled inside processChunkWithLLM as System role.
            processChunkWithLLM(finalUserMessage, appConfig, '', activeSession)
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
  }, [appConfig, prePrompt, isParallel, concurrencyLimit, updateChunkStatus, promptMode, isContextual, glossaryTerms, isGlossaryEnabled]);

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
    <div 
      className="flex h-screen w-screen bg-background relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-4 border-primary border-dashed m-4 rounded-2xl flex items-center justify-center pointer-events-none animate-fade-in">
           <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center animate-slide-up">
             <Upload size={48} className="text-primary mb-4"/>
             <h3 className="text-xl font-bold text-slate-800">Drop file to import</h3>
             <p className="text-slate-500">Supports .txt and .md files</p>
           </div>
        </div>
      )}

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
        isContextual={isContextual}
        setIsContextual={setIsContextual}
        disabled={isProcessing}
        // Glossary Props
        glossaryTerms={glossaryTerms}
        isGlossaryEnabled={isGlossaryEnabled}
        setIsGlossaryEnabled={setIsGlossaryEnabled}
        onOpenGlossary={() => setIsGlossaryModalOpen(true)}
      />

      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Toolbar */}
        <header className="h-18 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 py-3 shrink-0 z-10 shadow-sm gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <button 
                onClick={handlePaste} 
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clipboard size={16} /> <span className="hidden sm:inline">Paste</span>
            </button>
            <label className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-all shadow-sm cursor-pointer ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={16} /> <span className="hidden sm:inline">Import</span>
              <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" disabled={isProcessing}/>
            </label>
            {chunks.length > 0 && (
                <button 
                    onClick={handleClear} 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg transition-all ml-2"
                >
                <Trash2 size={16} /> <span className="hidden sm:inline">Clear</span>
                </button>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
             {chunks.length > 0 && (
                 <div className="flex items-center gap-6 mr-2">
                    <div className="hidden md:flex flex-col min-w-[140px]">
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="font-semibold text-slate-500">{isParallel ? 'Parallel' : (isContextual ? 'Serial Context' : 'Serial')}</span>
                            <span className="font-bold text-slate-800">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.4)]" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    
                    {completedCount > 0 && (
                        <div className="relative">
                            <button 
                                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} 
                                className={`p-2 rounded-lg transition-colors ${isExportMenuOpen ? 'bg-indigo-100 text-primary' : 'text-slate-500 hover:text-primary bg-slate-50 hover:bg-indigo-50'}`} 
                                title="Export Options"
                            >
                                <Download size={20} />
                            </button>
                            
                            {isExportMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsExportMenuOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 animate-fade-in overflow-hidden">
                                        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                                            Export Format
                                        </div>
                                        <button 
                                            onClick={() => handleExport(false)}
                                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-2"
                                        >
                                            <FileText size={14} /> Results Only
                                        </button>
                                        <div className="h-px bg-slate-100"></div>
                                        <button 
                                            onClick={() => handleExport(true)}
                                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-2"
                                        >
                                            <MessageSquare size={14} /> Source & Results
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                 </div>
             )}

             <div className="h-8 w-px bg-slate-200 mx-1"></div>

             <button 
                onClick={() => setIsProcessing(!isProcessing)}
                disabled={chunks.length === 0}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
                    isProcessing 
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200 shadow-amber-100' 
                    : 'bg-primary text-white hover:bg-primary-hover shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0'
                }`}
             >
                {isProcessing ? <><Pause size={18} fill="currentColor"/> <span className="hidden sm:inline">Pause</span></> : <><Play size={18} fill="currentColor"/> <span className="hidden sm:inline">Start Process</span></>}
             </button>

             <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings size={22} />
             </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 scroll-smooth relative">
            {chunks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-fade-in">
                    <div className="w-full max-w-md border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-white/50 hover:bg-white hover:border-primary/50 transition-all group cursor-pointer" onClick={() => setIsPasteModalOpen(true)}>
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Sparkles size={36} className="text-primary"/>
                        </div>
                        <h2 className="text-xl font-bold text-slate-700 mb-2">Start your workflow</h2>
                        <p className="text-center text-slate-500 text-sm mb-6 leading-relaxed">
                            Drag & drop a text file here,<br/> or paste content to begin intelligent splitting.
                        </p>
                        <div className="flex gap-3">
                             <button onClick={(e) => {e.stopPropagation(); handlePaste()}} className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition-all">
                                Paste Text
                             </button>
                             <label onClick={(e) => e.stopPropagation()} className="px-4 py-2 bg-primary text-white shadow-lg shadow-primary/20 rounded-lg text-sm font-semibold hover:bg-primary-hover transition-all cursor-pointer flex items-center gap-2">
                                <Upload size={14}/> Upload File
                                <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden"/>
                             </label>
                        </div>
                    </div>
                    {!appConfig.apiKey && (
                         <div className="mt-8 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full text-sm font-medium border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setIsSettingsOpen(true)}>
                            <Settings size={14}/>
                            API Key not configured
                         </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3 max-w-5xl mx-auto pb-20 animate-fade-in">
                    {chunks.map(chunk => {
                        const effectivePrePrompt = (promptMode === 'first' && chunk.index > 1) 
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
                                isContextual={!isParallel && isContextual}
                                // Glossary Props
                                glossaryTerms={glossaryTerms}
                                isGlossaryEnabled={isGlossaryEnabled}
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

      <GlossaryModal
        isOpen={isGlossaryModalOpen}
        onClose={() => setIsGlossaryModalOpen(false)}
        terms={glossaryTerms}
        onUpdateTerms={setGlossaryTerms}
      />
    </div>
  );
}

export default App;