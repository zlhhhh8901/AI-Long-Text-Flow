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

export interface ChunkItem {
  id: string;
  index: number;
  rawContent: string;
  status: ProcessingStatus;
  result?: string;
  errorMsg?: string;
}

export interface AppConfig {
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
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o',
  temperature: 0.7,
  systemPrompt: 'You are a helpful assistant. Process the following text fragment.',
  concurrencyLimit: 3,
};

export const DEFAULT_SPLIT_CONFIG: SplitConfig = {
  mode: SplitMode.CHARACTER,
  chunkSize: 2000,
  lineCount: 10,
  customSeparator: '###',
  batchSize: 1,
};