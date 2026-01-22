import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Sidebar } from './components/Sidebar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PasteModal } from './components/PasteModal';
import { GlossaryModal } from './components/GlossaryModal';
import { SplitRuleModal } from './components/SplitRuleModal';
import { ResultCard } from './components/ResultCard';
import { AppConfig, ChunkItem, DEFAULT_CONFIG, DEFAULT_SPLIT_CONFIG, ProcessingStatus, SplitConfig, GlossaryTerm } from './types';
import { splitText } from './services/splitterService';
import { processChunkWithLLM, initializeSession, LLMSession } from './services/llmService';
import { buildEffectiveSystemPrompt, DEFAULT_GLOSSARY_PROMPT, findMatchingTerms, formatGlossarySection, mergeGlossaryTerms } from './services/glossaryService';
import { Settings, Play, Pause, Trash2, Upload, Clipboard, Download, FileText, MessageSquare, Feather, RefreshCw, Github, Menu } from 'lucide-react';
import { TranslationProvider } from './locales';

function App() {
  // --- State ---
  const [sourceText, setSourceText] = useState<string>('');
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('ai-flow-config');
    if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_CONFIG, ...parsed };
    }
    return DEFAULT_CONFIG;
  });
  const [splitConfig, setSplitConfig] = useState<SplitConfig>(DEFAULT_SPLIT_CONFIG);
  const [isParallel, setIsParallel] = useState(false);
  const [isContextual, setIsContextual] = useState(false);
  const [concurrencyLimit, setConcurrencyLimit] = useState(3);
  
  // Glossary State
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>(() => {
    const saved = localStorage.getItem('ai-flow-glossary');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      const terms = Array.isArray(parsed) ? parsed : parsed?.terms;
      if (!Array.isArray(terms)) return [];
      return mergeGlossaryTerms([], terms as GlossaryTerm[]);
    } catch {
      return [];
    }
  });
  const [glossaryPrompt, setGlossaryPrompt] = useState<string>(() => {
    const saved = localStorage.getItem('ai-flow-glossary');
    if (!saved) return DEFAULT_GLOSSARY_PROMPT;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return DEFAULT_GLOSSARY_PROMPT;
      if (parsed && typeof parsed === 'object' && typeof parsed.prompt === 'string') return parsed.prompt;
      return DEFAULT_GLOSSARY_PROMPT;
    } catch {
      return DEFAULT_GLOSSARY_PROMPT;
    }
  });
  const [isGlossaryEnabled, setIsGlossaryEnabled] = useState(false);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [isSplitRuleModalOpen, setIsSplitRuleModalOpen] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Mobile state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toolbarScrollRef = useRef<HTMLDivElement | null>(null);
  const exportButtonRef = useRef<HTMLButtonElement | null>(null);
  const [exportMenuPosition, setExportMenuPosition] = useState<{ top: number; left: number } | null>(null);
  
  // Refs for Queue Management
  const isProcessingRef = useRef(false);
  const sessionRef = useRef<LLMSession | undefined>(undefined);
  const haltedOnErrorRef = useRef(false);
  const retryErrorsOnlyRef = useRef(false);
  const startedRequestsRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false); // Close drawer on desktop
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, isSidebarOpen]);

  const updateExportMenuPosition = useCallback(() => {
    const button = exportButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const menuWidth = 192; // Tailwind w-48
    const gap = 12; // Tailwind mt-3
    const viewportPadding = 8;

    const top = rect.bottom + gap;
    let left = rect.right - menuWidth;
    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - menuWidth - viewportPadding));

    setExportMenuPosition({ top, left });
  }, []);

  useEffect(() => {
    if (!isExportMenuOpen) {
      setExportMenuPosition(null);
      return;
    }

    updateExportMenuPosition();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExportMenuOpen(false);
    };

    const scroller = toolbarScrollRef.current;
    window.addEventListener('resize', updateExportMenuPosition);
    document.addEventListener('keydown', onKeyDown);
    scroller?.addEventListener('scroll', updateExportMenuPosition, { passive: true });

    return () => {
      window.removeEventListener('resize', updateExportMenuPosition);
      document.removeEventListener('keydown', onKeyDown);
      scroller?.removeEventListener('scroll', updateExportMenuPosition);
    };
  }, [isExportMenuOpen, updateExportMenuPosition]);

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
  }, [appConfig.provider, appConfig.apiKey, appConfig.model, appConfig.systemPrompt, isContextual, sourceText, isGlossaryEnabled, glossaryPrompt, glossaryTerms]);

  // Persist Glossary
  useEffect(() => {
    localStorage.setItem('ai-flow-glossary', JSON.stringify({ terms: glossaryTerms, prompt: glossaryPrompt }));
  }, [glossaryTerms, glossaryPrompt]);

  const saveConfig = (newConfig: AppConfig) => {
    setAppConfig(newConfig);
    localStorage.setItem('ai-flow-config', JSON.stringify(newConfig));
  };

  const setSystemPrompt = (systemPrompt: string) => {
    setAppConfig(prev => {
      const next = { ...prev, systemPrompt };
      localStorage.setItem('ai-flow-config', JSON.stringify(next));
      return next;
    });
  };

  // --- Handlers ---

  const handleClipboardImport = async () => {
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

  const handleOpenManualImport = () => {
    setIsPasteModalOpen(true);
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
    setGlobalError(null);
    sessionRef.current = undefined;
    haltedOnErrorRef.current = false;
    retryErrorsOnlyRef.current = false;
    startedRequestsRef.current.clear();
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

  const processQueue = useCallback(async (currentChunks: ChunkItem[]) => {
    if (!isProcessingRef.current) return;

    if (haltedOnErrorRef.current) {
      if (startedRequestsRef.current.size === 0) {
        setTimeout(() => setIsProcessing(false), 0);
      }
      return;
    }

    const processingCount = currentChunks.filter(c => c.status === ProcessingStatus.PROCESSING).length;
    const limit = isParallel ? concurrencyLimit : 1;
    if (processingCount >= limit) return;

    // Initialize Session if Contextual Mode and not initialized
    if (!isParallel && isContextual && !sessionRef.current) {
      try {
        const matches = isGlossaryEnabled ? findMatchingTerms(sourceText, glossaryTerms) : [];
        const glossarySection = isGlossaryEnabled ? formatGlossarySection(matches, glossaryPrompt) : '';
        const effectiveSystemPrompt = buildEffectiveSystemPrompt(appConfig.systemPrompt, glossarySection);
        const sessionConfig: AppConfig = { ...appConfig, systemPrompt: effectiveSystemPrompt };
        sessionRef.current = initializeSession(sessionConfig);
      } catch (e: any) {
        console.error("Failed to init session", e);
        setGlobalError(e?.message || String(e));
        haltedOnErrorRef.current = true;
        setIsProcessing(false);
        return;
      }
    }

    const candidates = [...currentChunks];
    const hasErrors = candidates.some(c => c.status === ProcessingStatus.ERROR);
    let toTrigger: ChunkItem[] = [];

    if (hasErrors) {
      if (isParallel) {
        const availableSlots = limit - processingCount;
        toTrigger = candidates
          .filter(c => c.status === ProcessingStatus.ERROR)
          .slice(0, availableSlots);
      } else {
        const firstError = candidates.find(c => c.status === ProcessingStatus.ERROR);
        if (firstError) toTrigger = [firstError];
      }
    } else if (isParallel) {
      const availableSlots = limit - processingCount;
      toTrigger = candidates
        .filter(c => c.status === ProcessingStatus.IDLE || c.status === ProcessingStatus.WAITING)
        .slice(0, availableSlots);
    } else {
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
      if (!hasErrors && isParallel && retryErrorsOnlyRef.current && processingCount === 0) {
        setTimeout(() => setIsProcessing(false), 0);
      }
      return;
    }

    const idsToTrigger = new Set(toTrigger.map(c => c.id));
    setChunks(prev => prev.map(c => (idsToTrigger.has(c.id) ? { ...c, status: ProcessingStatus.PROCESSING } : c)));
 		  }, [appConfig, isParallel, concurrencyLimit, isContextual, glossaryTerms, isGlossaryEnabled, glossaryPrompt, sourceText]);

  useEffect(() => {
    if (isProcessing) {
        processQueue(chunks);
    }
  }, [isProcessing, chunks, processQueue]);

  useEffect(() => {
    const toStart = chunks.filter(c => c.status === ProcessingStatus.PROCESSING && !startedRequestsRef.current.has(c.id));
    if (toStart.length === 0) return;

    toStart.forEach(chunk => {
      startedRequestsRef.current.add(chunk.id);

      const finalUserMessage = chunk.rawContent;
      const activeSession = (!isParallel && isContextual) ? sessionRef.current : undefined;

      const chunkMatches = (!activeSession && isGlossaryEnabled) ? findMatchingTerms(chunk.rawContent, glossaryTerms) : [];
      const glossarySection = (!activeSession && isGlossaryEnabled) ? formatGlossarySection(chunkMatches, glossaryPrompt) : '';
      const effectiveSystemPrompt = buildEffectiveSystemPrompt(appConfig.systemPrompt, glossarySection);
      const requestConfig: AppConfig = activeSession ? appConfig : { ...appConfig, systemPrompt: effectiveSystemPrompt };

      processChunkWithLLM(finalUserMessage, requestConfig, activeSession)
        .then(result => {
          updateChunkStatus(chunk.id, ProcessingStatus.SUCCESS, result);
        })
        .catch(err => {
          updateChunkStatus(chunk.id, ProcessingStatus.ERROR, undefined, err.message);
          haltedOnErrorRef.current = true;
        })
        .finally(() => {
          startedRequestsRef.current.delete(chunk.id);

          if (haltedOnErrorRef.current) {
            if (startedRequestsRef.current.size === 0) {
              setIsProcessing(false);
            }
            return;
          }
        });
    });
  }, [appConfig, chunks, glossaryPrompt, glossaryTerms, isContextual, isGlossaryEnabled, isParallel, updateChunkStatus]);

	  const handleRetry = (id: string) => {
	    haltedOnErrorRef.current = false;
	    retryErrorsOnlyRef.current = false;
	    setGlobalError(null);
	    setChunks(prev => prev.map(c => (c.id === id ? { ...c, status: ProcessingStatus.IDLE, errorMsg: undefined } : c)));
	    if (!isProcessing) {
	        setIsProcessing(true);
	    }
	  };

      const handleResetResults = () => {
        haltedOnErrorRef.current = false;
        retryErrorsOnlyRef.current = false;
        startedRequestsRef.current.clear();
        sessionRef.current = undefined;
        setGlobalError(null);
        setIsProcessing(false);
        setChunks(prev => prev.map(c => ({ ...c, status: ProcessingStatus.IDLE, result: undefined, errorMsg: undefined })));
      };

      const handleStartPause = () => {
        if (isProcessing) {
          setIsProcessing(false);
          return;
        }
        if (chunks.length === 0) return;

        const hasErrors = chunks.some(c => c.status === ProcessingStatus.ERROR);
        haltedOnErrorRef.current = false;
        retryErrorsOnlyRef.current = isParallel && hasErrors;
        setGlobalError(null);
        setIsProcessing(true);
      };

	  // --- UI ---
	  const isSessionMode = !isParallel && isContextual;
	  const glossaryEnabled = isGlossaryEnabled && glossaryTerms.length > 0;

	  const effectiveSessionSystemPrompt = useMemo(() => {
	    if (!isSessionMode || !glossaryEnabled) return appConfig.systemPrompt;
	    const matches = findMatchingTerms(sourceText, glossaryTerms);
	    const glossarySection = formatGlossarySection(matches, glossaryPrompt);
	    return buildEffectiveSystemPrompt(appConfig.systemPrompt, glossarySection);
	  }, [appConfig.systemPrompt, glossaryEnabled, glossaryPrompt, glossaryTerms, isSessionMode, sourceText]);
	  
	  const completedCount = chunks.filter(c => c.status === ProcessingStatus.SUCCESS).length;
	  const totalCount = chunks.length;
	  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;
      const isAllSuccess = totalCount > 0 && chunks.every(c => c.status === ProcessingStatus.SUCCESS);

  return (
    <TranslationProvider>
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

      {/* Hamburger Menu - Mobile Only */}
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 p-3 bg-white rounded-lg shadow-card border border-stone-200 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={24} className="text-brand-dark" />
        </button>
      )}

      {/* Backdrop - Mobile Only */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

		      <Sidebar
		        splitConfig={splitConfig}
		        setSplitConfig={setSplitConfig}
            onOpenSplitRuleAssistant={() => setIsSplitRuleModalOpen(true)}
		        isParallel={isParallel}
		        setIsParallel={setIsParallel}
		        concurrencyLimit={concurrencyLimit}
		        setConcurrencyLimit={setConcurrencyLimit}
		        isContextual={isContextual}
	        setIsContextual={setIsContextual}
	        systemPrompt={appConfig.systemPrompt}
	        setSystemPrompt={setSystemPrompt}
	        disabled={isProcessing}
	        // Glossary Props
	        glossaryTerms={glossaryTerms}
	        isGlossaryEnabled={isGlossaryEnabled}
        setIsGlossaryEnabled={setIsGlossaryEnabled}
	        onOpenGlossary={() => setIsGlossaryModalOpen(true)}
          // Mobile Props
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
	      />

        <SplitRuleModal
          isOpen={isSplitRuleModalOpen}
          onClose={() => setIsSplitRuleModalOpen(false)}
          appConfig={appConfig}
          splitConfig={splitConfig}
          onApply={setSplitConfig}
        />

	      <main className="flex-1 flex flex-col h-full min-w-0 z-10 relative">
        {/* Floating Toolbar */}
        <div className={`px-6 py-4 shrink-0 overflow-x-auto custom-scrollbar ${isMobile ? 'pt-20' : ''}`} ref={toolbarScrollRef}>
            <header className="bg-white border border-stone-200 rounded-xl flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 sm:py-4 shadow-sm gap-3 sm:gap-4 transition-all hover:shadow-md min-w-max">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                    onClick={handleOpenManualImport}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 hover:text-brand-orange hover:border-brand-orange/30 rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                >
                <Clipboard size={14} /> <span className="hidden sm:inline">Paste</span>
                </button>
                <label className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 hover:text-brand-orange hover:border-brand-orange/30 rounded-lg transition-all shadow-sm cursor-pointer font-sans ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload size={14} /> <span className="hidden sm:inline">Import</span>
                <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" disabled={isProcessing}/>
                </label>
                {chunks.length > 0 && (
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-lg transition-all font-sans"
                    >
                    <Trash2 size={14} /> <span className="hidden sm:inline">Clear</span>
                    </button>
                )}
            </div>

	            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
	                {globalError && (
	                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold font-sans max-w-[340px]">
	                        <span className="truncate">{globalError}</span>
	                    </div>
	                )}
	                {chunks.length > 0 && (
	                    <div className="flex items-center gap-4 sm:gap-6 animate-fade-in">
	                        <div className="hidden md:flex flex-col w-32 sm:w-36 lg:w-52 xl:w-64 transition-all duration-500 ease-in-out">
	                            <div className="flex justify-between text-xs mb-1.5 uppercase tracking-wider font-bold font-sans">
	                                <span className="text-stone-500 truncate mr-2">{isParallel ? 'Parallel' : (isContextual ? 'Contextual' : 'Serial')}</span>
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
                                    className={`p-2 sm:p-2.5 rounded-lg transition-all ${isExportMenuOpen ? 'bg-brand-orange/10 text-brand-orange' : 'text-stone-400 hover:text-brand-orange bg-stone-50 hover:bg-white'}`}
                                    title="Export Options"
                                    ref={exportButtonRef}
                                >
                                    <Download size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="h-8 w-px bg-stone-200 mx-1"></div>

                <button
                    onClick={isAllSuccess && !isProcessing ? handleResetResults : handleStartPause}
                    disabled={chunks.length === 0}
                    className={`flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-bold shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-sans ${
                        isProcessing
                        ? 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-300'
                        : 'bg-brand-orange text-white hover:bg-brand-orange/90 shadow-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0'
                    }`}
                >
                    {isProcessing ? (
                      <>
                        <Pause size={16} fill="currentColor" /> <span className="hidden sm:inline">Pause</span>
                      </>
                    ) : isAllSuccess ? (
                      <>
                        <RefreshCw size={16} /> <span className="hidden sm:inline">Clear Results</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} fill="currentColor" /> <span className="hidden sm:inline">Start Flow</span>
                      </>
                    )}
                </button>

                <button onClick={() => setIsSettingsOpen(true)} className="p-2 sm:p-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                    <Settings size={20} />
                </button>
            </div>
            </header>
        </div>

        {isExportMenuOpen &&
          exportMenuPosition &&
          createPortal(
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsExportMenuOpen(false)} />
              <div
                className="fixed w-48 bg-white rounded-lg shadow-lg border border-stone-200 z-40 animate-fade-in overflow-hidden"
                style={{ top: exportMenuPosition.top, left: exportMenuPosition.left }}
              >
                <div className="px-4 py-2.5 text-xs font-bold text-stone-500 uppercase tracking-wider bg-stone-50 border-b border-stone-100 font-sans">
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
            </>,
            document.body
          )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-20 scroll-smooth relative custom-scrollbar">
            {chunks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 animate-fade-in pb-16 pt-8">
                    <div className="relative group cursor-pointer" onClick={handleClipboardImport}>
                        <div className="absolute inset-0 bg-stone-200/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative w-full max-w-lg border border-dashed border-stone-300 rounded-2xl p-12 flex flex-col items-center justify-center bg-white hover:border-brand-orange/40 transition-all duration-300">
                            <div className="w-20 h-20 bg-stone-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out border border-stone-100">
                                <Feather size={32} className="text-brand-orange opacity-80"/>
                            </div>
                            <h2 className="text-2xl font-bold text-brand-dark mb-3 tracking-tight font-sans">Begin your thought process</h2>
                            <p className="text-center text-stone-500 text-sm mb-8 leading-relaxed max-w-xs font-serif italic">
                                Drag a document here to find flow,<br/> or simply paste your text.
                            </p>
                            <div className="flex gap-4 font-sans">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenManualImport(); }} className="px-6 py-2.5 bg-white border border-stone-200 shadow-sm rounded-lg text-xs font-bold text-stone-600 hover:border-brand-orange hover:text-brand-orange transition-all">
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
		                        const glossarySection = (!isSessionMode && glossaryEnabled)
		                          ? formatGlossarySection(findMatchingTerms(chunk.rawContent, glossaryTerms), glossaryPrompt)
		                          : '';
		                        const effectiveSystemPrompt = isSessionMode
		                          ? effectiveSessionSystemPrompt
		                          : buildEffectiveSystemPrompt(appConfig.systemPrompt, glossarySection);

		                        return (
		                            <ResultCard 
		                                key={chunk.id} 
		                                chunk={chunk} 
		                                onRetry={handleRetry} 
		                                effectiveSystemPrompt={effectiveSystemPrompt}
		                                model={appConfig.model}
		                                isContextual={isSessionMode}
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
        prompt={glossaryPrompt}
        onUpdatePrompt={setGlossaryPrompt}
      />
    </div>
    </TranslationProvider>
  );
}

export default App;
