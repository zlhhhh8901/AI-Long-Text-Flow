export enum SplitMode {
  CHARACTER = 'character',
  LINE = 'line',
  CUSTOM = 'custom',
}

export type CustomSplitRuleType = 'text' | 'heading';

export enum ProcessingStatus {
  IDLE = 'idle',
  WAITING = 'waiting',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type ModelProvider = 'openai' | 'gemini';

export type Language = 'en' | 'zh';

export interface ChunkItem {
  id: string;
  index: number;
  rawContent: string;
  status: ProcessingStatus;
  result?: string;
  errorMsg?: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

export interface AppConfig {
  provider: ModelProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  concurrencyLimit: number;
  language: Language;
}

export interface SplitConfig {
  mode: SplitMode;
  chunkSize: number; // For character mode
  lineCount: number; // For line mode
  // --- Custom mode ---
  customRuleType: CustomSplitRuleType;
  // Text-rule input. Supports:
  // - Plain markers with * and ? wildcards (escape with \* and \?)
  // - Native regex literal syntax: /pattern/flags
  customSeparator: string;
  // If true, keep the matched marker and attach it to the start of the next chunk.
  // (Heading mode always keeps and ignores this.)
  customKeepSeparator: boolean;
  // Heading level to split on (1..6). Matches only line-start headings, e.g. ^## (not ^###).
  customHeadingLevel: 1 | 2 | 3 | 4 | 5 | 6;
  batchSize: number; // How many chunks to combine per request
}

export const DEFAULT_CONFIG: AppConfig = {
  provider: 'gemini',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  systemPrompt: '',
  concurrencyLimit: 3,
  language: 'en',
};

export const DEFAULT_SPLIT_CONFIG: SplitConfig = {
  mode: SplitMode.CHARACTER,
  chunkSize: 2000,
  lineCount: 10,
  customRuleType: 'text',
  customSeparator: '###',
  customKeepSeparator: true,
  customHeadingLevel: 2,
  batchSize: 1,
};
