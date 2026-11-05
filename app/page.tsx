"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAI() {
    if (!message.trim() || loading) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setAnswer(data.answer || "No answer received.");
    } catch (error) {
      setAnswer(
        error instanceof Error ? error.message : "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold text-center">
          Fortytwo Mini Lab
        </h1>

        <p className="text-center text-zinc-400">
          Your first AI experiment powered by Fortytwo.
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything..."
          className="w-full h-40 rounded-xl bg-zinc-900 border border-zinc-700 p-4 outline-none focus:border-white"
        />
<button
  onClick={askAI}
  disabled={loading || !message.trim()}
  className="w-full rounded-xl bg-white text-black p-4 font-semibold disabled:opacity-40"
>
  {loading ? "Thinking..." : "Ask Fortytwo"}
</button>

{answer && (
  <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 whitespace-pre-wrap">
    <h2 className="font-semibold mb-3">AI Response</h2>
    {answer}
  </div>
)}

<p className="text-center text-xs text-zinc-500 pt-4">
  Created by @preywebthree
</p>
</div>
</main>
);
}
