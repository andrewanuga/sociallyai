"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`markdown-body space-y-3 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => <p className="text-[14px] leading-relaxed text-[var(--fg)] mb-2 last:mb-0" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-[20px] font-bold text-[var(--fg)] mt-4 mb-2 font-display" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-[18px] font-bold text-[var(--fg)] mt-4 mb-2 font-display" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-[16px] font-semibold text-[var(--fg)] mt-3 mb-2 font-display" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
          li: ({ node, ...props }) => <li className="text-[14px] text-[var(--fg)] leading-relaxed pl-1" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-[var(--fg)]" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-[var(--fg-2)]" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-[var(--sai-indigo)] pl-4 py-1 my-3 bg-[var(--panel-fill-2)] rounded-r-lg italic text-[var(--fg-2)] text-[13.5px]" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-[var(--sai-indigo)] hover:underline decoration-[var(--sai-indigo)]/50 underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          code: ({ node, ...props }: any) => {
            const isInline = !props.className;
            return isInline ? (
              <code className="bg-[var(--panel-fill-2)] px-1.5 py-0.5 rounded text-[13px] font-data text-[var(--sai-indigo)]" {...props} />
            ) : (
              <div className="my-3 rounded-xl border border-[var(--stroke)] bg-[#0f111a] overflow-hidden">
                <div className="flex items-center px-4 py-2 border-b border-[#ffffff10] bg-[#1a1d27]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="ml-3 text-[11px] text-[var(--fg-4)] font-data">{props.className?.replace('language-', '') || 'code'}</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <code className="text-[13px] text-[#e2e8f0] font-data leading-relaxed" {...props} />
                </div>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
