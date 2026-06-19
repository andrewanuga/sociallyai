"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Link, Code, Mic, Send, Info, Bot, X } from "lucide-react";

const CHAT_STYLES = `
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.8) translateY(20px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  .ai-chat-pop-in { animation: popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
  .floating-ai-button:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow:
      0 0 30px rgba(239,68,68,.9),
      0 0 50px rgba(220,38,38,.7),
      0 0 70px rgba(185,28,28,.5);
  }
`;

const FloatingAiAssistant = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const maxChars = 2000;
  const chatRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessage("");
      setCharCount(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        const target = event.target as Element;
        if (!target.closest(".floating-ai-button")) {
          setIsChatOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <style dangerouslySetInnerHTML={{ __html: CHAT_STYLES }} />

      {/* Floating button */}
      <button
        className={`floating-ai-button relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform ${
          isChatOpen ? "rotate-90" : "rotate-0"
        }`}
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          background: "linear-gradient(135deg, rgba(239,68,68,.8) 0%, rgba(220,38,38,.8) 100%)",
          boxShadow:
            "0 0 20px rgba(239,68,68,.7), 0 0 40px rgba(220,38,38,.5), 0 0 60px rgba(185,28,28,.3)",
          border: "2px solid rgba(255,255,255,.2)",
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30" />
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="relative z-10">
          {isChatOpen ? <X className="w-6 h-6 text-white" /> : <Bot className="w-8 h-8 text-white" />}
        </div>
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-red-500" />
      </button>

      {/* Chat panel */}
      {isChatOpen && (
        <div
          ref={chatRef}
          className="absolute bottom-20 right-0 w-max max-w-[500px] origin-bottom-right ai-chat-pop-in"
        >
          <div className="relative flex flex-col rounded-3xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 border border-zinc-500/50 shadow-2xl backdrop-blur-3xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-zinc-400">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-zinc-800/60 text-zinc-300 rounded-2xl">GPT-4</span>
                <span className="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl">Pro</span>
                <button onClick={() => setIsChatOpen(false)} className="p-1.5 rounded-full hover:bg-zinc-700/50 transition-colors">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Input */}
            <div className="relative overflow-hidden">
              <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={4}
                className="w-full px-6 py-4 bg-transparent border-none outline-none resize-none text-base font-normal leading-relaxed min-h-[120px] text-zinc-100 placeholder-zinc-500"
                placeholder="What would you like to explore today? Ask anything, share ideas, or request assistance..."
                style={{ scrollbarWidth: "none" }}
              />
            </div>

            {/* Controls */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Attachment row */}
                  <div className="flex items-center gap-1.5 p-1 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                    <button className="group relative p-2.5 rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 hover:scale-105">
                      <Paperclip className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-12" />
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-zinc-900/95 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none border border-zinc-700/50">Upload files</span>
                    </button>
                    <button className="group relative p-2.5 rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/80 hover:scale-105">
                      <Link className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-zinc-900/95 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none border border-zinc-700/50">Web link</span>
                    </button>
                    <button className="group relative p-2.5 rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/80 hover:scale-105">
                      <Code className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-6" />
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-zinc-900/95 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none border border-zinc-700/50">Code repo</span>
                    </button>
                    {/* Figma icon */}
                    <button className="group relative p-2.5 rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/80 hover:scale-105">
                      <svg className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.015-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117v-6.038H8.148zm7.704 0c-2.476 0-4.49 2.015-4.49 4.49s2.014 4.49 4.49 4.49 4.49-2.015 4.49-4.49-2.014-4.49-4.49-4.49zm0 7.509c-1.665 0-3.019-1.355-3.019-3.019s1.355-3.019 3.019-3.019 3.019 1.354 3.019 3.019-1.354 3.019-3.019 3.019zM8.148 24c-2.476 0-4.49-2.015-4.49-4.49s2.014-4.49 4.49-4.49h4.588V24H8.148zm3.117-1.471V16.49H8.148c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.02 3.019 3.02h3.117z" />
                      </svg>
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-zinc-900/95 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none border border-zinc-700/50">Design file</span>
                    </button>
                  </div>

                  {/* Voice */}
                  <button className="group relative p-2.5 border border-zinc-700/30 rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/80 hover:scale-110 hover:border-red-500/30">
                    <Mic className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-3" />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-zinc-900/95 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none border border-zinc-700/50">Voice input</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-medium text-zinc-500">
                    <span>{charCount}</span>/<span className="text-zinc-400">{maxChars}</span>
                  </div>

                  {/* Send */}
                  <button
                    onClick={handleSend}
                    className="group relative p-3 bg-gradient-to-r from-red-600 to-red-500 rounded-xl cursor-pointer transition-all duration-300 text-white shadow-lg hover:from-red-500 hover:to-red-400 hover:scale-110 hover:shadow-red-500/30 hover:shadow-xl active:scale-95 hover:-rotate-2"
                  >
                    <Send className="w-5 h-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-12 group-hover:scale-110" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-lg scale-110" />
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 rounded-xl" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50 text-xs text-zinc-500 gap-6">
                <div className="flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  <span>
                    Press{" "}
                    <kbd className="px-1.5 py-1 bg-zinc-800 border border-zinc-600 rounded text-zinc-400 font-mono text-xs shadow-sm">
                      Shift + Enter
                    </kbd>{" "}
                    for new line
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  <span>All systems operational</span>
                </div>
              </div>
            </div>

            {/* Overlay shimmer */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: "linear-gradient(135deg,rgba(239,68,68,.05),transparent,rgba(220,38,38,.05))" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export { FloatingAiAssistant };
