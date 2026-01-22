# AI Long-Text Flow

<div align="center">

**A professional web tool for processing long texts with Large Language Models**

[English](#english) | [中文](#中文)

[![GitHub](https://img.shields.io/badge/GitHub-Project-blue?logo=github)](https://github.com/yourusername/AI-Long-Text-Flow)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#license)

</div>

---

## English

### Overview

**AI Long-Text Flow** is a browser-based tool designed to solve a critical challenge: **how to reliably process long documents with LLMs (like Gemini, GPT) when context windows are limited**.

Instead of manually splitting text, copying chunks, and pasting results, this tool provides an automated workflow for text segmentation, API orchestration, prompt injection, and result management—all running locally in your browser.

### Key Features

#### 🔪 Intelligent Text Splitting

Multiple splitting strategies to match different use cases:

- **Character Mode**
  - Split by character count (e.g., every 2000 characters)
  - Smart boundary detection: prioritizes splitting at paragraph or sentence endings
  - Preserves semantic integrity

- **Line Mode**
  - Split by line count (e.g., every 10 lines)
  - Automatically filters empty lines
  - Maintains compact context

- **Custom Mode**
  - Split by custom separators or regex patterns
  - Examples: `Chapter \d+`, `## .*` (markdown headings)
  - **Text Rule**: Use plain text markers with wildcards (`Part*`) or regex (`/Part\s\w+/i`)
  - **Heading Rule**: Split by markdown heading levels (H1-H6)
  - Option to keep or remove separators

- **Batch Processing**
  - Combine multiple small chunks into a single API request
  - Reduces API calls and costs while staying within context limits

#### ⚡ Flexible Execution Modes

Choose the right processing strategy for your task:

- **Parallel Mode**
  - Process multiple chunks simultaneously
  - Adjustable concurrency limit to respect API rate limits
  - Ideal for independent translations, summaries, or edits

- **Serial Mode**
  - Process chunks sequentially in order
  - **Contextual Memory**: Maintains conversation history across chunks
  - Perfect for novels, narratives, or content requiring continuity
  - The model "remembers" previous chunks for better coherence

#### 🎯 Advanced Prompt Engineering

- **System Prompt**: Define a global prompt that applies to all chunks
  - Example: *"You are a professional editor. Polish the input text while preserving markdown structure."*

- **Glossary Management**
  - Define terms and their translations/definitions
  - Automatically injected into the effective system prompt
  - Bulk import support (CSV format: `Term, Definition`)
  - Works with Excel copy-paste
  - Customizable glossary prompt template

- **AI-Powered Split Rule Assistant**
  - Describe your splitting needs in natural language
  - Provide sample text
  - AI generates and previews custom split rules
  - Apply with one click

#### 📊 Visual Result Management

- **Real-time Status Tracking**
  - Visual indicators: Queued / Processing / Success / Error
  - Progress counter
  - Individual chunk retry on failure

- **Payload Preview**
  - Inspect the exact JSON payload before sending to API
  - Useful for debugging prompts and parameters

- **Flexible Export Options**
  - Copy all results to clipboard
  - Export as Markdown:
    - Results only
    - Original text only
    - Combined (source + result side-by-side for review)

#### 🔒 Privacy-Focused Design

- **100% Client-Side Processing**
  - All logic runs in your browser
  - No backend server
  - Your text goes directly from browser to your chosen AI provider

- **Local Storage Only**
  - API keys stored in browser localStorage
  - Never uploaded to any third-party server
  - You maintain full control of your data

#### 🌐 Multi-Provider Support

- **Google Gemini**
  - Native support for Gemini API
  - Pre-configured models: `gemini-2.5-flash`, `gemini-2.5-pro`

- **OpenAI / Custom APIs**
  - Support for OpenAI API
  - Compatible with any OpenAI-compatible API
  - Configurable base URL and model name
  - CORS guidance for custom endpoints

#### 🌍 Bilingual Interface

- Full English and Chinese language support
- Switch languages in settings
- All UI elements and messages translated

### Getting Started

#### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- API key from Google Gemini or OpenAI

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AI-Long-Text-Flow.git
   cd AI-Long-Text-Flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

#### Usage Guide

**Step 1: Configure API**

1. Click the settings icon (⚙️) in the top-right corner
2. Select your AI provider (Google Gemini or OpenAI/Custom)
3. Enter your API key
4. (Optional) Adjust model name, temperature, and other parameters
5. Click "Save Changes"

> 🔒 **Security Note**: Your API key is stored only in your browser's localStorage and never leaves your device.

**Step 2: Import Text**

- **Paste**: Click "Paste Text" button or use the paste modal
- **Drag & Drop**: Drop `.txt` or `.md` files directly onto the page

**Step 3: Configure Text Splitting**

In the left sidebar:

1. Choose splitting mode:
   - **Chars**: Set chunk size (e.g., 2000 characters)
   - **Lines**: Set lines per chunk (e.g., 10 lines)
   - **Custom**: Use the AI-powered Split Rule Assistant or manually configure:
     - Text Rule: Enter separator pattern (supports wildcards and regex)
     - Heading Rule: Select heading level (H1-H6)

2. (Optional) Set batch size to combine multiple chunks per request

**Step 4: Write Your Prompt**

1. In the "Prompt" section, enter your system prompt
   - Example: *"Translate to simplified Chinese while maintaining a natural tone"*
   - Example: *"Summarize each section in 2-3 sentences"*

2. (Optional) Manage glossary terms:
   - Click "Manage Terms"
   - Add individual terms or bulk import
   - Terms will be automatically injected into prompts

**Step 5: Choose Execution Mode**

1. Select **Serial** or **Parallel** mode
2. For parallel mode: adjust concurrency limit (default: 3)
3. For serial mode: enable "Contextual Memory" if you need continuity across chunks

**Step 6: Process and Export**

1. Click "Start" to begin processing
2. Monitor real-time status for each chunk
3. Retry individual chunks if errors occur
4. When complete:
   - Copy results to clipboard
   - Export as Markdown (results only, original only, or combined)

### Technical Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **UI Components**: Lucide React (icons)
- **Markdown**: react-markdown
- **AI SDKs**: @google/genai, OpenAI-compatible APIs

### Use Cases

- **Translation**: Translate long documents while maintaining consistency
- **Content Editing**: Polish or rewrite lengthy articles
- **Summarization**: Generate summaries for long reports or books
- **Format Conversion**: Convert between different markdown styles
- **Novel Processing**: Process serialized novels with contextual continuity
- **Technical Documentation**: Translate or improve technical docs with glossary support

### FAQ

**Q: Do I need to install software?**
A: No. AI Long-Text Flow is a web application that runs entirely in your browser.

**Q: Is my data uploaded to your servers?**
A: No. There are no servers. All processing happens locally in your browser, and API requests go directly from your browser to your chosen AI provider (Google, OpenAI, etc.).

**Q: What about CORS errors?**
A: The official OpenAI API supports CORS. If you're using a custom API that doesn't support CORS, you can:
- Set up a backend proxy server
- Use a browser extension like "CORS Unblock"
- Contact your API provider for CORS support

**Q: Can I use this offline?**
A: The app itself can run offline after initial load, but you need an internet connection to make API calls to AI providers.

**Q: How much does it cost?**
A: The tool is free and open-source. You only pay for API usage from your chosen provider (Google Gemini, OpenAI, etc.).

### Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### License

MIT License - see LICENSE file for details

---

## 中文

### 项目简介

**AI Long-Text Flow** 是一个基于浏览器的工具，专为解决一个核心问题而设计：**在上下文窗口有限的情况下，如何稳定地使用大语言模型（如 Gemini、GPT）处理长文本**。

无需手动拆分文本、复制粘贴片段，本工具提供了文本分割、API 调度、提示词注入和结果管理的自动化工作流——所有操作都在浏览器本地运行。

### 核心功能

#### 🔪 智能文本分割

提供多种分割策略以适应不同场景：

- **字符模式**
  - 按字符数拆分（如每 2000 字符）
  - 智能边界检测：优先在段落或句子末尾截断
  - 保持语义完整性

- **行模式**
  - 按行数拆分（如每 10 行）
  - 自动过滤空行
  - 保持上下文紧凑

- **自定义模式**
  - 使用自定义分隔符或正则表达式分割
  - 示例：`第\d+章`、`## .*`（Markdown 标题）
  - **文本规则**：使用纯文本标记配合通配符（`Part*`）或正则表达式（`/Part\s\w+/i`）
  - **标题规则**：按 Markdown 标题级别分割（H1-H6）
  - 可选择保留或移除分隔符

- **批处理**
  - 将多个小分块合并为单个 API 请求
  - 在不超出上下文限制的前提下减少 API 调用次数和成本

#### ⚡ 灵活的执行模式

根据任务需求选择合适的处理策略：

- **并行模式**
  - 同时处理多个分块
  - 可调节并发限制以遵守 API 速率限制
  - 适用于独立的翻译、摘要或编辑任务

- **串行模式**
  - 按顺序逐块处理
  - **连续上下文**：在分块之间保持对话历史
  - 适用于小说、叙事文本或需要连贯性的内容
  - 模型会"记住"之前的分块以保持更好的连贯性

#### 🎯 高级提示词工程

- **系统提示词**：定义应用于所有分块的全局提示词
  - 示例：*"你是一名专业编辑。请润色输入文本，同时保留 Markdown 结构。"*

- **术语表管理**
  - 定义术语及其翻译/定义
  - 自动注入到有效系统提示词中
  - 支持批量导入（CSV 格式：`术语, 定义`）
  - 支持从 Excel 复制粘贴
  - 可自定义术语表提示词模板

- **AI 驱动的分割规则助手**
  - 用自然语言描述分割需求
  - 提供示例文本
  - AI 生成并预览自定义分割规则
  - 一键应用

#### 📊 可视化结果管理

- **实时状态跟踪**
  - 可视化指示器：排队中 / 处理中 / 成功 / 错误
  - 进度计数器
  - 失败时可单独重试分块

- **请求预览**
  - 在发送到 API 之前检查完整的 JSON 负载
  - 便于调试提示词和参数

- **灵活的导出选项**
  - 复制所有结果到剪贴板
  - 导出为 Markdown：
    - 仅结果
    - 仅原文
    - 组合（源文本 + 结果并排显示，便于审阅）

#### 🔒 注重隐私的设计

- **100% 客户端处理**
  - 所有逻辑在浏览器中运行
  - 无后端服务器
  - 文本直接从浏览器发送到您选择的 AI 提供商

- **仅本地存储**
  - API 密钥存储在浏览器 localStorage 中
  - 永不上传到任何第三方服务器
  - 您完全控制自己的数据

#### 🌐 多提供商支持

- **Google Gemini**
  - 原生支持 Gemini API
  - 预配置模型：`gemini-2.5-flash`、`gemini-2.5-pro`

- **OpenAI / 自定义 API**
  - 支持 OpenAI API
  - 兼容任何 OpenAI 兼容的 API
  - 可配置基础 URL 和模型名称
  - 提供自定义端点的 CORS 指导

#### 🌍 双语界面

- 完整的英文和中文语言支持
- 在设置中切换语言
- 所有 UI 元素和消息均已翻译

### 快速开始

#### 前置要求

- 现代浏览器（Chrome、Firefox、Safari、Edge）
- Google Gemini 或 OpenAI 的 API 密钥

#### 安装

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/AI-Long-Text-Flow.git
   cd AI-Long-Text-Flow
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **构建生产版本**
   ```bash
   npm run build
   npm run preview
   ```

#### 使用指南

**步骤 1：配置 API**

1. 点击右上角的设置图标（⚙️）
2. 选择 AI 提供商（Google Gemini 或 OpenAI/自定义）
3. 输入 API 密钥
4. （可选）调整模型名称、温度和其他参数
5. 点击"保存更改"

> 🔒 **安全提示**：您的 API 密钥仅存储在浏览器的 localStorage 中，永不离开您的设备。

**步骤 2：导入文本**

- **粘贴**：点击"粘贴文本"按钮或使用粘贴模态框
- **拖放**：直接将 `.txt` 或 `.md` 文件拖放到页面上

**步骤 3：配置文本分割**

在左侧边栏中：

1. 选择分割模式：
   - **Chars**：设置分块大小（如 2000 字符）
   - **Lines**：设置每块行数（如 10 行）
   - **Custom**：使用 AI 驱动的分割规则助手或手动配置：
     - 文本规则：输入分隔符模式（支持通配符和正则表达式）
     - 标题规则：选择标题级别（H1-H6）

2. （可选）设置批处理大小以合并多个分块

**步骤 4：编写提示词**

1. 在"Prompt"部分输入系统提示词
   - 示例：*"翻译成简体中文并保持自然语气"*
   - 示例：*"用 2-3 句话总结每个部分"*

2. （可选）管理术语表：
   - 点击"管理术语"
   - 添加单个术语或批量导入
   - 术语将自动注入到提示词中

**步骤 5：选择执行模式**

1. 选择**串行**或**并行**模式
2. 并行模式：调整并发限制（默认：3）
3. 串行模式：如需跨分块连续性，启用"连续上下文"

**步骤 6：处理和导出**

1. 点击"Start"开始处理
2. 监控每个分块的实时状态
3. 如有错误，可重试单个分块
4. 完成后：
   - 复制结果到剪贴板
   - 导出为 Markdown（仅结果、仅原文或组合）

### 技术栈

- **前端**：React 19、TypeScript
- **构建工具**：Vite
- **UI 组件**：Lucide React（图标）
- **Markdown**：react-markdown
- **AI SDK**：@google/genai、OpenAI 兼容 API

### 使用场景

- **翻译**：翻译长文档并保持一致性
- **内容编辑**：润色或重写长篇文章
- **摘要生成**：为长报告或书籍生成摘要
- **格式转换**：在不同 Markdown 样式之间转换
- **小说处理**：处理连载小说并保持上下文连续性
- **技术文档**：使用术语表支持翻译或改进技术文档

### 常见问题

**问：需要安装软件吗？**
答：不需要。AI Long-Text Flow 是一个完全在浏览器中运行的 Web 应用。

**问：我的数据会上传到你们的服务器吗？**
答：不会。没有服务器。所有处理都在浏览器本地进行，API 请求直接从浏览器发送到您选择的 AI 提供商（Google、OpenAI 等）。

**问：CORS 错误怎么办？**
答：官方 OpenAI API 支持 CORS。如果您使用的自定义 API 不支持 CORS，可以：
- 设置后端代理服务器
- 使用浏览器扩展如"CORS Unblock"
- 联系 API 提供商获取 CORS 支持

**问：可以离线使用吗？**
答：应用本身在初次加载后可以离线运行，但需要互联网连接才能向 AI 提供商发起 API 调用。

**问：费用是多少？**
答：工具本身免费且开源。您只需支付所选提供商（Google Gemini、OpenAI 等）的 API 使用费用。

### 贡献

欢迎贡献！请随时提交问题或拉取请求。

### 许可证

MIT 许可证 - 详见 LICENSE 文件

---

<div align="center">

**Made with ❤️ for the AI community**

[⬆ Back to Top](#ai-long-text-flow)

</div>
