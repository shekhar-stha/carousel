"use client";

import { useState, useRef } from "react";
import type { Style } from "@/lib/skills";

const STYLES: { value: Style; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Cream" },
  { value: "livevitae", label: "Live Vitae" },
  { value: "tweet", label: "Tweet" },
];

export default function Home() {
  const [brief, setBrief] = useState("");
  const [style, setStyle] = useState<Style>("dark");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generate = async () => {
    setError(null);
    setHtml(null);
    setLoading(true);
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, style }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to generate");
      setHtml(data.html);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = async () => {
    if (!iframeRef.current?.contentDocument) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const JSZip = (await import("jszip")).default;
      const doc = iframeRef.current.contentDocument;
      const slides = doc.querySelectorAll<HTMLDivElement>(".slide");
      const zip = new JSZip();
      for (let i = 0; i < slides.length; i++) {
        const canvas = await html2canvas(slides[i], {
          width: 1080,
          height: 1350,
          scale: 2,
          useCORS: true,
          backgroundColor: null,
        });
        const blob: Blob = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b!), "image/png")
        );
        zip.file(`slide_${String(i + 1).padStart(2, "0")}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carousel_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="pt-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Carousel<span className="text-amber-500">.</span>
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            Describe what you want. Tap generate. Download to your phone.
          </p>
        </header>

        <div className="space-y-3">
          <label className="text-xs uppercase tracking-widest font-bold text-stone-500">
            Style
          </label>
          <div className="grid grid-cols-4 gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`py-3 px-2 rounded-xl text-sm font-bold border transition ${
                  style === s.value
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : "border-stone-800 bg-stone-900 text-stone-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs uppercase tracking-widest font-bold text-stone-500">
            What&apos;s the carousel about?
          </label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder={`e.g. "5 reels a week beats daily posting. Slide 1 hook with the math, slide 2 the problem, slides 3-5 the new system, slide 6 proof from our clients, slide 7 CTA with PLAYBOOK keyword."`}
            className="w-full min-h-[200px] md:min-h-[260px] p-4 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 resize-none text-sm"
          />
        </div>

        <button
          onClick={generate}
          disabled={loading || !brief.trim()}
          className="w-full py-4 rounded-xl bg-amber-500 text-stone-950 font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition"
        >
          {loading ? "Generating..." : "Generate carousel"}
        </button>

        {error && (
          <div className="p-4 rounded-xl bg-red-950 border border-red-900 text-red-200 text-sm">
            {error}
          </div>
        )}

        {html && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest font-bold text-stone-500">
                Preview
              </label>
              <button
                onClick={downloadAll}
                disabled={downloading}
                className="py-2 px-4 rounded-lg bg-amber-500 text-stone-950 font-bold text-sm disabled:opacity-40"
              >
                {downloading ? "Packaging..." : "↓ Download ZIP"}
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-stone-800 bg-stone-900">
              <iframe
                ref={iframeRef}
                srcDoc={html}
                className="w-full h-[600px] md:h-[800px]"
                title="Carousel preview"
                sandbox="allow-same-origin"
              />
            </div>
            <details className="text-xs text-stone-500">
              <summary className="cursor-pointer hover:text-stone-300">View HTML source</summary>
              <pre className="mt-2 p-3 bg-stone-900 rounded-lg overflow-x-auto text-[10px] max-h-60">
                {html}
              </pre>
            </details>
          </div>
        )}
      </div>
    </main>
  );
}
