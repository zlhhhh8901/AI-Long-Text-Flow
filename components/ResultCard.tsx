import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChunkItem, ProcessingStatus } from '../types';
import { CheckCircle2, Circle, Loader2, AlertTriangle, ChevronDown, Copy, RefreshCw, Terminal, ArrowRight, History } from 'lucide-react';

interface ResultCardProps {
  chunk: ChunkItem;
  onRetry: (id: string) => void;
  systemPrompt: string;
  prePrompt: string;
  model: string;
  isContextual?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  chunk, 
  onRetry,
  systemPrompt,
  prePrompt,
  model,
  isContextual = false
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
      case ProcessingStatus.SUCCESS: return <CheckCircle2 size={14} className="text-emerald-500" />;
      case ProcessingStatus.PROCESSING: return <Loader2 size={14} className="text-primary animate-spin" />;
      case ProcessingStatus.ERROR: return <AlertTriangle size={14} className="text-rose-500" />;
      case ProcessingStatus.WAITING: return <Circle size={14} className="text-slate-300" />;
      default: return <Circle size={14} className="text-slate-200" />;
    }
  };

  const getStatusColor = () => {
    switch (chunk.status) {
        case ProcessingStatus.SUCCESS: return 'bg-emerald-50/50 border-emerald-200 text-emerald-700';
        case ProcessingStatus.PROCESSING: return 'bg-indigo-50/50 border-indigo-200 text-indigo-700';
        case ProcessingStatus.ERROR: return 'bg-rose-50/50 border-rose-200 text-rose-700';
        default: return 'bg-slate-50 border-slate-200 text-slate-500';
    }
  };

  // Construct the preview of what is sent to the API
  let requestPreview: any = {};

  if (isContextual) {
      const userContent = prePrompt ? `${prePrompt}\n\n${chunk.rawContent}` : chunk.rawContent;
      if (chunk.index === 1) {
           requestPreview = {
               mode: 'Contextual Session (Start)',
               system_instruction: systemPrompt || undefined,
               new_user_message: userContent
           };
      } else {
           requestPreview = {
               mode: 'Contextual Session (Continue)',
               previous_context_turns: (chunk.index - 1) * 2,
               new_user_message: userContent
           };
      }
  } else {
      const systemParts = [systemPrompt, prePrompt].filter(p => p && p.trim().length > 0);
      const combinedSystemPrompt = systemParts.join('\n\n');

      requestPreview = {
        model: model,
        mode: 'Independent Request',
        messages: [
          ...(combinedSystemPrompt ? [{ role: 'system', content: combinedSystemPrompt }] : []),
          { role: 'user', content: chunk.rawContent }
        ]
      };
  }

  const hasOutput = !!chunk.result || !!chunk.errorMsg || chunk.status === ProcessingStatus.PROCESSING;

  return (
    <div className={`bg-white rounded-lg shadow-sm border transition-all duration-200 ${chunk.status === ProcessingStatus.PROCESSING ? 'border-primary/50 shadow-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
      {/* Header - Compact */}
      <div 
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none group" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] font-bold text-slate-500 group-hover:bg-slate-200 transition-colors">
            {chunk.index}
          </div>
          
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusColor()}`}>
             {getStatusIcon()}
             <span>{chunk.status}</span>
          </div>
          
          {chunk.status === ProcessingStatus.PROCESSING && (
             <span className="text-[10px] text-slate-400 animate-pulse hidden sm:inline-block">Processing with {model}...</span>
          )}
          
          {isContextual && (
             <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-semibold">
                 <History size={10}/>
                 <span>Context</span>
             </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {chunk.status === ProcessingStatus.ERROR && (
            <button 
              onClick={(e) => {e.stopPropagation(); onRetry(chunk.id)}} 
              className="p-1.5 hover:bg-rose-50 text-rose-500 rounded transition-colors" 
              title="Retry"
            >
              <RefreshCw size={14} />
            </button>
          )}
          {chunk.status === ProcessingStatus.SUCCESS && (
            <button 
              onClick={(e) => {e.stopPropagation(); handleCopy()}} 
              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded transition-colors" 
              title="Copy Result"
            >
              {copied ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Copy size={14} />}
            </button>
          )}
          <div className={`p-1 text-slate-300 hover:text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Content Body */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-slate-100 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 animate-slide-up">
          
          {/* Left Column: Input (Full width if no output yet) */}
          <div className={`${hasOutput ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col bg-slate-50/30 min-h-[180px] transition-all duration-300`}>
             {/* Mini Toolbar */}
             <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100/50 bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal size={12} /> Input Source
                </span>
                <div className="flex bg-white p-0.5 rounded border border-slate-200">
                    <button 
                        onClick={() => setInputTab('raw')}
                        className={`px-2 py-0.5 text-[9px] font-semibold rounded transition-all ${inputTab === 'raw' ? 'bg-slate-100 text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Raw
                    </button>
                    <button 
                        onClick={() => setInputTab('preview')}
                        className={`px-2 py-0.5 text-[9px] font-semibold rounded transition-all ${inputTab === 'preview' ? 'bg-indigo-50 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Payload
                    </button>
                </div>
             </div>

             <div className="relative flex-1">
               {inputTab === 'raw' ? (
                 <div className="absolute inset-0 p-3 overflow-y-auto custom-scrollbar">
                    <p className="text-xs text-slate-600 font-mono whitespace-pre-wrap break-words leading-relaxed">
                        {chunk.rawContent}
                    </p>
                 </div>
               ) : (
                 <div className="absolute inset-0 p-3 overflow-y-auto custom-scrollbar bg-slate-50/50">
                   <pre className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap break-all">
                     {JSON.stringify(requestPreview, null, 2)}
                   </pre>
                 </div>
               )}
             </div>
          </div>

          {/* Right Column: Output (Only shown if there is activity/result) */}
          {hasOutput && (
            <div className="lg:col-span-7 bg-white min-h-[180px] flex flex-col relative animate-fade-in">
                {chunk.result ? (
                    <div className="p-4 flex-1">
                        <div className="prose prose-sm prose-slate max-w-none prose-p:my-2 prose-headings:my-3 text-sm leading-relaxed text-slate-700">
                            <ReactMarkdown>{chunk.result}</ReactMarkdown>
                        </div>
                    </div>
                ) : chunk.errorMsg ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center mb-2">
                            <AlertTriangle size={16} className="text-rose-500"/>
                        </div>
                        <p className="text-rose-600 font-medium text-xs">{chunk.errorMsg}</p>
                        <button onClick={() => onRetry(chunk.id)} className="mt-2 text-[10px] bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 text-slate-500">Retry</button>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 pointer-events-none select-none">
                         <Loader2 size={20} className="animate-spin text-primary mb-2" />
                         <p className="text-xs font-medium text-slate-400">Generating Response...</p>
                    </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};