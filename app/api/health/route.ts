import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.chatbotkey || process.env.OPENROUTER_API_KEY || process.env.CHATBOTKEY || process.env.openrouter_api_key;
  const name = process.env.chatbotkey ? "chatbotkey"
    : process.env.OPENROUTER_API_KEY ? "OPENROUTER_API_KEY"
    : process.env.CHATBOTKEY ? "CHATBOTKEY"
    : process.env.openrouter_api_key ? "openrouter_api_key"
    : "none";

  return NextResponse.json({
    keyFound: !!key,
    keyName: name,
    hint: !key ? "Go to Vercel → Project Settings → Environment Variables and add chatbotkey = your OpenRouter key, then Redeploy." : "Key is set.",
  });
}
