import React, { useEffect, useMemo, useState } from 'react';
import { X, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import { AppConfig, SplitConfig, SplitMode } from '../types';
import { splitText } from '../services/splitterService';
import { processChunkWithLLM } from '../services/llmService';
import { useTranslation } from '../locales';

interface SplitRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appConfig: AppConfig;
  sourceText: string;
  splitConfig: SplitConfig;
  onApply: (config: SplitConfig) => void;
}

const buildAssistantPrompt = (userRequest: string, sampleText: string) => {
  return [
    'You generate ONE splitting rule for a text chunker (TEXT RULE ONLY).',
    '',
    'Return ONLY valid JSON with this schema:',
    '{',
    '  "textRule": {',
    '    "kind": "plain" | "regex",',
    '    "pattern": string,',
    '    "flags": string,',
    '    "keepMarker": boolean',
    '  },',
    '  "notes": string',
    '}',
    '',
    'Constraints:',
    '- Plain markers support wildcards: * (any chars, non-greedy) and ? (any single char).',
    '- Plain markers allow escaping: \\* and \\? to mean literal * and ?.',
    '- Plain markers may match across lines (\\n).',
    '- Regex must be a JavaScript regex pattern+flags (do not include surrounding /.../).',
    '',
    'User request:',
    userRequest.trim(),
    '',
    'Sample text:',
    sampleText.trim() ? sampleText : '(none provided)',
  ].join('\n');
};

const safeJsonParse = (text: string) => {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf('{');
    const last = trimmed.lastIndexOf('}');
    if (first >= 0 && last > first) {
      return JSON.parse(trimmed.slice(first, last + 1));
    }
    throw new Error('Invalid JSON');
  }
};

const getChunkPreview = (content: string) => {
  const lines = content.split('\n');
  const head = lines.slice(0, 2).join('\n').trim();
  if (!head) return '(empty)';
  if (lines.length <= 2 && head.length <= 240) return head;
  return `${head}${head.length > 240 ? '…' : '\n…'}`;
};

export const SplitRuleModal: React.FC<SplitRuleModalProps> = ({ isOpen, onClose, appConfig, sourceText, splitConfig, onApply }) => {
  const { t } = useTranslation();
  const [candidate, setCandidate] = useState<SplitConfig>(splitConfig);
  const [aiRequest, setAiRequest] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);
  const ruleRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCandidate({ ...splitConfig, customRuleType: 'text' });
    setAiError(null);
    setIsGenerating(false);
    setJustGenerated(false);
    if (sourceText.trim()) {
      setSampleText(sourceText);
    } else {
      setSampleText('');
    }
  }, [isOpen, splitConfig, sourceText]);

  useEffect(() => {
    if (justGenerated && ruleRef.current) {
      ruleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timer = setTimeout(() => setJustGenerated(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [justGenerated]);

  const previewChunks = useMemo(() => {
    if (!sampleText.trim()) return [];
    try {
      const previewConfig: SplitConfig = {
        ...candidate,
        customRuleType: 'text',
        mode: SplitMode.CUSTOM,
        batchSize: 1,
      };
      return splitText(sampleText, previewConfig);
    } catch {
      return [];
    }
  }, [candidate, sampleText]);

  if (!isOpen) return null;

  const canGenerate = Boolean(appConfig.apiKey) && Boolean(aiRequest.trim());

  const handleGenerate = async () => {
    if (!canGenerate || isGenerating) return;
    setAiError(null);
    setIsGenerating(true);
    setJustGenerated(false);
    try {
      const prompt = buildAssistantPrompt(aiRequest, sampleText);
      const assistantConfig: AppConfig = {
        ...appConfig,
        temperature: 0,
        systemPrompt: 'You are a careful JSON generator.',
      };
      const raw = await processChunkWithLLM(prompt, assistantConfig);
      const parsed = safeJsonParse(raw) as any;

      const kind: 'plain' | 'regex' = parsed?.textRule?.kind;
      const keepMarker = Boolean(parsed?.textRule?.keepMarker);

      if (kind === 'plain') {
        const pattern = String(parsed?.textRule?.pattern ?? '');
        if (!pattern) throw new Error('AI returned an empty plain pattern');
        setCandidate(prev => ({
          ...prev,
          mode: SplitMode.CUSTOM,
          customRuleType: 'text',
          customSeparator: pattern,
          customKeepSeparator: keepMarker,
        }));
        setIsGenerating(false);
        setJustGenerated(true);
        return;
      }

      if (kind === 'regex') {
        const pattern = String(parsed?.textRule?.pattern ?? '');
        const flags = String(parsed?.textRule?.flags ?? '');
        if (!pattern) throw new Error('AI returned an empty regex pattern');
        setCandidate(prev => ({
          ...prev,
          mode: SplitMode.CUSTOM,
          customRuleType: 'text',
          customSeparator: `/${pattern}/${flags}`,
          customKeepSeparator: keepMarker,
        }));
        setIsGenerating(false);
        setJustGenerated(true);
        return;
      }

      throw new Error('AI returned an invalid textRule.kind');
    } catch (e: any) {
      setAiError(e?.message || String(e));
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onApply(candidate);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/20 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-[95vw] sm:w-full max-w-3xl flex flex-col max-h-[85vh] animate-fade-in border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-stone-100 bg-stone-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2 font-sans">
              <Sparkles size={20} className="text-brand-orange" />
              {t('splitRuleModal.title')}
            </h2>
            <p className="text-xs text-stone-500 mt-1 font-serif">{t('splitRuleModal.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full p-1 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar space-y-5">
          {/* Step 1: AI Generate */}
          <div className="bg-white rounded-xl p-4 shadow-card border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest font-sans flex items-center gap-2">
                <MessageSquare size={12} />
                {t('splitRuleModal.step1')}
              </div>
            </div>
            {!appConfig.apiKey && (
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs text-rose-700 font-serif flex gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {t('splitRuleModal.errorNoApiKey')}
              </div>
            )}
            <textarea
              value={aiRequest}
              onChange={(e) => setAiRequest(e.target.value)}
              className="w-full min-h-[90px] p-4 border border-stone-200 rounded-xl resize-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none text-sm font-serif bg-white text-stone-800 leading-relaxed"
              placeholder={t('splitRuleModal.step1Placeholder')}
            />
            {aiError && (
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs text-rose-700 font-serif flex gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {aiError}
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className="w-full py-2.5 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-sans"
              type="button"
            >
              <Sparkles size={16} /> {isGenerating ? t('splitRuleModal.generating') : t('splitRuleModal.generateRule')}
            </button>
          </div>

          {/* Step 2: Generated Rule */}
          <div
            ref={ruleRef}
            className={`bg-white rounded-xl p-4 shadow-card border space-y-3 transition-all duration-500 ${
              justGenerated
                ? 'border-green-400 bg-green-50/30 ring-2 ring-green-400/20'
                : 'border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest font-sans">
                {t('splitRuleModal.step3')}
              </div>
              {justGenerated && (
                <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest font-sans flex items-center gap-1 animate-fade-in">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {t('splitRuleModal.generatedRule')}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="flex justify-between text-[11px] font-medium text-stone-500 mb-2 font-sans">
                  {t('sidebar.rule')} <span className="text-stone-300 font-serif">{t('sidebar.ruleUnit')}</span>
                </label>
                <input
                  type="text"
                  value={candidate.customSeparator}
                  onChange={(e) => setCandidate(prev => ({ ...prev, customSeparator: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange shadow-sm transition-all outline-none font-serif placeholder:text-stone-300"
                  placeholder={t('sidebar.rulePlaceholder')}
                />
              </div>
              <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg p-3">
                <div>
                  <div className="text-[11px] font-semibold text-stone-600 font-sans">{t('sidebar.keepMarker')}</div>
                  <div className="text-[10px] text-stone-400 font-serif">{t('sidebar.keepMarkerTooltip')}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={candidate.customKeepSeparator}
                    onChange={(e) => setCandidate(prev => ({ ...prev, customKeepSeparator: e.target.checked }))}
                  />
                  <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-orange"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Step 3: Sample Text & Preview */}
          <div className="bg-white rounded-xl p-4 shadow-card border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest font-sans">{t('splitRuleModal.step2')}</div>
              <div className="text-[10px] text-stone-500 font-serif">{sampleText.trim() ? `${previewChunks.length} ${t('splitRuleModal.previewChunks')}` : t('splitRuleModal.previewEmptyDesc')}</div>
            </div>
            <textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="w-full min-h-[140px] p-4 border border-stone-200 rounded-xl resize-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none text-sm font-mono bg-white text-stone-800"
              placeholder={t('splitRuleModal.step2Placeholder')}
            />

            {sampleText.trim() && (
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                {previewChunks.map((c) => (
                  <div key={c.id} className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-sans mb-2">{t('splitRuleModal.previewChunk')} {c.index}</div>
                    <pre className="text-xs text-stone-700 font-mono whitespace-pre-wrap leading-relaxed">{getChunkPreview(c.rawContent)}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-stone-100 flex justify-end gap-3 rounded-b-2xl bg-white font-sans">
          <button onClick={onClose} className="px-6 py-2.5 bg-stone-100 text-stone-700 font-bold rounded-lg hover:bg-stone-200 transition-colors" type="button">
            {t('common.cancel')}
          </button>
          <button onClick={handleApply} className="px-6 py-2.5 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-orange/90 transition-colors" type="button">
            {t('splitRuleModal.applyRule')}
          </button>
        </div>
      </div>
    </div>
  );
};
