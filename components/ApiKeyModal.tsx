import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Server, Key, Cpu, Zap } from 'lucide-react';
import { AppConfig, ModelProvider } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in transform transition-all scale-100">
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Settings
            </h2>
            <p className="text-xs text-slate-500 mt-1">Configure your AI provider and model</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full p-1 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Provider Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">AI Provider</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button 
                    onClick={() => handleProviderChange('gemini')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        localConfig.provider === 'gemini' 
                        ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    <span className="text-lg leading-none">✨</span> Google Gemini
                </button>
                <button 
                    onClick={() => handleProviderChange('openai')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        localConfig.provider === 'openai' 
                        ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    <Server size={16} /> OpenAI / Custom
                </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Key size={14} /> API Key
            </label>
            <input
              type="password"
              value={localConfig.apiKey}
              onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-sm"
              placeholder={localConfig.provider === 'gemini' ? "AIza..." : "sk-..."}
            />
          </div>

          {localConfig.provider === 'openai' && (
            <div className="animate-slide-up">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Base URL</label>
                <input
                type="text"
                value={localConfig.baseUrl}
                onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-mono"
                placeholder="https://api.openai.com/v1"
                />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Cpu size={14} /> Model Name
              </label>
              <input
                type="text"
                value={localConfig.model}
                onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                placeholder={localConfig.provider === 'gemini' ? "gemini-2.5-flash" : "gpt-4o"}
              />
              {localConfig.provider === 'gemini' && (
                <div className="mt-2 flex gap-2">
                    <button className="text-[10px] bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-500 px-2 py-1 rounded transition-colors" onClick={() => setLocalConfig({...localConfig, model: 'gemini-2.5-flash'})}>Flash</button>
                    <button className="text-[10px] bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-500 px-2 py-1 rounded transition-colors" onClick={() => setLocalConfig({...localConfig, model: 'gemini-3-pro-preview'})}>Pro</button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Temperature</label>
              <div className="relative">
                <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={localConfig.temperature}
                    onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Zap size={14} className="text-slate-400"/>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5"/>
            <p className="text-xs text-blue-800 leading-relaxed">
                Keys are stored locally in your browser. We do not have servers and cannot access your data.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-slate-600 hover:bg-slate-200/50 hover:text-slate-800 rounded-lg transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-lg shadow-primary/25 transition-all flex items-center gap-2 text-sm font-bold transform active:scale-95"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};