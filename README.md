# AI Long-Text Flow

AI Long-Text Flow is a professional client-side tool designed to process long texts using Large Language Models (LLMs) like GPT-4. It solves the problem of context windows by intelligently splitting text into manageable chunks and processing them either serially or in parallel.

## Features

### ✂️ Intelligent Slicer
Split your text exactly how you need it:
- **Character Mode**: Split by character count (e.g., every 2000 chars) with smart newline detection to avoid breaking sentences.
- **Line Mode**: Group text by number of lines. Automatically filters out empty lines to ensure data quality.
- **Custom Mode**: Use specific strings or Regex (e.g., `/Chapter \d+/`) as delimiters.

### ⚡ Execution Modes
- **Serial Mode**: Process chunks one by one. Ideal for sequential tasks where order matters or API rate limits are strict.
- **Parallel Mode**: Process multiple chunks simultaneously. Greatly speeds up bulk translation or summarization tasks. Includes a concurrency slider.

### 🧠 Prompt Engineering
- **System Prompt**: Define the persona of the AI (e.g., "You are a professional translator").
- **Pre-Prompt**: Add specific instructions (e.g., "Translate to French:").
- **Injection Strategy**:
  - **Every Chunk**: The prompt is sent with every chunk (default).
  - **First Only**: The prompt is only sent with the first chunk (Serial mode only).

### 🛡️ Privacy & Security
- **Client-Side Processing**: All text splitting and logic happen in your browser.
- **Local Keys**: Your API keys are stored in `localStorage` and sent directly to the API provider. They are never sent to our servers.

### 📊 Transparency
- **Request Preview**: See exactly what JSON payload is being sent to the API.
- **Visual Status**: Track progress, active threads, and success/error states for every chunk.
- **Markdown Support**: View and export results in Markdown format.

## Getting Started

1. **Configure API**: Click the Settings icon and enter your API Key and Base URL (compatible with OpenAI format).
2. **Input Text**: Paste text from clipboard or import a file (.txt, .md).
3. **Slice**: Adjust the splitting settings in the sidebar.
4. **Prompt**: Set your System Prompt and Pre-Prompt.
5. **Run**: Click Start.

## License
MIT