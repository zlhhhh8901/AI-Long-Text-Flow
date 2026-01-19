import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChunkItem, ProcessingStatus } from '../types';
import { Check, Circle, Loader2, AlertCircle, ChevronDown, Copy, RefreshCw, Terminal, History, ArrowRight } from 'lucide-react';

interface ResultCardProps {
  chunk: ChunkItem;
  onRetry: (id: string) => void;
  effectiveSystemPrompt: string;
  model: string;
  isContextual?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  chunk, 
  onRetry,
  effectiveSystemPrompt,
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

  const getStatusDisplay = () => {
    switch (chunk.status) {
      case ProcessingStatus.SUCCESS: 
        return { icon: <Check size={12} />, color: 'bg-brand-green/10 text-brand-green border-brand-green/20', text: 'Completed' };
      case ProcessingStatus.PROCESSING: 
        return { icon: <Loader2 size={12} className="animate-spin" />, color: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20', text: 'Thinking' };
      case ProcessingStatus.ERROR: 
        return { icon: <AlertCircle size={12} />, color: 'bg-rose-50 text-rose-600 border-rose-100', text: 'Interrupted' };
      case ProcessingStatus.WAITING: 
        return { icon: <Circle size={12} />, color: 'bg-stone-100 text-stone-400 border-stone-200', text: 'Queued' };
      default: 
        return { icon: <Circle size={12} />, color: 'bg-stone-50 text-stone-300 border-stone-200', text: 'Idle' };
    }
  };

  const status = getStatusDisplay();

  const finalUserMessage = chunk.rawContent;

  let requestPreview: any = {};
  if (isContextual) {
      requestPreview = {
          mode: chunk.index === 1 ? 'Contextual (Start)' : 'Contextual (Continue)',
          context_depth: chunk.index > 1 ? `${(chunk.index - 1)} turns` : 'None',
          system: (chunk.index === 1 && effectiveSystemPrompt?.trim()) ? effectiveSystemPrompt.trim() : undefined,
          message: finalUserMessage
      };
  } else {
      requestPreview = {
        model: model,
        system: effectiveSystemPrompt?.trim() ? effectiveSystemPrompt.trim() : undefined,
        message: finalUserMessage
      };
  }

  const hasOutput = !!chunk.result || !!chunk.errorMsg || chunk.status === ProcessingStatus.PROCESSING;

  return (
    <div className={`group bg-white rounded-xl transition-all duration-300 overflow-hidden ${chunk.status === ProcessingStatus.PROCESSING ? 'shadow-glow ring-1 ring-brand-orange/30' : 'shadow-card hover:shadow-soft'}`}>
      
      {/* Header */}
      <div 
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-sans text-xs font-bold transition-colors ${chunk.status === ProcessingStatus.SUCCESS ? 'bg-brand-dark text-white' : 'bg-stone-100 text-stone-500'}`}>
            {chunk.index}
          </div>
          
          <div className="flex flex-col gap-0.5">
             <div className="flex items-center gap-2 font-sans">
                 <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${status.color}`}>
                    {status.icon}
                    <span>{status.text}</span>
                 </span>
                 {isContextual && (
                    <span className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                        <ArrowRight size={10} className="text-stone-300" /> Linked
                    </span>
                 )}
             </div>
             {chunk.status === ProcessingStatus.PROCESSING && (
                 <span className="text-[10px] text-stone-400 animate-pulse ml-1 font-serif italic">Refining output...</span>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {chunk.status === ProcessingStatus.ERROR && (
            <button 
              onClick={(e) => {e.stopPropagation(); onRetry(chunk.id)}} 
              className="p-2 hover:bg-rose-50 text-rose-500 rounded-full transition-colors" 
              title="Retry"
            >
              <RefreshCw size={14} />
            </button>
          )}
          {chunk.status === ProcessingStatus.SUCCESS && (
            <button 
              onClick={(e) => {e.stopPropagation(); handleCopy()}} 
              className="p-2 hover:bg-stone-100 text-stone-400 hover:text-stone-600 rounded-full transition-colors" 
              title="Copy"
            >
              {copied ? <Check size={14} className="text-brand-green"/> : <Copy size={14} />}
            </button>
          )}
          <div className={`p-2 text-stone-300 hover:text-stone-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Content Body */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 animate-slide-up border-t border-stone-100">
          
          {/* Left Column: Input */}
          <div className={`${hasOutput ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col bg-brand-light min-h-[200px] border-r border-stone-100`}>
             <div className="flex items-center justify-between px-4 py-2 border-b border-stone-200/50">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-sans">
                    Source
                </span>
                <div className="flex gap-2 font-sans">
                    <button 
                        onClick={() => setInputTab('raw')}
                        className={`text-[10px] font-semibold transition-colors ${inputTab === 'raw' ? 'text-brand-orange' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        Original
                    </button>
                    <span className="text-stone-300">/</span>
                    <button 
                        onClick={() => setInputTab('preview')}
                        className={`text-[10px] font-semibold transition-colors ${inputTab === 'preview' ? 'text-brand-orange' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        Payload
                    </button>
                </div>
             </div>

             <div className="relative flex-1">
               {inputTab === 'raw' ? (
                 <div className="absolute inset-0 p-5 overflow-y-auto custom-scrollbar">
                    <p className="text-sm text-stone-600 font-serif whitespace-pre-wrap break-words leading-relaxed">
                        {chunk.rawContent}
                    </p>
                 </div>
               ) : (
                 <div className="absolute inset-0 p-5 overflow-y-auto custom-scrollbar bg-stone-100/30">
                   <pre className="text-[10px] text-stone-500 font-mono whitespace-pre-wrap break-all">
                     {JSON.stringify(requestPreview, null, 2)}
                   </pre>
                 </div>
               )}
             </div>
          </div>

          {/* Right Column: Output */}
          {hasOutput && (
            <div className="lg:col-span-7 bg-white min-h-[200px] flex flex-col relative">
                {chunk.result ? (
                    <div className="p-6 flex-1">
                        <div className="prose prose-sm prose-stone max-w-none prose-p:my-3 prose-headings:font-sans prose-headings:font-bold prose-headings:text-brand-dark text-stone-700 leading-7 font-serif">
                            <ReactMarkdown>{chunk.result}</ReactMarkdown>
                        </div>
                    </div>
                ) : chunk.errorMsg ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center mb-3">
                            <AlertCircle size={18} className="text-rose-400"/>
                        </div>
                        <p className="text-rose-600 font-medium text-sm font-serif">{chunk.errorMsg}</p>
                        <button onClick={() => onRetry(chunk.id)} className="mt-3 text-xs px-3 py-1.5 bg-white border border-rose-100 text-rose-500 rounded-lg hover:bg-rose-50 transition-colors font-sans font-medium">Try Again</button>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-60 pointer-events-none select-none">
                         <div className="relative">
                            <Loader2 size={24} className="animate-spin text-brand-orange relative z-10" />
                         </div>
                         <p className="text-xs font-serif italic text-stone-400 mt-4 tracking-wide">Synthesizing...</p>
                    </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
