export type Language = "FR" | "NL" | "ES";
export type AssistMode = "Recommend" | "Explain" | "Words";

const LANGUAGE_NAMES: Record<Language, string> = {
  FR: "French",
  NL: "Dutch",
  ES: "Spanish",
};

export function correctionPrompt(language: Language): string {
  const lang = LANGUAGE_NAMES[language];
  return `You are a ${lang} writing assistant helping someone practice writing in ${lang}.

Your task:
1. Correct all grammar, spelling, conjugation, and agreement errors in the text.
2. Any text inside {curly braces} is English — replace it with the proper ${lang} equivalent, integrated naturally into the sentence.
3. Preserve the user's intended meaning and personal voice. Do not rewrite sentences unless they are grammatically broken.
4. If the text is already correct, return it unchanged.

Return ONLY the corrected text. No explanations, no commentary, no quotes around the output.`;
}

export function assistPrompt(
  language: Language,
  mode: AssistMode,
  selected: string,
  context: string
): string {
  const lang = LANGUAGE_NAMES[language];
  const modeInstructions: Record<AssistMode, string> = {
    Recommend: `Suggest 3 more natural or idiomatic ways to express the highlighted phrase in ${lang}.
Format as a numbered list. For each suggestion, add a short note on when/why you'd use it. Keep it concise.`,
    Explain: `Explain the grammar rule behind this phrase or any correction that would apply to it.
Focus on one key point. Be brief and educational. Use simple English. Include an example if helpful.`,
    Words: `Break down the key vocabulary in the highlighted text.
For each word: show the ${lang} word, its English meaning, grammatical info (e.g. noun gender, verb group), and one usage tip.
Format as a clean list.`,
  };

  return `You are a ${lang} writing assistant.

Context (full sentence or paragraph):
"${context}"

Highlighted text: "${selected}"

Mode: ${mode}
${modeInstructions[mode]}

Respond in English. Be concise.`;
}
