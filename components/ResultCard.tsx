import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChunkItem, ProcessingStatus } from '../types';
import { CheckCircle2, Circle, Loader2, AlertTriangle, ChevronDown, ChevronUp, Copy, RefreshCw, Eye, FileText, Code } from 'lucide-react';

interface ResultCardProps {
  chunk: ChunkItem;
  onRetry: (id: string) => void;
  systemPrompt: string;
  prePrompt: string;
  model: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  chunk, 
  onRetry,
  systemPrompt,
  prePrompt,
  model
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inputTab, setInputTab] = useState<'raw' | 'preview'>('raw');

  const handleCopy = () => {
    if (chunk.result) {
      navigator.clipboard.writeText(chunk.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusIcon = () => {
    switch (chunk.status) {
      case ProcessingStatus.SUCCESS: return <CheckCircle2 size={18} className="text-emerald-500" />;
      case ProcessingStatus.PROCESSING: return <Loader2 size={18} className="text-primary animate-spin" />;
      case ProcessingStatus.ERROR: return <AlertTriangle size={18} className="text-rose-500" />;
      case ProcessingStatus.WAITING: return <Circle size={18} className="text-slate-300" />;
      default: return <Circle size={18} className="text-slate-200" />;
    }
  };

  const getStatusText = () => {
    switch (chunk.status) {
      case ProcessingStatus.SUCCESS: return 'Completed';
      case ProcessingStatus.PROCESSING: return `Processing...`;
      case ProcessingStatus.ERROR: return 'Failed';
      case ProcessingStatus.WAITING: return 'Queued';
      default: return 'Idle';
    }
  };

  const getStatusColor = () => {
    switch (chunk.status) {
        case ProcessingStatus.SUCCESS: return 'bg-emerald-50 border-emerald-200 text-emerald-700';
        case ProcessingStatus.PROCESSING: return 'bg-indigo-50 border-indigo-200 text-indigo-700';
        case ProcessingStatus.ERROR: return 'bg-rose-50 border-rose-200 text-rose-700';
        default: return 'bg-white border-slate-200 text-slate-600';
    }
  };

  // Construct the preview of what is sent to the API
  const requestPreview = {
    model: model,
    messages: [
      { role: 'system', content: prePrompt ? `${systemPrompt}\n\n${prePrompt}` : systemPrompt },
      { role: 'user', content: chunk.rawContent }
    ]
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md ${chunk.status === ProcessingStatus.PROCESSING ? 'border-primary/50 shadow-primary/10 ring-1 ring-primary/10' : 'border-slate-200'}`}>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer select-none" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-500">
            {chunk.index}
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor()}`}>
             {getStatusIcon()}
             <span>{getStatusText()}</span>
          </div>
          
          {chunk.status === ProcessingStatus.PROCESSING && (
             <span className="text-xs text-slate-400 font-medium animate-pulse">Using {model}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {chunk.status === ProcessingStatus.ERROR && (
            <button onClick={(e) => {e.stopPropagation(); onRetry(chunk.id)}} className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors" title="Retry">
              <RefreshCw size={18} />
            </button>
          )}
          {chunk.status === ProcessingStatus.SUCCESS && (
            <button onClick={(e) => {e.stopPropagation(); handleCopy()}} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors" title="Copy Result">
              {copied ? <CheckCircle2 size={18} className="text-emerald-500"/> : <Copy size={18} />}
            </button>
          )}
          <button className={`p-2 text-slate-300 hover:text-slate-600 rounded-lg transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 border-t border-slate-100 animate-slide-up">
          {/* Left Column: Input & Debug */}
          <div className="flex flex-col bg-slate-50/50 min-h-[240px]">
             <div className="flex items-center px-2 pt-2 border-b border-slate-100 bg-white">
                <button 
                  onClick={() => setInputTab('raw')}
                  className={`flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-t-lg ${inputTab === 'raw' ? 'text-primary bg-slate-50/50 border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                  <FileText size={14} /> Raw Input
                </button>
                <button 
                  onClick={() => setInputTab('preview')}
                  className={`flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-t-lg ${inputTab === 'preview' ? 'text-primary bg-slate-50/50 border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                  <Code size={14} /> Request Preview
                </button>
             </div>

             <div className="p-4 flex-1 relative">
               {inputTab === 'raw' ? (
                 <div className="text-sm text-slate-600 font-mono whitespace-pre-wrap break-words max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                   {chunk.rawContent}
                 </div>
               ) : (
                 <div className="relative h-full">
                   <div className="absolute top-0 right-0 text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2 py-1 rounded border border-slate-200">JSON</div>
                   <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap break-all bg-white p-4 rounded-lg border border-slate-200 shadow-sm max-h-[400px] overflow-y-auto custom-scrollbar">
                     {JSON.stringify(requestPreview, null, 2)}
                   </pre>
                 </div>
               )}
             </div>
          </div>

          {/* Right Column: Output */}
          <div className="p-5 bg-white min-h-[240px] flex flex-col">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
               <Eye size={14} className="text-primary" /> AI Model Output
            </div>
            {chunk.result ? (
                <div className="prose prose-sm prose-indigo max-w-none text-slate-700 flex-1 leading-relaxed">
                    <ReactMarkdown>{chunk.result}</ReactMarkdown>
                </div>
            ) : chunk.errorMsg ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mb-3">
                        <AlertTriangle size={20} className="text-rose-500"/>
                    </div>
                    <p className="text-rose-600 font-medium text-sm">{chunk.errorMsg}</p>
                    <button onClick={() => onRetry(chunk.id)} className="mt-3 text-xs text-slate-500 hover:text-slate-800 underline">Retry this chunk</button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 text-sm">
                    {chunk.status === ProcessingStatus.PROCESSING ? (
                        <div className="flex flex-col items-center animate-pulse">
                          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                              <Loader2 size={24} className="animate-spin text-primary" />
                          </div>
                          <p className="font-medium text-indigo-300">Generating response...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center opacity-50">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                                <Circle size={24} />
                            </div>
                            <p>Waiting to start</p>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};