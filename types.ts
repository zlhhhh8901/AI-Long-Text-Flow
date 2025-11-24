export enum SplitMode {
  CHARACTER = 'character',
  LINE = 'line',
  CUSTOM = 'custom',
}

export enum ProcessingStatus {
  IDLE = 'idle',
  WAITING = 'waiting',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type PromptMode = 'every' | 'first';
export type ModelProvider = 'openai' | 'gemini';

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
}

export interface SplitConfig {
  mode: SplitMode;
  chunkSize: number; // For character mode
  lineCount: number; // For line mode
  customSeparator: string; // For custom mode
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
};

export const DEFAULT_SPLIT_CONFIG: SplitConfig = {
  mode: SplitMode.CHARACTER,
  chunkSize: 2000,
  lineCount: 10,
  customSeparator: '###',
  batchSize: 1,
};