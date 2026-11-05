
"use client";

import { useEffect, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  date: string;
};

type Usage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [lightMode, setLightMode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("prey-chat-history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      console.error("Could not load chat history.");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("prey-chat-history", JSON.stringify(history));
  }, [history]);

  async function askAI() {
    if (!message.trim() || loading) return;

    const question = message.trim();
    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: question },
    ];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);
    setUsage(null);
    setResponseTime(null);

    const startTime = Date.now();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      const answer = data.answer || "No answer received.";
      const finalMessages: Message[] = [
        ...updatedMessages,
        { role: "assistant", content: answer },
      ];

      setMessages(finalMessages);
      setUsage(data.usage || null);
      setResponseTime((Date.now() - startTime) / 1000);

      const conversation: Conversation = {
        id: Date.now().toString(),
        title: question.slice(0, 45),
        messages: finalMessages,
        date: new Date().toLocaleString(),
      };

      setHistory((previous) => [
        conversation,
        ...previous.filter((item) => item.id !== conversation.id),
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred.";

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setMessages([]);
    setUsage(null);
    setResponseTime(null);
    setMessage("");
  }

  function loadChat(conversation: Conversation) {
    setMessages(conversation.messages);
    setUsage(null);
    setResponseTime(null);
  }

  async function copyAnswer(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const lastAnswer = [...messages]
    .reverse()
    .find((item) => item.role === "assistant");

  return (
    <main
      className={`relative min-h-screen overflow-hidden ${
        lightMode
          ? "bg-slate-100 text-slate-900"
          : "bg-[#07152F] text-white"
      }`}
    >
      <div className="starfield" aria-hidden="true">
        {Array.from({ length: 65 }, (_, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${(i % 9) * 0.4}s`,
              animationDuration: `${2 + (i % 5)}s`,
            }}
          />
        ))}
        <span className="shooting-star" />
        <span className="shooting-star second" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
        <header className="flex items-center justify-between border-b border-yellow-400/20 pb-5">
          <div>
            <h1 className="text-3xl font-black tracking-widest text-yellow-400">
              PREY
            </h1>
            <p className="mt-1 text-xs tracking-wider text-slate-400">
              INDEPENDENT AI LAB
            </p>
          </div>

          <button
            onClick={() => setLightMode(!lightMode)}
            className="rounded-full border border-yellow-400/50 px-4 py-2 text-sm text-yellow-400 transition hover:bg-yellow-400 hover:text-[#07152F]"
          >
            {lightMode ? "Dark Mode" : "Light Mode"}
          </button>
        </header>

        <div className="grid flex-1 gap-6 py-8 md:grid-cols-[220px_1fr]">
          <aside
            className={`h-fit rounded-2xl border p-4 ${
              lightMode
                ? "border-slate-300 bg-white/80"
                : "border-yellow-400/20 bg-[#102448]/80"
            }`}
          >
            <button
              onClick={newChat}
              className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-bold text-[#07152F] transition hover:bg-yellow-300"
            >
              + New Chat
            </button>

            <h2 className="mb-3 mt-6 text-xs font-bold uppercase tracking-widest text-yellow-500">
              Chat History
            </h2>

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {history.length === 0 && (
                <p className="text-xs text-slate-400">
                  Your conversations will appear here.
                </p>
              )}

              {history.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => loadChat(chat)}
                  className="w-full truncate rounded-lg bg-black/10 px-3 py-2 text-left text-sm transition hover:bg-yellow-400/10"
                >
                  {chat.title}
                </button>
              ))}
            </div>
          </aside>

          <section className="flex min-w-0 flex-col">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Explore <span className="text-yellow-400">Intelligence</span>
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                Your independent AI playground powered by Fortytwo.
              </p>
            </div>

            <div
              className={`mb-5 min-h-64 flex-1 rounded-2xl border p-5 ${
                lightMode
                  ? "border-slate-300 bg-white/90"
                  : "border-yellow-400/20 bg-[#102448]/80"
              }`}
            >
              {messages.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center text-center">
                  <div className="mb-4 text-5xl text-yellow-400">✦</div>
                  <h3 className="text-xl font-semibold">
                    Welcome to Prey Mini Lab
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Ask a question and start exploring.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((item, index) => (
                    <div
                      key={index}
                      className={`rounded-xl p-4 ${
                        item.role === "user"
                          ? "ml-4 bg-yellow-400/10"
                          : "mr-4 bg-black/10"
                      }`}
                    >
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-yellow-500">
                        {item.role === "user" ? "You" : "Prey AI"}
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-7">
                        {item.content}
                      </p>
                    </div>
                  ))}

                  {loading && (
                    <p className="animate-pulse text-sm text-yellow-400">
                      Thinking...
                    </p>
                  )}
                </div>
              )}
            </div>

            <div
              className={`rounded-2xl border p-3 ${
                lightMode
                  ? "border-slate-300 bg-white"
                  : "border-yellow-400/30 bg-[#102448]"
              }`}
            >
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    askAI();
                  }
                }}
                placeholder="Ask anything..."
                className="h-28 w-full resize-none bg-transparent p-3 text-sm outline-none placeholder:text-slate-500"
              />

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Enter to send · Shift + Enter for new line
                </p>
                <button
                  onClick={askAI}
                  disabled={loading || !message.trim()}
                  className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-[#07152F] transition hover:bg-yellow-300 disabled:opacity-40"
                >
                  {loading ? "Thinking..." : "Ask Fortytwo"}
                </button>
              </div>
            </div>

            {lastAnswer && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-yellow-400/20 bg-[#102448]/70 p-4 text-xs">
                <div className="flex flex-wrap gap-4 text-slate-300">
                  {usage && (
                    <>
                      <span>Input: {usage.prompt_tokens ?? "—"}</span>
                      <span>Output: {usage.completion_tokens ?? "—"}</span>
                      <span className="font-bold text-yellow-400">
                        Total: {usage.total_tokens ?? "—"} tokens
                      </span>
                    </>
                  )}
                  {responseTime !== null && (
                    <span>Response: {responseTime.toFixed(2)}s</span>
                  )}
                </div>

                <button
                  onClick={() => copyAnswer(lastAnswer.content)}
                  className="rounded-lg border border-yellow-400/50 px-3 py-2 text-yellow-400 hover:bg-yellow-400 hover:text-[#07152F]"
                >
                  {copied ? "Copied!" : "Copy Answer"}
                </button>
              </div>
            )}
          </section>
        </div>

        <footer className="border-t border-yellow-400/20 pt-5 text-center">
          <p className="text-xs tracking-wider text-yellow-400">
            Created by @preywebthree
          </p>
        </footer>
      </div>

      <style jsx global>{`
        .starfield {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 50% 40%, rgba(20, 55, 105, 0.4), transparent 65%),
            #07152f;
        }

        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: #fff4b0;
          box-shadow: 0 0 6px 2px rgba(255, 220, 90, 0.55);
          animation: twinkle 3s ease-in-out infinite alternate;
        }

        .star:nth-child(3n) {
          width: 3px;
          height: 3px;
          background: #ffffff;
          box-shadow: 0 0 9px 3px rgba(255, 255, 255, 0.45);
        }

        .shooting-star {
          position: absolute;
          top: 12%;
          left: -15%;
          width: 120px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #f5c400, transparent);
          transform: rotate(-25deg);
          animation: shooting 9s linear infinite;
          animation-delay: 2s;
        }

        .shooting-star.second {
          top: 55%;
          animation-delay: 6s;
          animation-duration: 12s;
        }

        @keyframes twinkle {
          from { opacity: 0.25; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1.4); }
        }

        @keyframes shooting {
          0% { left: -20%; opacity: 0; }
          5% { opacity: 1; }
          18% { left: 120%; opacity: 0; }
          100% { left: 120%; opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .star, .shooting-star {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
