# AI Long-Text Flow

[English](#english) | [中文](#中文)

## English

Split long text with multiple **Fragmentation** strategies, then process each chunk with LLMs in **Serial** or **Parallel** execution. Designed for translation, polishing, analysis, and any workflow that runs into token limits or needs higher throughput.

Supports **Google Gemini**, **OpenAI / Custom** (any OpenAI-compatible API). API keys are stored locally in your browser; this project runs entirely on the client.

👉 [Live Demo](https://ai-long-text-flow.vercel.app/)

### Key Features

- **Fragmentation** (choose one):
  - **Chars** — split by fixed character count
  - **Lines** — split by fixed line count
  - **Custom** — split by **Text Rule** (wildcards / `/regex/`) or **Headings** (Markdown headings); optionally **Keep marker**
- **Execution** (choose one):
  - **Parallel** — process multiple chunks at once with a configurable **Concurrency Limit**; prompt injected per chunk
  - **Serial** — process chunks one by one; prompt injected per chunk
  - **Serial + Contextual Memory** — keeps conversation history across chunks; prompt injected only for the first chunk
- **Payload preview** — inspect the full JSON request (see the **Payload** tab)
- **Real-time status** — visual per-chunk state, retry failures, pause/stop anytime

### More Features

- **Merge into Input** — merge completed request/result pairs back into the input for another round (great for iterative polishing)
- **Split Rule Assistant** — describe your split need in natural language and let AI generate the rule
- **Glossary** — bulk import terms and inject matched entries into the effective system prompt for consistent translation
- **Chunks to Combine** — combine small chunks to reduce API calls
- **Export** — Export Original Text / Export All Results / Export Combined (Source + Result), plus **Custom Export**

### Quick Start

```
# 1. Clone & install dependencies
git clone https://github.com/zlhhhh8901/AI-Long-Text-Flow.git
cd AI-Long-Text-Flow && npm install

# 2. Dev
npm run dev

# Build for production
# npm run build
```

### Acknowledgements

The fragmentation module’s UX and layout are inspired by [ChatGPT Automator](https://chatgpt.auto.xiaoyuview.com/). Thanks to the original author for the inspiration.

## 中文

长文本多规则分块，串/并行调用 LLM 处理。解决长文本翻译、润色、分析等场景下的 **Token 限制**和**效率问题**。

支持 Gemini、OpenAI 及任意兼容 API。API Key 仅存浏览器本地，无泄露风险。

👉 [在线体验](https://ai-long-text-flow.vercel.app/)

### 主要功能

- **多规则分块**（任选其一）：
  - 按固定字符数分块
  - 按固定行数分块
  - **自定义** — 支持通配符 / 正则 / Markdown 标题拆分，可选保留或移除分隔符
- **三种执行模式**（任选其一）：
  - **并行** — 多分块同时请求，可控并发数，每个分块独立注入提示词
  - **串行** — 逐块顺序请求，每个分块独立注入提示词
  - **串行 + 连续上下文** — 保持对话记忆，仅首个分块注入提示词，适合需要连贯性的场景
- **请求预览** — 执行工作流程前可检查完整 JSON 负载，方便调试
- **实时状态** — 可视化追踪分块状态，失败可单独重试，流程可随时暂停/终止

### 其他功能

- **往返编辑** — 合并请求与结果进行新一轮处理，适用于迭代润色等场景
- **文本分块助手** — 用自然语言描述需求，AI 生成分割规则
- **术语表** — 批量导入术语并自动注入提示词，确保翻译一致性
- **文本块合并** — 按规则合并小分块，减少 API 调用次数
- **灵活导出** — 纯结果 / 原文+结果对照 / 自定义格式

### 快速开始

```
# 1. 克隆并安装依赖
git clone https://github.com/zlhhhh8901/AI-Long-Text-Flow.git
cd AI-Long-Text-Flow && npm install

# 2. 开发模式
npm run dev

# 构建生产版本
# npm run build
```

### 致谢

文本分块模块的功能设计与界面布局参考 [ChatGPT Automator](https://chatgpt.auto.xiaoyuview.com/)，感谢原作者的启发。


