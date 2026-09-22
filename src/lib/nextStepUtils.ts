export interface NextStepQualityResult {
  isVague: boolean;
  suggestion?: string;
  original: string;
}

const VAGUE_RULES: Array<{
  pattern: RegExp;
  getSuggestion: (text: string) => string;
}> = [
  {
    pattern: /^(work on\s+marketing|marketing)$/i,
    getSuggestion: () => 'Write 3 Instagram hooks for the campaign.',
  },
  {
    pattern: /^(work on\s+client proposal|proposal|prepare client proposal)$/i,
    getSuggestion: () => 'Write the pricing section with 3 tier options.',
  },
  {
    pattern: /^(research|do research|market research)/i,
    getSuggestion: () => 'Find and summarize 2 relevant competitor examples.',
  },
  {
    pattern: /^(study|studying)/i,
    getSuggestion: () => 'Read section 3 and write down 3 key takeaways.',
  },
  {
    pattern: /^(work on\s+website|website|build website)/i,
    getSuggestion: () => 'Draft the headline and subheader for the hero section.',
  },
  {
    pattern: /^(plan|planning|plan project)/i,
    getSuggestion: () => 'List the top 3 milestones in chronological order.',
  },
  {
    pattern: /^(improve|optimize)/i,
    getSuggestion: () => 'Identify the single slowest step and reorder it.',
  },
  {
    pattern: /^(finish project|do work|work|continue|finish)/i,
    getSuggestion: () => 'Check off the next single checklist item.',
  },
  {
    pattern: /^work on\s+(.+)$/i,
    getSuggestion: (text) => {
      const match = text.match(/^work on\s+(.+)$/i);
      const subject = match ? match[1].trim() : 'this';
      return `Draft the first paragraph or outline for ${subject}.`;
    },
  },
  {
    pattern: /^continue\s+(.+)$/i,
    getSuggestion: (text) => {
      const match = text.match(/^continue\s+(.+)$/i);
      const subject = match ? match[1].trim() : 'work';
      return `Write the next 2 bullet points for ${subject}.`;
    },
  },
];

export function evaluateNextStepQuality(text: string): NextStepQualityResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isVague: false, original: trimmed };
  }

  for (const rule of VAGUE_RULES) {
    if (rule.pattern.test(trimmed)) {
      return {
        isVague: true,
        suggestion: rule.getSuggestion(trimmed),
        original: trimmed,
      };
    }
  }

  // Also check if text is very short (1-2 generic words < 12 characters)
  const words = trimmed.split(/\s+/);
  if (words.length <= 2 && trimmed.length < 12) {
    const commonVagueWords = ['stuff', 'code', 'design', 'write', 'emails', 'admin', 'taxes', 'slides'];
    if (commonVagueWords.includes(trimmed.toLowerCase())) {
      return {
        isVague: true,
        suggestion: `Define a 5-minute action for "${trimmed}".`,
        original: trimmed,
      };
    }
  }

  return { isVague: false, original: trimmed };
}
