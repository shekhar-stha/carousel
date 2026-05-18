import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildSystemPrompt, Style } from "@/lib/skills";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { brief, style } = (await req.json()) as {
      brief: string;
      style: Style;
    };

    if (!brief?.trim()) {
      return NextResponse.json({ error: "Brief is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY env var not set" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: buildSystemPrompt(style),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16384,
      },
    });

    const userPrompt = `Build the carousel based on this brief:\n\n${brief}\n\nReturn only the complete HTML file.`;
    const result = await model.generateContent(userPrompt);
    let html = result.response.text().trim();

    // Strip code fences if Gemini adds them
    html = html.replace(/^```html\s*/i, "").replace(/```\s*$/, "").trim();

    if (!html.startsWith("<!DOCTYPE") && !html.startsWith("<html")) {
      return NextResponse.json(
        { error: "Model did not return valid HTML", raw: html.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json({ html });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
