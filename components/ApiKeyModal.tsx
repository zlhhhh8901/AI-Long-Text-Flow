import React, { useState, useEffect, useRef } from 'react';
import { X, Save, AlertCircle, Server, Key, Cpu, Zap } from 'lucide-react';
import { AppConfig, ModelProvider } from '../types';
import { useTranslation } from '../locales';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const wasOpenRef = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setLocalConfig(config);
    }
    wasOpenRef.current = isOpen;
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const handleProviderChange = (provider: ModelProvider) => {
    setLocalConfig(prev => ({
        ...prev,
        provider,
        model: provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o',
        baseUrl: provider === 'gemini' ? '' : 'https://api.openai.com/v1'
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/20 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg w-[95vw] sm:w-full max-w-md overflow-hidden animate-fade-in transform transition-all scale-100 border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-stone-50 border-b border-stone-100 px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2 font-sans">
                {t('settings.title')}
            </h2>
            <p className="text-xs text-stone-500 mt-1 font-serif">{t('settings.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full p-1 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Provider Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-3 font-sans">{t('settings.aiProvider')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-stone-100 rounded-lg border border-stone-200">
                <button
                    onClick={() => handleProviderChange('gemini')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all font-sans ${
                        localConfig.provider === 'gemini'
                        ? 'bg-white text-brand-orange shadow-sm'
                        : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                    }`}
                >
                    <span className="text-lg leading-none">✨</span> {t('settings.googleGemini')}
                </button>
                <button
                    onClick={() => handleProviderChange('openai')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all font-sans ${
                        localConfig.provider === 'openai'
                        ? 'bg-white text-brand-orange shadow-sm'
                        : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                    }`}
                >
                    <Server size={16} /> {t('settings.openaiCustom')}
                </button>
            </div>
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-3 font-sans">
              {t('settings.language')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-stone-100 rounded-lg border border-stone-200">
              <button
                onClick={() => setLocalConfig({ ...localConfig, language: 'en' })}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all font-sans ${
                  localConfig.language === 'en'
                    ? 'bg-white text-brand-orange shadow-sm'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                }`}
              >
                {t('settings.english')}
              </button>
              <button
                onClick={() => setLocalConfig({ ...localConfig, language: 'zh' })}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all font-sans ${
                  localConfig.language === 'zh'
                    ? 'bg-white text-brand-orange shadow-sm'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                }`}
              >
                {t('settings.chinese')}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-3 flex items-center gap-2 font-sans">
                <Key size={14} /> {t('settings.apiKey')}
            </label>
            <input
              type="password"
              value={localConfig.apiKey}
              onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all font-mono text-sm text-stone-800"
              placeholder={localConfig.provider === 'gemini' ? t('settings.apiKeyPlaceholderGemini') : t('settings.apiKeyPlaceholderOpenAI')}
            />
          </div>

          {localConfig.provider === 'openai' && (
            <div className="animate-slide-up">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-3 font-sans">{t('settings.baseUrl')}</label>
                <input
                type="text"
                value={localConfig.baseUrl}
                onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all text-sm font-mono text-stone-800"
                placeholder={t('settings.baseUrlPlaceholder')}
                />
                <div className="mt-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-xs font-bold text-amber-800 mb-1.5 font-sans">{t('settings.corsWarningTitle')}</p>
                  <p className="text-xs text-amber-700 leading-relaxed font-serif">
                    {t('settings.corsWarningText')}
                  </p>
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-3 flex items-center gap-2 font-sans">
                <Cpu size={14} /> {t('settings.modelName')}
              </label>
              <input
                type="text"
                value={localConfig.model}
                onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all text-sm text-stone-800"
                placeholder={localConfig.provider === 'gemini' ? t('settings.modelPlaceholderGemini') : t('settings.modelPlaceholderOpenAI')}
              />
              {localConfig.provider === 'gemini' && (
                <div className="mt-2 flex gap-2 font-sans">
                    <button className="text-xs bg-stone-100 hover:bg-brand-orange/10 hover:text-brand-orange text-stone-500 px-2 py-1 rounded transition-colors" onClick={() => setLocalConfig({...localConfig, model: 'gemini-2.5-flash'})}>{t('settings.flash')}</button>
                    <button className="text-xs bg-stone-100 hover:bg-brand-orange/10 hover:text-brand-orange text-stone-500 px-2 py-1 rounded transition-colors" onClick={() => setLocalConfig({...localConfig, model: 'gemini-3-pro-preview'})}>{t('settings.pro')}</button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-3 font-sans">{t('settings.temperature')}</label>
              <div className="relative">
                <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={localConfig.temperature}
                    onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all text-sm text-stone-800"
                />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Zap size={14} className="text-stone-400"/>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-blue/5 p-5 rounded-xl border border-brand-blue/20 flex gap-3">
            <AlertCircle size={18} className="text-brand-blue shrink-0 mt-0.5"/>
            <p className="text-xs text-brand-blue leading-relaxed font-serif">
                {t('settings.securityNote')}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 font-sans">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-stone-600 hover:bg-stone-200/50 hover:text-stone-800 rounded-lg transition-colors text-sm font-semibold"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg shadow-md shadow-brand-orange/25 transition-all flex items-center gap-2 text-sm font-bold transform active:scale-95"
          >
            <Save size={16} /> {t('settings.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};
