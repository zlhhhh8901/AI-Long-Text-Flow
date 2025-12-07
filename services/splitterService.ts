import { ChunkItem, ProcessingStatus, SplitConfig, SplitMode } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const splitText = (text: string, config: SplitConfig): ChunkItem[] => {
  let rawChunks: string[] = [];

  switch (config.mode) {
    case SplitMode.CHARACTER: {
      const size = config.chunkSize || 2000;
      let currentIndex = 0;
      while (currentIndex < text.length) {
        // Simple slice for now, but in a real app we'd look for nearest newline/sentence end
        // to avoid cutting words in half if possible, but hard limit is safer for token counts.
        let end = Math.min(currentIndex + size, text.length);
        
        // Try to find a newline near the end to break cleanly
        if (end < text.length) {
            const lookback = text.lastIndexOf('\n', end);
            if (lookback > currentIndex + size * 0.8) { // Only look back if it's not too far
                end = lookback + 1;
            }
        }
        
        rawChunks.push(text.slice(currentIndex, end));
        currentIndex = end;
      }
      break;
    }
    case SplitMode.LINE: {
      // Split by newline
      // Filter out empty lines (or whitespace only) so they don't count as chunks
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      const perChunk = config.lineCount || 10;
      for (let i = 0; i < lines.length; i += perChunk) {
        rawChunks.push(lines.slice(i, i + perChunk).join('\n'));
      }
      break;
    }
    case SplitMode.CUSTOM: {
      try {
        const sep = config.customSeparator;
        let regex: RegExp;

        // Check if it looks like a regex literal: /pattern/flags
        // We look for the first and last slash to extract body and flags
        const firstSlash = sep.indexOf('/');
        const lastSlash = sep.lastIndexOf('/');

        if (firstSlash === 0 && lastSlash > 0 && lastSlash > firstSlash) {
            // It is a regex provided by user, e.g. /Chapter \d+/i
            const body = sep.substring(firstSlash + 1, lastSlash);
            const flags = sep.substring(lastSlash + 1);
            
            // Use Lookahead (?=...) to split *before* the match.
            // This ensures the match itself is kept and attached to the start of the following chunk.
            regex = new RegExp(`(?=${body})`, flags);
        } else {
            // String literal
            // Escape special chars and wrap in lookahead
            regex = new RegExp(`(?=${escapeRegExp(sep)})`);
        }
        
        rawChunks = text.split(regex);
      } catch (e) {
        console.error("Split error", e);
        rawChunks = [text];
      }
      break;
    }
    default:
      rawChunks = [text];
  }

  // Filter out purely whitespace chunks
  // This acts as a final sanitizer for all modes
  const cleanChunks = rawChunks.filter(c => c.trim().length > 0);

  // Apply Batching
  const batchedChunks: string[] = [];
  const batchSize = Math.max(1, config.batchSize);
  
  for (let i = 0; i < cleanChunks.length; i += batchSize) {
    // Trim chunks to prevent stacking newlines (e.g. \n\n\n\n\n\n)
    batchedChunks.push(cleanChunks.slice(i, i + batchSize).map(c => c.trim()).join('\n\n'));
  }

  // Convert to ChunkItems
  return batchedChunks.map((content, index) => ({
    id: generateId(),
    index: index + 1,
    rawContent: content.trim(),
    status: ProcessingStatus.IDLE,
  }));
};