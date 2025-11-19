import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChunkItem, ProcessingStatus } from '../types';
import { CheckCircle, Circle, Loader2, AlertTriangle, ChevronDown, ChevronUp, Copy, RefreshCw } from 'lucide-react';

interface ResultCardProps {
  chunk: ChunkItem;
  onRetry: (id: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ chunk, onRetry }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const getBorderColor = () => {
    switch (chunk.status) {
        case ProcessingStatus.SUCCESS: return 'border-l-green-500';
        case ProcessingStatus.PROCESSING: return 'border-l-blue-500';
        case ProcessingStatus.ERROR: return 'border-l-red-500';
        default: return 'border-l-slate-300';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden transition-all border-l-4 ${getBorderColor()}`}>
      <div className="flex items-center justify-between p-3 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="font-mono text-xs text-slate-500 font-bold">#{chunk.index}</div>
          <div className="flex items-center gap-2">
             {getStatusIcon()}
             <span className="text-sm font-medium text-slate-700 capitalize">{chunk.status}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Input */}
          <div className="p-4 bg-slate-50/30">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Input Segment</div>
             <div className="text-sm text-slate-600 font-mono whitespace-pre-wrap break-words max-h-64 overflow-y-auto custom-scrollbar">
               {chunk.rawContent}
             </div>
          </div>

          {/* Output */}
          <div className="p-4 bg-white min-h-[150px]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">AI Output</div>
            {chunk.result ? (
                <div className="prose prose-sm prose-slate max-w-none text-slate-800">
                    <ReactMarkdown>{chunk.result}</ReactMarkdown>
                </div>
            ) : chunk.errorMsg ? (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-100">
                    {chunk.errorMsg}
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-300 text-sm italic">
                    {chunk.status === ProcessingStatus.PROCESSING ? 'Generating...' : 'Waiting to start...'}
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};