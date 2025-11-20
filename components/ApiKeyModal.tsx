import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Server, Key, Cpu } from 'lucide-react';
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
        // Set default model when switching providers
        model: provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o',
        // Clear or set default base URL if needed (keeping OpenAI URL as fallback)
        baseUrl: provider === 'gemini' ? '' : 'https://api.openai.com/v1'
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <SettingsIcon size={20}/>
            </span>
            API Configuration
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          
          {/* Provider Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">AI Provider</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                <button 
                    onClick={() => handleProviderChange('gemini')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                        localConfig.provider === 'gemini' 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <span className="text-xs">✨</span> Google Gemini
                </button>
                <button 
                    onClick={() => handleProviderChange('openai')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                        localConfig.provider === 'openai' 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Server size={14} /> OpenAI / Compatible
                </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Key size={14} /> API Key
            </label>
            <input
              type="password"
              value={localConfig.apiKey}
              onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
              placeholder={localConfig.provider === 'gemini' ? "AIza..." : "sk-..."}
            />
          </div>

          {localConfig.provider === 'openai' && (
            <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Base URL</label>
                <input
                type="text"
                value={localConfig.baseUrl}
                onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="https://api.openai.com/v1"
                />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Cpu size={14} /> Model
              </label>
              <input
                type="text"
                value={localConfig.model}
                onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder={localConfig.provider === 'gemini' ? "gemini-2.5-flash" : "gpt-4o"}
              />
              {localConfig.provider === 'gemini' && (
                <div className="mt-1 text-[10px] text-slate-500 flex gap-1 flex-wrap">
                    <span className="cursor-pointer hover:text-primary" onClick={() => setLocalConfig({...localConfig, model: 'gemini-2.5-flash'})}>flash</span>
                    <span className="cursor-pointer hover:text-primary" onClick={() => setLocalConfig({...localConfig, model: 'gemini-3-pro-preview'})}>pro</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={localConfig.temperature}
                onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0"/>
            <p>Keys are stored in your browser's LocalStorage and are never sent to our servers. They are used directly with the AI provider.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 font-medium"
          >
            <Save size={18} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper icon component for this file
const SettingsIcon = ({ size }: { size: number }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
);