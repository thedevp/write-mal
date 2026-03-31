# write-mal

A personal French/Dutch writing practice app. Type on the left, get live grammar corrections with word-level diffs on the right. Highlight any text for AI-powered vocabulary, explanations, and phrase recommendations.

## Features

- **Live corrections** — grammar and spelling checked as you type (debounced, ~1.8s)
- **Word diff** — see exactly what changed, with deletions struck through and additions highlighted
- **Inline translation** — wrap English words in `{curly braces}` to translate them inline
- **Assist panel** — select any text to get recommendations, explanations, or vocabulary (Recommend / Explain / Words)
- **FR / NL toggle** — switch between French and Dutch; clears the editor for a fresh start
- **Apply corrections** — one click (or ⌘↵) to accept all suggestions
- **Resizable panels** — drag the vertical divider or the horizontal bar above the assist panel
- **Walking mascot** — cat or dog; click to switch, it says encouraging things in your target language
- **Persistent** — text, language, panel sizes, and mascot choice are saved in `localStorage`

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd write-mal
npm install
```

### 2. Add your API key

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local   # if the example exists, else create it manually
```

Open `.env.local` and add:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get your key at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).

> **Note:** Make sure your account has credits. Top up at [console.anthropic.com/settings/plans](https://console.anthropic.com/settings/plans).

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Cost estimate

The app uses **Claude Haiku** (the cheapest Claude model). A typical correction request sends ~200–400 tokens and receives ~200–400 tokens. At current Haiku pricing (~$0.80 / 1M input tokens, ~$4 / 1M output tokens), a full writing session of several hundred corrections costs well under $0.10.

The assist panel (Recommend / Explain / Words) uses a 512-token output cap — slightly pricier per call but only triggered on demand.

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add `ANTHROPIC_API_KEY` as an environment variable in the Vercel project settings.
4. Deploy.

## Project structure

```
app/
  page.tsx              # Main layout, state, resize logic
  api/
    correct/route.ts    # Grammar correction endpoint
    assist/route.ts     # Assist panel endpoint
  globals.css           # Tailwind + cursor blink keyframe
components/
  WritingEditor.tsx     # Contenteditable editor with block cursor
  CorrectionPanel.tsx   # Word diff display + copy button
  AssistPanel.tsx       # Highlight-triggered assist modes
  Mascot.tsx            # Walking cat/dog animation + phrases
lib/
  prompts.ts            # Claude prompt templates
  diff.ts               # Word-diff wrapper
```
