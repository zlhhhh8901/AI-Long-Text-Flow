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
    headingLevel: "Heading Level",
    headingLevelUnit: "line-start",
    rule: "Rule",
    ruleUnit: "markers / /regex/",
    keepMarker: "Keep marker",
    keepMarkerTooltip: "Keep marker: if enabled, the matched marker stays at the start of the next chunk.",
    assist: "Assist",
    assistTooltip: "AI generate + preview with sample text",
    rulePlaceholder: "Part*  or  /Part\\s\\w+/i",

    // Batch Size
    batchSize: "Batch Size",
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
    title: "Glossary Manager",
    subtitle: "Define terms to maintain consistency across all chunks",

    // Tabs
    termList: "Term List",
    bulkImport: "Bulk Import",
    glossaryPrompt: "Glossary Prompt",

    // Term List Tab
    addTerm: "Add Term",
    termPlaceholder: "Term",
    definitionPlaceholder: "Definition",
    noTerms: "No terms yet",
    noTermsDesc: "Add terms to maintain consistency in your AI processing.",

    // Bulk Import Tab
    bulkImportDesc: "Import multiple terms at once. Use the format:",
    bulkImportFormat: "Term: Definition",
    bulkImportExample: "Example:",
    bulkImportExampleLine1: "API: Application Programming Interface",
    bulkImportExampleLine2: "UI: User Interface",
    bulkImportPlaceholder: "Term1: Definition1\nTerm2: Definition2\n...",
    importButton: "Import Terms",
    importSuccess: "Successfully imported {count} terms",

    // Glossary Prompt Tab
    glossaryPromptDesc: "This prompt is automatically added when glossary is enabled:",
    glossaryPromptPreview: "Please use these term definitions consistently:",

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
