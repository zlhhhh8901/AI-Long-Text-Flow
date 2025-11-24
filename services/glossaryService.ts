import { GlossaryTerm } from '../types';

/**
 * Finds all glossary terms that appear in the given text content.
 * Case-insensitive matching.
 */
export const findMatchingTerms = (content: string, allTerms: GlossaryTerm[]): GlossaryTerm[] => {
  if (!content || !allTerms || allTerms.length === 0) return [];

  const lowerContent = content.toLowerCase();
  
  return allTerms.filter(item => {
    if (!item.term.trim()) return false;
    return lowerContent.includes(item.term.toLowerCase().trim());
  });
};

/**
 * Formats matched terms into a prompt section.
 */
export const formatGlossarySection = (terms: GlossaryTerm[]): string => {
  if (terms.length === 0) return '';

  const lines = terms.map(t => `- ${t.term}: ${t.definition}`);
  
  return `### Terminology / Glossary
Please strictly use the following definitions for these terms if they appear in the text:
${lines.join('\n')}`;
};

/**
 * Helper to construct the full user message with glossary injected.
 * This ensures consistency between the actual API call and the UI preview.
 */
export const constructUserMessageWithGlossary = (
  originalContent: string, 
  prePrompt: string, 
  allTerms: GlossaryTerm[],
  isGlossaryEnabled: boolean
): string => {
  let finalContent = originalContent;
  let glossarySection = '';

  if (isGlossaryEnabled) {
    const matches = findMatchingTerms(originalContent, allTerms);
    if (matches.length > 0) {
      glossarySection = formatGlossarySection(matches);
    }
  }

  // Construct the final message block
  // Order: Pre-Prompt -> Glossary -> Content
  const parts = [];
  
  if (prePrompt && prePrompt.trim()) {
    parts.push(prePrompt.trim());
  }

  if (glossarySection) {
    parts.push(glossarySection);
  }

  parts.push(finalContent);

  return parts.join('\n\n');
};