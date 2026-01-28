import React from 'react';
import { X, ArrowRightLeft, Download } from 'lucide-react';
import { MergeConfig } from '../types';
import { useTranslation } from '../locales';

interface MergeExportModalProps {
  isOpen: boolean;
  mode: 'merge' | 'export';
  config: MergeConfig;
  pairCount: number;
  previewCount: number;
  preview: string;
  onChange: (next: MergeConfig) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const MergeExportModal: React.FC<MergeExportModalProps> = ({
  isOpen,
  mode,
  config,
  pairCount,
  previewCount,
  preview,
  onChange,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const title = mode === 'merge' ? t('mergeExportModal.mergeTitle') : t('mergeExportModal.exportTitle');
  const actionLabel = mode === 'merge' ? t('mergeExportModal.mergeAction') : t('mergeExportModal.exportAction');
  const Icon = mode === 'merge' ? ArrowRightLeft : Download;

  const updateField = (field: keyof MergeConfig) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...config, [field]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/20 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-[95vw] sm:w-full max-w-3xl flex flex-col max-h-[85vh] animate-fade-in border border-stone-200">
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-stone-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-brand-dark flex items-center gap-2 font-sans">
              <div className="bg-brand-orange/10 p-2 rounded-lg">
                <Icon size={18} className="text-brand-orange sm:w-5 sm:h-5" />
              </div>
              {title}
            </h2>
            <p className="text-xs text-stone-500 mt-1 font-serif">{t('mergeExportModal.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full p-1 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 bg-stone-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 font-sans">
                {t('mergeExportModal.requestPrefixLabel')}
              </label>
              <textarea
                value={config.requestPrefix}
                onChange={updateField('requestPrefix')}
                placeholder={t('mergeExportModal.requestPrefixPlaceholder')}
                rows={2}
                spellCheck={false}
                className="w-full p-3 border border-stone-200 rounded-lg resize-y focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none text-xs font-mono bg-white shadow-sm text-stone-700 placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 font-sans">
                {t('mergeExportModal.responsePrefixLabel')}
              </label>
              <textarea
                value={config.responsePrefix}
                onChange={updateField('responsePrefix')}
                placeholder={t('mergeExportModal.responsePrefixPlaceholder')}
                rows={2}
                spellCheck={false}
                className="w-full p-3 border border-stone-200 rounded-lg resize-y focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none text-xs font-mono bg-white shadow-sm text-stone-700 placeholder:text-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 font-sans">
              {t('mergeExportModal.pairSeparatorLabel')}
            </label>
            <textarea
              value={config.pairSeparator}
              onChange={updateField('pairSeparator')}
              placeholder={t('mergeExportModal.pairSeparatorPlaceholder')}
              rows={2}
              spellCheck={false}
              className="w-full p-3 border border-stone-200 rounded-lg resize-y focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none text-xs font-mono bg-white shadow-sm text-stone-700 placeholder:text-stone-400"
            />
            <p className="text-xs text-stone-400 mt-2 font-serif">{t('mergeExportModal.escapeHint')}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider font-sans">
              <span>{t('mergeExportModal.previewTitle')}</span>
              <span className="flex items-center gap-3">
                <span>{t('mergeExportModal.previewCount').replace('{count}', String(previewCount))}</span>
                <span>{t('mergeExportModal.availableCount').replace('{count}', String(pairCount))}</span>
              </span>
            </div>
            <div className="border border-stone-200 rounded-lg bg-white shadow-sm">
              {preview ? (
                <pre className="p-4 text-xs text-stone-600 font-mono whitespace-pre-wrap break-words max-h-56 overflow-y-auto custom-scrollbar">
                  {preview}
                </pre>
              ) : (
                <div className="p-4 text-xs text-stone-400 font-serif">{t('mergeExportModal.previewEmpty')}</div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-stone-100 flex justify-end gap-3 bg-white rounded-b-2xl font-sans">
          <button onClick={onClose} className="px-4 sm:px-5 py-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-50 rounded-lg font-medium text-sm transition-colors">
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={pairCount === 0}
            className="px-5 sm:px-6 py-2.5 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-orange/90 shadow-lg shadow-brand-orange/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-orange"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
