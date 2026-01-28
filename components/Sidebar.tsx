import React from 'react';
import { createPortal } from 'react-dom';
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
  Bookmark,
  Sparkles,
  Github,
  X
} from 'lucide-react';
import { useTranslation } from '../locales';

interface SidebarProps {
  splitConfig: SplitConfig;
  setSplitConfig: (config: SplitConfig) => void;
  onOpenSplitRuleAssistant: () => void;
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
  // Mobile props
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  splitConfig,
  setSplitConfig,
  onOpenSplitRuleAssistant,
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
  disabled = false,
  isMobile = false,
  isOpen = true,
  onClose
}) => {
  const { t } = useTranslation();
  const promptTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isPromptOverlayOpen, setIsPromptOverlayOpen] = React.useState(false);

  const isPromptOverflowing = React.useCallback(() => {
    const el = promptTextareaRef.current;
    if (!el) return false;
    return el.scrollHeight > el.clientHeight + 4;
  }, []);

  const openPromptOverlayIfNeeded = React.useCallback(() => {
    if (isMobile) return;
    if (isPromptOverflowing()) setIsPromptOverlayOpen(true);
  }, [isMobile, isPromptOverflowing]);

  React.useEffect(() => {
    if (!isPromptOverlayOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPromptOverlayOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPromptOverlayOpen]);

  return (
    <div className={`
      ${isMobile ? 'fixed' : 'relative'}
      ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
      ${isMobile ? 'w-[85vw] max-w-[320px]' : 'w-80'}
      h-full bg-stone-50 border-r border-stone-200 flex flex-col z-50
      transition-transform duration-300 ease-out
      ${isMobile ? 'left-0 top-0' : ''}
      font-sans
    `}>
      {/* Header */}
      <div className="px-6 py-6 flex items-center gap-3 shrink-0">
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} className="text-brand-dark" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center shadow-md">
          <Sparkles size={20} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-dark tracking-tight font-sans">{t('sidebar.title')}</h1>
          <p className="text-xs font-serif italic text-stone-500">{t('sidebar.subtitle')}</p>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-8 ${disabled ? 'opacity-50 pointer-events-none grayscale-[0.3]' : ''}`}>
        
        {/* Slicer Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 font-sans">
            <Scissors size={12} />
            <span>{t('sidebar.fragmentation')}</span>
          </div>

          <div className="space-y-4">
            {/* Mode Selector */}
            <div className="bg-stone-200/50 p-1 rounded-lg grid grid-cols-3 gap-1">
                {[
                    { val: SplitMode.CHARACTER, icon: Type, label: t('sidebar.chars') },
                    { val: SplitMode.LINE, icon: AlignJustify, label: t('sidebar.lines') },
                    { val: SplitMode.CUSTOM, icon: Settings2, label: t('sidebar.custom') },
                ].map((opt) => (
                    <button
                        key={opt.val}
                        onClick={() => setSplitConfig({ ...splitConfig, mode: opt.val })}
                        className={`flex flex-col items-center justify-center py-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                            splitConfig.mode === opt.val
                            ? 'bg-white text-brand-orange shadow-sm'
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
                  <label className="flex justify-between text-xs font-medium text-stone-500 mb-2 group-focus-within:text-brand-orange transition-colors">
                    {t('sidebar.chunkSize')} <span className="text-stone-300">{t('sidebar.chunkSizeUnit')}</span>
                  </label>
                  <input
                    type="number"
                    value={splitConfig.chunkSize}
                    onChange={(e) => setSplitConfig({ ...splitConfig, chunkSize: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange shadow-sm transition-all outline-none font-serif"
                  />
                </div>
              )}

              {splitConfig.mode === SplitMode.LINE && (
                <div className="animate-fade-in group">
                  <label className="flex justify-between text-xs font-medium text-stone-500 mb-2 group-focus-within:text-brand-orange transition-colors">
                    {t('sidebar.linesPerChunk')} <span className="text-stone-300">{t('sidebar.linesPerChunkUnit')}</span>
                  </label>
                  <input
                    type="number"
                    value={splitConfig.lineCount}
                    onChange={(e) => setSplitConfig({ ...splitConfig, lineCount: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange shadow-sm transition-all outline-none font-serif"
                  />
                </div>
              )}

              {splitConfig.mode === SplitMode.CUSTOM && (
                <div className="animate-fade-in space-y-3">
                  <div className="group">
                    <label className="flex justify-between text-xs font-medium text-stone-500 mb-2 group-focus-within:text-brand-orange transition-colors">
                      {t('sidebar.ruleType')} <span className="text-stone-300">{t('sidebar.ruleTypeUnit')}</span>
                    </label>
                    <select
                      value={splitConfig.customRuleType}
                      onChange={(e) => setSplitConfig({ ...splitConfig, customRuleType: e.target.value as CustomSplitRuleType })}
                      className="w-full pl-3 pr-3 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange shadow-sm transition-all outline-none font-serif appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_0.75rem_center] bg-no-repeat"
                    >
                      <option value="text">{t('sidebar.textRule')}</option>
                      <option value="heading">{t('sidebar.headings')}</option>
                    </select>
                  </div>

                  {splitConfig.customRuleType === 'heading' ? (
                    <div className="group">
                      <label className="flex justify-between text-xs font-medium text-stone-500 mb-2 group-focus-within:text-brand-orange transition-colors">
                        {t('sidebar.headingLevel')} <span className="text-stone-300">{t('sidebar.headingLevelUnit')}</span>
                      </label>
                      <select
                        value={splitConfig.customHeadingLevel}
                        onChange={(e) =>
                          setSplitConfig({
                            ...splitConfig,
                            customHeadingLevel: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6,
                          })
                        }
                        className="w-full pl-3 pr-3 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange shadow-sm transition-all outline-none font-serif appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_0.75rem_center] bg-no-repeat"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            H{n} (^{`${'#'.repeat(n)}`})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div className="group">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex justify-between text-xs font-medium text-stone-500 group-focus-within:text-brand-orange transition-colors">
                            {t('sidebar.rule')} <span className="text-stone-300">{t('sidebar.ruleUnit')}</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <div className="group/keep relative flex items-center">
                              <button
                                onClick={() =>
                                  setSplitConfig({ ...splitConfig, customKeepSeparator: !splitConfig.customKeepSeparator })
                                }
                                className={`p-1.5 rounded-md transition-colors ${
                                  splitConfig.customKeepSeparator
                                    ? 'text-brand-orange bg-brand-orange/10'
                                    : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'
                                }`}
                                type="button"
                                aria-pressed={splitConfig.customKeepSeparator}
                                title={t('sidebar.keepMarker')}
                              >
                                <Bookmark size={14} />
                              </button>
                              <div className="absolute right-0 bottom-full mb-1.5 w-56 p-3 bg-brand-dark text-stone-50 text-xs leading-relaxed rounded-lg shadow-xl opacity-0 group-hover/keep:opacity-100 pointer-events-none transition-all z-50 font-serif">
                                {t('sidebar.keepMarkerTooltip')}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={onOpenSplitRuleAssistant}
                                className="text-stone-500 hover:text-brand-orange hover:bg-brand-orange/10 p-1.5 rounded-md transition-colors"
                                type="button"
                              >
                                <MessageSquare size={12} className="opacity-70" />
                              </button>
                              <div className="group/assist relative inline-flex">
                                <Info size={12} className="text-stone-300 hover:text-brand-orange cursor-help transition-colors"/>
                                <div className="absolute right-0 bottom-full mb-1.5 w-56 p-3 bg-brand-dark text-stone-50 text-xs leading-relaxed rounded-lg shadow-xl opacity-0 group-hover/assist:opacity-100 pointer-events-none transition-all z-50 font-serif">
                                  {t('sidebar.assistTooltip')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={splitConfig.customSeparator}
                          onChange={(e) => setSplitConfig({ ...splitConfig, customSeparator: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange shadow-sm transition-all outline-none font-serif placeholder:text-stone-300"
                          placeholder={t('sidebar.rulePlaceholder')}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Batch Size */}
               <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-stone-500">{t('sidebar.batchSize')}</label>
                    <div className="group relative flex items-center">
                         <Info size={12} className="text-stone-300 hover:text-brand-orange cursor-help transition-colors"/>
                         <div className="absolute right-0 bottom-full mb-1.5 w-48 p-3 bg-brand-dark text-stone-50 text-xs leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 font-serif">
                            {t('sidebar.batchSizeTooltip')}
                         </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={splitConfig.batchSize}
                    onChange={(e) => setSplitConfig({ ...splitConfig, batchSize: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange shadow-sm transition-all outline-none font-serif"
                  />
              </div>
            </div>
          </div>
        </section>

	        {/* Prompts Section */}
	        <section className="space-y-4">
	           <div className="flex items-center justify-between mb-2">
	               <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest font-sans">
	                <FileText size={12} />
	                <span>{t('sidebar.prompt')}</span>
	              </div>
	          </div>

	          <div className="space-y-4">
	            <div>
	                <div className="relative group">
	                    <textarea
	                        value={systemPrompt}
	                        onChange={(e) => {
                          setSystemPrompt(e.target.value);
                          if (document.activeElement === promptTextareaRef.current) {
                            openPromptOverlayIfNeeded();
                          }
                        }}
                          onFocus={openPromptOverlayIfNeeded}
                          ref={promptTextareaRef}
	                        className="w-full h-32 px-4 py-4 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all resize-none leading-7 placeholder:text-stone-300 shadow-sm font-serif outline-none"
	                        placeholder={t('sidebar.promptPlaceholder')}
	                    />
	                </div>
	            </div>

            {/* Glossary Config */}
            <div className="bg-white rounded-xl p-5 space-y-3 shadow-md border border-stone-200">
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
                        <span className="text-xs font-semibold text-stone-600 flex items-center gap-1.5 font-sans">
                            <Book size={12} className="opacity-70"/> {t('sidebar.glossary')}
                        </span>
                    </label>
                    <span className="text-xs text-stone-500 font-serif bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">{glossaryTerms.length}</span>
                </div>

                <button
                    onClick={onOpenGlossary}
                    className="w-full py-2 text-xs font-semibold text-stone-500 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-colors font-sans"
                >
                    {t('sidebar.manageTerms')}
                </button>
            </div>
          </div>
        </section>

        {isPromptOverlayOpen && !isMobile && createPortal(
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setIsPromptOverlayOpen(false)}
          >
            <div className="w-full h-full flex items-center justify-center pl-80">
              <div
                className="relative w-[min(92vw,960px)] max-h-[82vh]"
                onClick={(event) => event.stopPropagation()}
              >
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  autoFocus
                  className="w-full h-[62vh] max-h-[62vh] px-4 py-4 bg-white/55 border border-transparent rounded-[32px] text-[16px] text-stone-900 focus:ring-0 focus:border-transparent transition-all resize-none leading-7 placeholder:text-stone-400 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35),_0_10px_24px_-16px_rgba(0,0,0,0.2)] font-serif outline-none backdrop-blur-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  placeholder={t('sidebar.promptPlaceholder')}
                />
              </div>
            </div>
          </div>
        , document.body)}

        {/* Execution Section */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 font-sans">
            <Layers size={12} />
            <span>{t('sidebar.execution')}</span>
          </div>

          <div className="bg-white rounded-xl p-5 space-y-4 shadow-md border border-stone-200">
             <div className="flex bg-stone-100 p-1 rounded-lg">
                 <button
                    onClick={() => setIsParallel(false)}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${!isParallel ? 'bg-white text-brand-orange shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                 >
                    {t('sidebar.serial')}
                 </button>
	                 <button
	                    onClick={() => {
	                        setIsParallel(true);
	                    }}
	                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${isParallel ? 'bg-white text-brand-orange shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
	                 >
	                    {t('sidebar.parallel')}
	                 </button>
             </div>

              {isParallel && (
                 <div className="animate-fade-in px-1">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-medium text-stone-600">{t('sidebar.concurrencyLimit')}</label>
                        <span className="text-xs font-mono text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">{concurrencyLimit}x</span>
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
                        <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 group-hover:text-brand-orange transition-colors font-sans">
                            {t('sidebar.contextualMemory')}
                        </span>
                    </label>
                    <div className="mt-3 text-xs text-stone-500 leading-relaxed pl-1 font-serif italic">
                        {t('sidebar.contextualMemoryDesc')}
                    </div>
                </div>
              )}
          </div>
        </section>
      </div>

      <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 text-center shrink-0">
        <p className="text-xs font-medium text-stone-400 tracking-wide font-sans flex items-center justify-center gap-2">
          <a
            href="https://github.com/zlhhhh8901/AI-Long-Text-Flow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-brand-orange transition-colors"
            title="View on GitHub"
          >
            <Github size={18} />
          </a>
          {t('sidebar.privacyFooter')}
        </p>
      </div>
    </div>
  );
};
