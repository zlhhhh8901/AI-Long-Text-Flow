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
    fragmentation: "Fragmentation",
    chars: "Chars",
    lines: "Lines",
    custom: "Custom",
    chunkSize: "Chunk Size",
    chunkSizeUnit: "chars",
    linesPerChunk: "Lines per Chunk",
    linesPerChunkUnit: "count",

    // Custom Split Mode
    textRule: "Text Rule",
    headings: "Headings",
    ruleType: "Rule Type",
    ruleTypeUnit: "text / heading",
    headingLevel: "Heading Level",
    headingLevelUnit: "line-start",
    rule: "Rule",
    ruleUnit: "markers / /regex/",
    keepMarker: "Keep marker",
    keepMarkerTooltip: "Keep marker: if enabled, the matched marker stays at the start of the next chunk.",
    assist: "Assist",
    assistTooltip: "Supports plain text (Part 1), wildcards (Part*), or regex (/Part\\s\\w+/i).",
    rulePlaceholder: "Part*  or  /Part\\s\\w+/i",

    // Batch Size
    batchSize: "Chunks to Combine",
    batchSizeTooltip: "Combine smaller pieces to flow together efficiently.",

    // Prompt Section
    prompt: "Prompt",
    promptPlaceholder: "Enter your main prompt (applies globally).",
    glossary: "Glossary",
    manageTerms: "Manage Terms",

    // Execution Section
    execution: "Execution",
    serial: "Serial",
    parallel: "Parallel",
    concurrencyLimit: "Concurrency Limit",
    contextualMemory: "Contextual Memory",
    contextualMemoryDesc: "Maintains conversation history across chunks for better continuity.",

    // Footer
    privacyFooter: "Privacy Focused • Local Execution",
  },

  settings: {
    title: "Settings",
    subtitle: "Configure your AI provider and model",

    // Language Section
    language: "Language",
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
    corsWarningTitle: "⚠️ About CORS Issues",
    corsWarningText: "Some custom APIs may not support CORS (Cross-Origin Resource Sharing), which can cause connection errors. The official OpenAI API supports CORS. If you encounter issues with a custom API, consider using a backend proxy or browser extension.",

    // Model Configuration
    modelName: "Model Name",
    modelPlaceholderGemini: "gemini-2.5-flash",
    modelPlaceholderOpenAI: "gpt-4o",
    flash: "Flash",
    pro: "Pro",
    temperature: "Temperature",

    // Security Note
    securityNote: "Keys are stored locally in your browser. We do not have servers and cannot access your data.",

    // Actions
    saveChanges: "Save Changes",
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
    corsFixTitle: "How to fix CORS errors:",
    corsFixStep1: "Use the official OpenAI API (supports CORS)",
    corsFixStep2: "Set up a backend proxy server",
    corsFixStep3: "Use a browser extension like CORS Unblock",
    corsFixStep4: "Contact your API provider for CORS support",

    // Actions
    copyResult: "Copy result",
    viewSource: "View source",
    retry: "Retry",
  },

  glossaryModal: {
    title: "Glossary Management",
    subtitle: "Define translation references to be injected into the effective system prompt.",

    // Tabs
    termList: "Term List",
    bulkImport: "Bulk Import",
    glossaryPrompt: "Glossary Prompt",

    // Term List Tab
    addTerm: "Add Term",
    termLabel: "Term",
    termPlaceholder: "e.g. LLM",
    definitionLabel: "Definition / Translation",
    definitionPlaceholder: "e.g. Large Language Model",
    noTerms: "No terms defined yet. Add one above or use Bulk Import.",

    // Bulk Import Tab
    bulkImportDesc: "Paste your glossary here. One entry per line. Format: <b>Term, Definition</b> or <b>Term: Definition</b>. Works with copy-paste from Excel.",
    bulkImportPlaceholder: "LLM, Large Language Model\nAgent, 智能体\nRAG, Retrieval Augmented Generation",
    parseAndAdd: "Parse and Add",

    // Glossary Prompt Tab
    glossaryPromptDesc: "This text is injected alongside matched glossary terms into the <b>effective system prompt</b>. Keep it short and non-mandatory if you want the model to adapt to context.",
    resetToDefault: "Reset to default",

    // Actions
    clearAll: "Clear All",
    confirmClear: "Are you sure you want to clear all terms?",
  },

  splitRuleModal: {
    title: "Split Rule Assistant",
    subtitle: "AI-powered rule generation with live preview",

    // Steps
    step1: "Step 1: Describe Your Need",
    step1Desc: "Tell the AI how you want to split your text",
    step1Placeholder: "Example: Split by chapter markers like 'Chapter 1', 'Chapter 2'...",

    step2: "Step 2: Provide Sample Text",
    step2Desc: "Paste a sample of your text for testing",
    step2Placeholder: "Paste your sample text here...",

    step3: "Step 3: Review & Apply",
    step3Desc: "Preview the split result and apply if satisfied",

    // Actions
    generateRule: "Generate Rule",
    generating: "Generating",
    applyRule: "Apply Rule",

    // Preview
    previewTitle: "Preview",
    previewChunks: "chunks",
    previewChunk: "Chunk",
    previewEmpty: "No preview yet",
    previewEmptyDesc: "Generate a rule to see the preview",

    // Generated Rule
    generatedRule: "Generated Rule:",
    ruleType: "Rule Type:",
    ruleTypeText: "Text",
    ruleTypeHeading: "Heading",
    separator: "Separator:",
    keepSeparator: "Keep Separator:",
    headingLevel: "Heading Level:",

    // Status Messages
    errorGenerating: "Failed to generate rule. Please try again.",
    errorNoApiKey: "Please configure your API key in Settings first.",
  },

  pasteModal: {
    title: "Paste Text",
    placeholder: "Paste your text here...",
    importButton: "Import",
  },

  mergeExportModal: {
    mergeTitle: "Merge into Input",
    exportTitle: "Custom Export",
    subtitle: "Add optional prefixes and separators for each request/response pair.",
    requestPrefixLabel: "Request Prefix",
    responsePrefixLabel: "Response Prefix",
    pairSeparatorLabel: "Between Pairs",
    requestPrefixPlaceholder: "Optional text before each request",
    responsePrefixPlaceholder: "Optional text before each response",
    pairSeparatorPlaceholder: "\\n\\n (blank line)",
    escapeHint: "Supports \\n for line breaks.",
    previewTitle: "Preview",
    previewEmpty: "No completed results to preview.",
    previewCount: "Preview: {count}",
    availableCount: "Available: {count}",
    mergeAction: "Merge into Input",
    exportAction: "Export",
  },

  app: {
    // Toolbar
    settings: "Settings",

    // Empty State
    emptyTitle: "Ready to Process",
    emptyDesc: "Paste text or drag & drop a file to begin",
    emptyAction: "Paste Text",

    // Drag & Drop
    dragOverlay: "Drop your file here",

    // Export Menu
    exportOriginal: "Export Original Text",
    exportResults: "Export All Results",
    exportCombined: "Export Combined (Source + Result)",

    // Processing Status
    processingCount: "Processing {current} of {total}",
    completedCount: "Completed {count} of {total}",

    // Actions
    clearAll: "Clear All",
    confirmClear: "Are you sure you want to clear all chunks?",

    // File Import
    fileImported: "File imported successfully",
    fileImportError: "Failed to import file",

    // Errors
    errorNoApiKey: "Please configure your API key in Settings",
    errorProcessing: "Error processing chunk",
    errorNetwork: "Network error. Please check your connection.",
  },
};
