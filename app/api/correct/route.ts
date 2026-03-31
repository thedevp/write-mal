import Anthropic from "@anthropic-ai/sdk";
import { correctionPrompt, type Language } from "@/lib/prompts";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "API key not configured — add ANTHROPIC_API_KEY to .env.local" },
      { status: 500 }
    );
  }

  const { text, language } = (await request.json()) as {
    text: string;
    language: Language;
  };

  if (!text?.trim()) {
    return Response.json({ corrected: "" });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: correctionPrompt(language),
      messages: [{ role: "user", content: text }],
    });

    const corrected =
      message.content[0].type === "text" ? message.content[0].text : text;

    return Response.json({ corrected });
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      if (e.status === 401) {
        return Response.json(
          { error: "Invalid API key — check ANTHROPIC_API_KEY in .env.local" },
          { status: 401 }
        );
      }
      if (e.status === 400 && e.message.includes("credit")) {
        return Response.json(
          { error: "Insufficient credits — top up at console.anthropic.com/settings/plans" },
          { status: 402 }
        );
      }
      return Response.json({ error: `API error: ${e.message}` }, { status: e.status ?? 500 });
    }
    return Response.json({ error: "Unexpected error — check server logs" }, { status: 500 });
  }
}
