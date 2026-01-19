import { GlossaryTerm } from '../types';

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const DEFAULT_GLOSSARY_PROMPT =
  'If any of the following terms appear in the text, treat them as translation references (not mandatory). Prefer consistency, but adapt to context.';

export const normalizeGlossaryKey = (term: string): string =>
  term.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Merges glossary terms by normalized `term` (case-insensitive, whitespace-normalized).
 * - Keeps existing `id` when updating an existing term.
 * - Later definitions overwrite earlier ones for the same term.
 */
export const mergeGlossaryTerms = (existing: GlossaryTerm[], incoming: GlossaryTerm[]): GlossaryTerm[] => {
  const byKey = new Map<string, GlossaryTerm>();

  for (const term of existing) {
    const key = normalizeGlossaryKey(term.term);
    if (!key) continue;
    if (!byKey.has(key)) {
      byKey.set(key, { ...term, term: term.term.trim(), definition: term.definition.trim() });
    }
  }

  for (const term of incoming) {
    const key = normalizeGlossaryKey(term.term);
    if (!key) continue;

    const existingEntry = byKey.get(key);
    if (existingEntry) {
      byKey.set(key, {
        ...existingEntry,
        term: term.term.trim(),
        definition: term.definition.trim(),
      });
    } else {
      byKey.set(key, { ...term, term: term.term.trim(), definition: term.definition.trim() });
    }
  }

  return Array.from(byKey.values());
};

/**
 * Checks whether `term` appears in `content`, trying to avoid substring false positives.
 * - If term starts/ends with ASCII word chars, enforce ASCII "word boundary" on those sides.
 * - Otherwise, fall back to simple case-insensitive substring match.
 */
const termAppearsInContent = (content: string, lowerContent: string, term: string): boolean => {
  const trimmedTerm = term.trim();
  if (!trimmedTerm) return false;

  const startsWithWord = /^[A-Za-z0-9_]/.test(trimmedTerm);
  const endsWithWord = /[A-Za-z0-9_]$/.test(trimmedTerm);

  // Boundary-based match (avoids "AI" matching inside "said")
  if (startsWithWord || endsWithWord) {
    const escaped = escapeRegExp(trimmedTerm);
    const left = startsWithWord ? '(?:^|[^A-Za-z0-9_])' : '';
    const right = endsWithWord ? '(?:$|[^A-Za-z0-9_])' : '';
    const regex = new RegExp(`${left}${escaped}${right}`, 'i');
    return regex.test(content);
  }

  // Fallback: case-insensitive substring match
  return lowerContent.includes(trimmedTerm.toLowerCase());
};

/**
 * Finds all glossary terms that appear in the given text content.
 * Case-insensitive matching with basic boundary rules to reduce substring false positives.
 */
export const findMatchingTerms = (content: string, allTerms: GlossaryTerm[]): GlossaryTerm[] => {
  if (!content || !allTerms || allTerms.length === 0) return [];

  const lowerContent = content.toLowerCase();

  return allTerms.filter(item => {
    if (!item.term.trim()) return false;
    return termAppearsInContent(content, lowerContent, item.term);
  });
};

/**
 * Formats matched terms into a prompt section.
 */
export const formatGlossarySection = (terms: GlossaryTerm[], glossaryPrompt: string): string => {
  if (terms.length === 0) return '';

  const lines = terms.map(t => `- ${t.term}: ${t.definition}`);

  const prompt = (glossaryPrompt || '').trim() || DEFAULT_GLOSSARY_PROMPT;

  return `### Terminology / Glossary
${prompt}
${lines.join('\n')}`;
};

export const buildEffectiveSystemPrompt = (baseSystemPrompt: string, glossarySection: string): string => {
  const parts = [baseSystemPrompt, glossarySection].map(p => (p || '').trim()).filter(Boolean);
  return parts.join('\n\n');
};
