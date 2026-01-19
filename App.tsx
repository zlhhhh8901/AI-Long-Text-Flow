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
import { Settings, Play, Pause, Trash2, Upload, Clipboard, Download, Sparkles, FileText, MessageSquare, Feather } from 'lucide-react';

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
                if (chunk.index !== 1) {
                    chunkPrePrompt = '';
                }
            }

            const finalUserMessage = constructUserMessageWithGlossary(
                chunk.rawContent,
                chunkPrePrompt,
                glossaryTerms,
                isGlossaryEnabled
            );

            const activeSession = (!isParallel && isContextual) ? sessionRef.current : undefined;

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
      className="flex h-screen w-screen bg-brand-light overflow-hidden relative selection:bg-brand-orange selection:text-white"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Background - Clean & Minimal (Removed Globs for Editorial Look) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
         {/* Simple subtle noise or gradient could go here, but solid is better for this brand */}
      </div>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md border-4 border-brand-orange/20 border-dashed m-6 rounded-3xl flex items-center justify-center pointer-events-none animate-fade-in">
           <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center animate-slide-up border border-stone-200">
             <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mb-4 text-brand-orange">
                <Upload size={32} />
             </div>
             <h3 className="text-xl font-bold text-brand-dark tracking-tight font-sans">Release to Import</h3>
             <p className="text-stone-500 font-serif italic">Text and Markdown files accepted</p>
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

      <main className="flex-1 flex flex-col h-full min-w-0 z-10 relative">
        {/* Floating Toolbar */}
        <div className="px-6 py-4 shrink-0 overflow-x-auto custom-scrollbar">
            <header className="bg-white border border-stone-200 rounded-xl flex items-center justify-between px-5 py-3 shadow-sm gap-4 transition-all hover:shadow-card min-w-max">
            <div className="flex items-center gap-3 shrink-0">
                <button 
                    onClick={handlePaste} 
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 hover:text-brand-orange hover:border-brand-orange/30 rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                >
                <Clipboard size={14} /> <span className="hidden lg:inline">Paste</span>
                </button>
                <label className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 hover:text-brand-orange hover:border-brand-orange/30 rounded-lg transition-all shadow-sm cursor-pointer font-sans ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload size={14} /> <span className="hidden lg:inline">Import</span>
                <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" disabled={isProcessing}/>
                </label>
                {chunks.length > 0 && (
                    <button 
                        onClick={handleClear} 
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-lg transition-all ml-2 font-sans"
                    >
                    <Trash2 size={14} /> <span className="hidden lg:inline">Clear</span>
                    </button>
                )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
                {chunks.length > 0 && (
                    <div className="flex items-center gap-6 mr-2 animate-fade-in">
                        <div className="hidden md:flex flex-col w-36 lg:w-52 xl:w-64 transition-all duration-500 ease-in-out">
                            <div className="flex justify-between text-[10px] mb-1.5 uppercase tracking-wider font-bold font-sans">
                                <span className="text-stone-400 truncate mr-2">{isParallel ? 'Parallel' : (isContextual ? 'Contextual' : 'Serial')}</span>
                                <span className="text-stone-800">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-orange transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                        
                        {completedCount > 0 && (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} 
                                    className={`p-2 rounded-lg transition-all ${isExportMenuOpen ? 'bg-brand-orange/10 text-brand-orange' : 'text-stone-400 hover:text-brand-orange bg-stone-50 hover:bg-white'}`} 
                                    title="Export Options"
                                >
                                    <Download size={18} />
                                </button>
                                
                                {isExportMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsExportMenuOpen(false)}></div>
                                        <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-lg shadow-xl border border-stone-200 z-20 animate-fade-in overflow-hidden">
                                            <div className="px-4 py-2.5 text-[9px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50 border-b border-stone-100 font-sans">
                                                Download
                                            </div>
                                            <button 
                                                onClick={() => handleExport(false)}
                                                className="w-full text-left px-4 py-3 text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-brand-orange transition-colors flex items-center gap-2 font-sans"
                                            >
                                                <FileText size={14} /> Results Only
                                            </button>
                                            <div className="h-px bg-stone-50"></div>
                                            <button 
                                                onClick={() => handleExport(true)}
                                                className="w-full text-left px-4 py-3 text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-brand-orange transition-colors flex items-center gap-2 font-sans"
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

                <div className="h-8 w-px bg-stone-200 mx-1"></div>

                <button 
                    onClick={() => setIsProcessing(!isProcessing)}
                    disabled={chunks.length === 0}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-sans ${
                        isProcessing 
                        ? 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-300' 
                        : 'bg-brand-orange text-white hover:bg-brand-orange/90 shadow-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0'
                    }`}
                >
                    {isProcessing ? <><Pause size={16} fill="currentColor"/> <span className="hidden md:inline">Pause</span></> : <><Play size={16} fill="currentColor"/> <span className="hidden md:inline">Start Flow</span></>}
                </button>

                <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                    <Settings size={20} />
                </button>
            </div>
            </header>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-20 scroll-smooth relative custom-scrollbar">
            {chunks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 animate-fade-in pb-16">
                    <div className="relative group cursor-pointer" onClick={() => setIsPasteModalOpen(true)}>
                        <div className="absolute inset-0 bg-stone-200/50 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative w-full max-w-lg border border-dashed border-stone-300 rounded-[2rem] p-12 flex flex-col items-center justify-center bg-white hover:border-brand-orange/40 transition-all duration-300">
                            <div className="w-20 h-20 bg-stone-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out border border-stone-100">
                                <Feather size={32} className="text-brand-orange opacity-80"/>
                            </div>
                            <h2 className="text-2xl font-bold text-brand-dark mb-3 tracking-tight font-sans">Begin your thought process</h2>
                            <p className="text-center text-stone-500 text-sm mb-8 leading-relaxed max-w-xs font-serif italic">
                                Drag a document here to find flow,<br/> or simply paste your text.
                            </p>
                            <div className="flex gap-4 font-sans">
                                <button onClick={(e) => {e.stopPropagation(); handlePaste()}} className="px-6 py-2.5 bg-white border border-stone-200 shadow-sm rounded-lg text-xs font-bold text-stone-600 hover:border-brand-orange hover:text-brand-orange transition-all">
                                    Paste Text
                                </button>
                                <label onClick={(e) => e.stopPropagation()} className="px-6 py-2.5 bg-brand-dark text-stone-50 shadow-lg shadow-stone-200 rounded-lg text-xs font-bold hover:bg-black transition-all cursor-pointer flex items-center gap-2">
                                    <Upload size={14}/> Upload File
                                    <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden"/>
                                </label>
                            </div>
                        </div>
                    </div>
                    {!appConfig.apiKey && (
                         <div className="mt-8 flex items-center gap-2 text-brand-orange bg-brand-orange/5 px-5 py-2.5 rounded-full text-xs font-semibold border border-brand-orange/20 cursor-pointer hover:bg-brand-orange/10 transition-colors font-sans" onClick={() => setIsSettingsOpen(true)}>
                            <Settings size={14}/>
                            Configuration Required
                         </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6 max-w-4xl mx-auto pt-2 animate-fade-in">
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