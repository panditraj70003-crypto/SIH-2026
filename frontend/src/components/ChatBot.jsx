import React, { useEffect, useRef, useState } from "react";
import { useNotify } from "../context/NotifyContext.jsx";
import { answerQuery } from "../lib/chatbot.js";
import { CloseIcon, SearchIcon } from "./icons.jsx";

function BotBubble({ msg, onAction }) {
  return (
    <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-line bg-surface2 px-3.5 py-2.5 text-sm leading-relaxed">
      <p className="whitespace-pre-line">{msg.text}</p>
      {msg.actions?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {msg.actions.map((a, i) => (
            <button
              key={i}
              onClick={() => onAction(a)}
              className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatBot({ onNavigate, onViewOnMap }) {
  const { alerts, notices } = useNotify();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greet = answerQuery("hi", { alerts, notices });
      setMessages([{ role: "bot", ...greet }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  function ask(text) {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    const res = answerQuery(text, { alerts, notices });
    setMessages((prev) => [...prev, { role: "bot", ...res }]);
    setInput("");
  }

  function onAction(a) {
    if (a.query) ask(a.query);
    if (a.navigate) {
      onNavigate(a.navigate);
      setOpen(false);
    }
    if (a.onMap) {
      onViewOnMap(a.onMap);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Ask NER-SAFE"}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-ink shadow-card"
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {open ? <CloseIcon size={22} /> : <ChatIcon />}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-4 z-40 flex h-[70vh] max-h-[560px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
          style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/15 text-accent">
              <ChatIcon size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold leading-none">Ask NER-SAFE</p>
              <p className="mt-1 text-[10px] text-muted">Answers from this site only, works offline</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-3.5 py-2.5 text-sm text-accent-ink">
                  {m.text}
                </div>
              ) : (
                <BotBubble key={i} msg={m} onAction={onAction} />
              )
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 border-t border-line p-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about alerts, numbers, risk…"
              className="w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button type="submit" aria-label="Send" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink">
              <SearchIcon size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function ChatIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12c0-4.4 3.8-8 8.5-8s8.5 3.6 8.5 8-3.8 8-8.5 8c-1 0-2-.15-2.9-.43L5 21l1.4-4.2A7.6 7.6 0 0 1 4 12Z" />
    </svg>
  );
}
