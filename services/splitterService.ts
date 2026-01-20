import { ChunkItem, ProcessingStatus, SplitConfig, SplitMode } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const globToRegExpSource = (pattern: string) => {
  let out = '';
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === '\\') {
      const next = pattern[i + 1];
      if (typeof next === 'string') {
        out += escapeRegExp(next);
        i++;
      } else {
        out += '\\\\';
      }
      continue;
    }
    if (ch === '*') {
      out += '[\\s\\S]*?';
      continue;
    }
    if (ch === '?') {
      out += '[\\s\\S]';
      continue;
    }
    out += escapeRegExp(ch);
  }
  return out;
};

const parseRegexLiteral = (input: string): { body: string; flags: string } | null => {
  if (!input.startsWith('/')) return null;

  let escaped = false;
  let inCharClass = false;
  let closingSlashIndex = -1;

  for (let i = 1; i < input.length; i++) {
    const ch = input[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '[') {
      inCharClass = true;
      continue;
    }
    if (ch === ']') {
      inCharClass = false;
      continue;
    }
    if (ch === '/' && !inCharClass) {
      closingSlashIndex = i;
      break;
    }
  }

  if (closingSlashIndex <= 0) return null;

  const body = input.slice(1, closingSlashIndex);
  const flags = input.slice(closingSlashIndex + 1);
  return { body, flags };
};

const normalizeGlobalFlags = (flags: string) => {
  // Ensure global matching for iterative splitting; remove sticky flag.
  const cleaned = flags.replace(/y/g, '');
  return cleaned.includes('g') ? cleaned : `${cleaned}g`;
};

const splitByRegexKeepMatch = (text: string, regex: RegExp): string[] => {
  const r = regex.global ? regex : new RegExp(regex.source, `${regex.flags}g`);
  const chunks: string[] = [];
  let cursor = 0;

  for (const match of text.matchAll(r)) {
    const index = match.index ?? -1;
    if (index < 0) continue;
    chunks.push(text.slice(cursor, index));
    cursor = index;
    if (match[0].length === 0) {
      r.lastIndex = Math.min(text.length, (r.lastIndex || 0) + 1);
    }
  }

  chunks.push(text.slice(cursor));
  return chunks;
};

const splitByRegexDiscardMatch = (text: string, regex: RegExp): string[] => {
  const r = regex.global ? regex : new RegExp(regex.source, `${regex.flags}g`);
  const chunks: string[] = [];
  let cursor = 0;

  for (const match of text.matchAll(r)) {
    const index = match.index ?? -1;
    if (index < 0) continue;
    chunks.push(text.slice(cursor, index));
    cursor = index + match[0].length;
    if (match[0].length === 0) {
      r.lastIndex = Math.min(text.length, (r.lastIndex || 0) + 1);
    }
  }

  chunks.push(text.slice(cursor));
  return chunks;
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
        const ruleType = config.customRuleType ?? 'text';

        if (ruleType === 'heading') {
          const level = config.customHeadingLevel ?? 2;
          const headingRegex = new RegExp(`^#{${level}}(?!#)`, 'gm');
          rawChunks = splitByRegexKeepMatch(text, headingRegex);
          break;
        }

        const sep = config.customSeparator ?? '';
        const keep = config.customKeepSeparator ?? true;

        const parsed = parseRegexLiteral(sep);
        let regex: RegExp;
        if (parsed) {
          const flags = normalizeGlobalFlags(parsed.flags);
          regex = new RegExp(parsed.body, flags);
        } else {
          const source = globToRegExpSource(sep);
          regex = new RegExp(source, 'g');
        }

        rawChunks = keep ? splitByRegexKeepMatch(text, regex) : splitByRegexDiscardMatch(text, regex);
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
