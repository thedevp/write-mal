export type Language = "FR" | "NL" | "ES";
export type AssistMode = "Recommend" | "Explain" | "Words" | "Translate";

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
    Recommend: `First, briefly assess the highlighted phrase: is it something a native ${lang} speaker would naturally say, or does it sound unnatural/incorrect? One or two sentences max.

Then suggest 3 more natural or idiomatic alternatives in ${lang}.
Format the alternatives as a numbered list. For each, add a short note on when/why you'd use it. Keep it concise.`,
    Explain: `Explain the grammar rule behind this phrase or any correction that would apply to it.
Focus on one key point. Be brief and educational. Use simple English. Include an example if helpful.`,
    Words: `Break down the key vocabulary in the highlighted text.
For each word: show the ${lang} word, its English meaning, grammatical info (e.g. noun gender, verb group), and one usage tip.
Format as a clean list.`,
    Translate: `Translate the highlighted text into English. Preserve idiomatic expressions, colloquialisms, and slang with their natural English equivalents rather than translating literally. Return only the translation — no quotes, no explanation, no commentary.`,
  };

  return `You are a ${lang} writing assistant.

Context (full sentence or paragraph):
"${context}"

Highlighted text: "${selected}"

Mode: ${mode}
${modeInstructions[mode]}

Respond in English. Be concise.`;
}
