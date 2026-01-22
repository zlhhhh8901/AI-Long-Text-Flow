export default {
  common: {
    paste: "Paste",
    import: "Import",
    clear: "Clear",
    save: "Save",
    cancel: "Cancel",
    done: "Done",
    apply: "Apply",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    export: "Export",
    download: "Download",
    close: "Close",
  },

  sidebar: {
    title: "AI Flow",
    subtitle: "Editorial Processing",

    // Fragmentation Section
    fragmentation: "文本分割",
    chars: "Chars",
    lines: "Lines",
    custom: "Custom",
    chunkSize: "分块大小",
    chunkSizeUnit: "chars",
    linesPerChunk: "每块行数",
    linesPerChunkUnit: "count",

    // Custom Split Mode
    textRule: "Text Rule",
    headings: "Headings",
    ruleType: "规则类型",
    ruleTypeUnit: "文本 / 标题",
    headingLevel: "标题级别",
    headingLevelUnit: "line-start",
    rule: "Rule",
    ruleUnit: "markers / /regex/",
    keepMarker: "保留标记",
    keepMarkerTooltip: "保留标记：如果启用，匹配的标记将保留在下一个分块的开头。",
    assist: "Assist",
    assistTooltip: "支持纯文本（Part 1）、通配符（Part*）或正则表达式（/Part\\s\\w+/i）。点击按钮可使用 AI 生成规则并预览效果。",
    rulePlaceholder: "Part*  or  /Part\\s\\w+/i",

    // Batch Size
    batchSize: "Batch Size",
    batchSizeTooltip: "将较小的片段组合在一起以提高处理效率。",

    // Prompt Section
    prompt: "Prompt",
    promptPlaceholder: "输入您的主要提示词（全局应用）。",
    glossary: "Glossary",
    manageTerms: "管理术语",

    // Execution Section
    execution: "执行方式",
    serial: "串行",
    parallel: "并行",
    concurrencyLimit: "并发限制",
    contextualMemory: "连续上下文",
    contextualMemoryDesc: "在分块之间保持对话历史，以获得更好的连续性。",

    // Footer
    privacyFooter: "Privacy Focused • Local Execution",
  },

  settings: {
    title: "设置",
    subtitle: "配置您的 AI 提供商和模型",

    // Language Section
    language: "语言",
    english: "English",
    chinese: "中文",

    // AI Provider
    aiProvider: "AI Provider",
    googleGemini: "Google Gemini",
    openaiCustom: "OpenAI / Custom",

    // API Configuration
    apiKey: "API Key",
    apiKeyPlaceholderGemini: "AIza...",
    apiKeyPlaceholderOpenAI: "sk-...",
    baseUrl: "Base URL",
    baseUrlPlaceholder: "https://api.openai.com/v1",

    // CORS Warning
    corsWarningTitle: "⚠️ 关于 CORS 问题",
    corsWarningText: "某些自定义 API 可能不支持 CORS（跨域资源共享），这可能导致连接错误。官方 OpenAI API 支持 CORS。如果您在使用自定义 API 时遇到问题，请考虑使用后端代理或浏览器扩展。",

    // Model Configuration
    modelName: "Model Name",
    modelPlaceholderGemini: "gemini-3.0-flash",
    modelPlaceholderOpenAI: "gpt-4o",
    flash: "Flash",
    pro: "Pro",
    temperature: "Temperature",

    // Security Note
    securityNote: "密钥存储在浏览器本地。项目没有服务器，无法访问您的数据。",

    // Actions
    saveChanges: "保存更改",
  },

  resultCard: {
    // Status Labels
    completed: "Completed",
    thinking: "Thinking",
    queued: "Queued",
    idle: "Idle",
    error: "Error",

    // Tab Labels
    source: "Source",
    original: "Original",
    payload: "Payload",

    // Processing Messages
    refiningOutput: "Refining output",
    synthesizing: "Synthesizing",

    // Contextual Mode Labels
    contextualStart: "Contextual (Start)",
    contextualContinue: "Contextual (Continue)",

    // CORS Error Help
    corsFixTitle: "如何修复 CORS 错误：",
    corsFixStep1: "使用官方 OpenAI API（支持 CORS）",
    corsFixStep2: "设置后端代理服务器",
    corsFixStep3: "使用浏览器扩展，如 CORS Unblock",
    corsFixStep4: "联系您的 API 提供商以获取 CORS 支持",

    // Actions
    copyResult: "复制结果",
    viewSource: "查看源文本",
    retry: "重试",
  },

  glossaryModal: {
    title: "术语表管理器",
    subtitle: "定义术语以在所有分块中保持一致性",

    // Tabs
    termList: "术语列表",
    bulkImport: "批量导入",
    glossaryPrompt: "Glossary Prompt",

    // Term List Tab
    addTerm: "添加术语",
    termPlaceholder: "术语",
    definitionPlaceholder: "定义",
    noTerms: "暂无术语",
    noTermsDesc: "添加术语以在 AI 处理中保持一致性。",

    // Bulk Import Tab
    bulkImportDesc: "一次导入多个术语。使用以下格式：",
    bulkImportFormat: "术语: 定义",
    bulkImportExample: "示例：",
    bulkImportExampleLine1: "API: Application Programming Interface",
    bulkImportExampleLine2: "UI: User Interface",
    bulkImportPlaceholder: "术语1: 定义1\n术语2: 定义2\n...",
    importButton: "导入术语",
    importSuccess: "成功导入 {count} 个术语",

    // Glossary Prompt Tab
    glossaryPromptDesc: "启用术语表时会自动添加此提示词：",
    glossaryPromptPreview: "请始终使用这些术语定义：",

    // Actions
    clearAll: "清空全部",
    confirmClear: "确定要清空所有术语吗？",
  },

  splitRuleModal: {
    title: "分割规则助手",
    subtitle: "AI 驱动的规则生成与实时预览",

    // Steps
    step1: "步骤 1：描述您的需求",
    step1Desc: "告诉 AI 您想如何分割文本",
    step1Placeholder: "示例：按章节标记分割，如 'Chapter 1'、'Chapter 2'...",

    step2: "步骤 2：提供示例文本",
    step2Desc: "粘贴您的文本样本以进行测试",
    step2Placeholder: "在此粘贴您的示例文本...",

    step3: "步骤 3：审查并应用",
    step3Desc: "预览分割结果，如果满意则应用",

    // Actions
    generateRule: "生成规则",
    generating: "生成中",
    applyRule: "应用规则",

    // Preview
    previewTitle: "预览",
    previewChunks: "个分块",
    previewChunk: "分块",
    previewEmpty: "暂无预览",
    previewEmptyDesc: "生成规则以查看预览",

    // Generated Rule
    generatedRule: "规则已生成",
    ruleType: "规则类型：",
    ruleTypeText: "Text",
    ruleTypeHeading: "Heading",
    separator: "分隔符：",
    keepSeparator: "保留分隔符：",
    headingLevel: "标题级别：",

    // Status Messages
    errorGenerating: "生成规则失败。请重试。",
    errorNoApiKey: "请先在设置中配置您的 API 密钥。",
  },

  pasteModal: {
    title: "粘贴文本",
    placeholder: "在此粘贴您的文本...",
    importButton: "导入",
  },

  app: {
    // Toolbar
    settings: "设置",

    // Empty State
    emptyTitle: "准备处理",
    emptyDesc: "粘贴文本或拖放文件以开始",
    emptyAction: "粘贴文本",

    // Drag & Drop
    dragOverlay: "将文件拖放到此处",

    // Export Menu
    exportOriginal: "导出原始文本",
    exportResults: "导出所有结果",
    exportCombined: "导出组合（源文本 + 结果）",

    // Processing Status
    processingCount: "正在处理 {current} / {total}",
    completedCount: "已完成 {count} / {total}",

    // Actions
    clearAll: "清空全部",
    confirmClear: "确定要清空所有分块吗？",

    // File Import
    fileImported: "文件导入成功",
    fileImportError: "文件导入失败",

    // Errors
    errorNoApiKey: "请在设置中配置您的 API 密钥",
    errorProcessing: "处理分块时出错",
    errorNetwork: "网络错误。请检查您的连接。",
  },
};
