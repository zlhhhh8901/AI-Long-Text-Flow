import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChunkItem, ProcessingStatus } from '../types';
import { CheckCircle, Circle, Loader2, AlertTriangle, ChevronDown, ChevronUp, Copy, RefreshCw, Eye, FileText, Code } from 'lucide-react';

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
      case ProcessingStatus.SUCCESS: return <CheckCircle size={18} className="text-green-500" />;
      case ProcessingStatus.PROCESSING: return <Loader2 size={18} className="text-blue-500 animate-spin" />;
      case ProcessingStatus.ERROR: return <AlertTriangle size={18} className="text-red-500" />;
      case ProcessingStatus.WAITING: return <Circle size={18} className="text-slate-300 fill-slate-100" />;
      default: return <Circle size={18} className="text-slate-200" />;
    }
  };

  const getStatusText = () => {
    switch (chunk.status) {
      case ProcessingStatus.SUCCESS: return 'Completed';
      case ProcessingStatus.PROCESSING: return `Sending to ${model}...`;
      case ProcessingStatus.ERROR: return 'Failed';
      case ProcessingStatus.WAITING: return 'Queued';
      default: return 'Idle';
    }
  };

  const getBorderColor = () => {
    switch (chunk.status) {
        case ProcessingStatus.SUCCESS: return 'border-l-green-500';
        case ProcessingStatus.PROCESSING: return 'border-l-blue-500';
        case ProcessingStatus.ERROR: return 'border-l-red-500';
        default: return 'border-l-slate-300';
    }
  };

  // Construct the preview of what is sent to the API
  const requestPreview = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${prePrompt ? prePrompt + '\n\n' : ''}${chunk.rawContent}` }
    ]
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden transition-all border-l-4 ${getBorderColor()}`}>
      <div className="flex items-center justify-between p-3 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="font-mono text-xs text-slate-500 font-bold">#{chunk.index}</div>
          <div className="flex items-center gap-2">
             {getStatusIcon()}
             <span className={`text-sm font-medium capitalize ${chunk.status === ProcessingStatus.PROCESSING ? 'text-blue-600' : 'text-slate-700'}`}>
                {getStatusText()}
             </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {chunk.status === ProcessingStatus.ERROR && (
            <button onClick={() => onRetry(chunk.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors" title="Retry">
              <RefreshCw size={16} />
            </button>
          )}
          {chunk.status === ProcessingStatus.SUCCESS && (
            <button onClick={handleCopy} className="p-1.5 hover:bg-slate-100 text-slate-500 rounded transition-colors" title="Copy Result">
              {copied ? <CheckCircle size={16} className="text-green-500"/> : <Copy size={16} />}
            </button>
          )}
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded transition-colors">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Left Column: Input & Debug */}
          <div className="flex flex-col bg-slate-50/30 min-h-[200px]">
             <div className="flex items-center border-b border-slate-100 bg-slate-50/50">
                <button 
                  onClick={() => setInputTab('raw')}
                  className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${inputTab === 'raw' ? 'text-primary bg-white border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <FileText size={12} /> Raw Input
                </button>
                <button 
                  onClick={() => setInputTab('preview')}
                  className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${inputTab === 'preview' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Code size={12} /> Request Preview
                </button>
             </div>

             <div className="p-4 flex-1">
               {inputTab === 'raw' ? (
                 <div className="text-sm text-slate-600 font-mono whitespace-pre-wrap break-words max-h-96 overflow-y-auto custom-scrollbar">
                   {chunk.rawContent}
                 </div>
               ) : (
                 <div className="relative">
                   <div className="absolute top-0 right-0 text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">JSON Payload</div>
                   <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap break-all bg-slate-100 p-3 rounded border border-slate-200 max-h-96 overflow-y-auto custom-scrollbar">
                     {JSON.stringify(requestPreview, null, 2)}
                   </pre>
                 </div>
               )}
             </div>
          </div>

          {/* Right Column: Output */}
          <div className="p-4 bg-white min-h-[200px] flex flex-col">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
               <Eye size={12} /> AI Output
            </div>
            {chunk.result ? (
                <div className="prose prose-sm prose-slate max-w-none text-slate-800 flex-1">
                    <ReactMarkdown>{chunk.result}</ReactMarkdown>
                </div>
            ) : chunk.errorMsg ? (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-100">
                    <p className="font-bold mb-1">Error:</p>
                    {chunk.errorMsg}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 text-sm italic">
                    {chunk.status === ProcessingStatus.PROCESSING ? (
                        <>
                          <Loader2 size={24} className="animate-spin mb-2 text-blue-200" />
                          <p>Waiting for {model}...</p>
                        </>
                    ) : 'Waiting to start...'}
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};