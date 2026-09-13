import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, ThumbsUp, ThumbsDown, Copy, Check, CalendarPlus, FileSpreadsheet, Share2, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { CopilotMessage } from '../types';
import { useToast } from '../context/ToastContext';

interface ChatBubbleProps {
  message: CopilotMessage;
  key?: React.Key;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    showToast('Copilot response copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAction = (actionName: string) => {
    showToast(`Action queued: ${actionName}`, 'success');
  };

  if (message.sender === 'user') {
    return (
      <div className="flex justify-end pl-8 sm:pl-12">
        <div className="flex flex-col items-end gap-1.5 max-w-xl">
          <div className="bg-primary text-on-primary rounded-2xl rounded-tr-none px-5 py-3.5 shadow-sm text-sm leading-relaxed">
            <p className="font-medium">{message.text}</p>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            {message.timestamp}
          </span>
        </div>
      </div>
    );
  }

  // Copilot AI message bubble
  return (
    <div className="flex gap-3.5 pr-2 sm:pr-6">
      {/* Bot Icon */}
      <div className="w-8 h-8 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
        <Bot className="w-5 h-5" />
      </div>

      <div className="flex flex-col gap-3 max-w-2xl flex-1">
        {/* Header meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-on-surface">RetainAI Copilot</span>
          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[11px] font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Synthesis
          </span>
          {message.meta?.generatedMs && (
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Generated in {message.meta.generatedMs}ms
            </span>
          )}
        </div>

        {/* Bubble container */}
        <div className="bg-surface-container-low text-on-surface rounded-2xl rounded-tl-none p-5 flex flex-col gap-4 shadow-xs border border-outline-variant/30">
          <div className="prose prose-sm max-w-none text-on-surface">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed text-on-surface text-sm">{children}</p>,
                strong: ({ children }) => <strong className="font-bold text-on-surface">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc list-outside pl-5 space-y-1.5 my-2.5 text-on-surface text-sm">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-outside pl-5 space-y-1.5 my-2.5 text-on-surface text-sm">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                h1: ({ children }) => <h1 className="text-base font-bold text-on-surface mt-3 mb-1.5">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold text-on-surface mt-3 mb-1.5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xs font-bold text-on-surface uppercase tracking-wide mt-3 mb-1.5">{children}</h3>,
                h4: ({ children }) => <h4 className="text-xs font-bold text-on-surface mt-2.5 mb-1">{children}</h4>,
                hr: () => <hr className="my-3 border-outline-variant/30" />,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-2xs">
                    <table className="min-w-full text-xs text-left divide-y divide-outline-variant/30">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-surface-container-low font-semibold text-on-surface border-b border-outline-variant/30">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-outline-variant/20">{children}</tbody>,
                tr: ({ children }) => <tr className="hover:bg-surface-container-low/50 transition-colors">{children}</tr>,
                th: ({ children }) => <th className="px-3.5 py-2.5 text-on-surface font-bold whitespace-nowrap">{children}</th>,
                td: ({ children }) => <td className="px-3.5 py-2 text-on-surface">{children}</td>,
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded bg-surface-container-lowest font-mono text-xs text-primary border border-outline-variant/30">
                    {children}
                  </code>
                ),
              }}
            >
              {(() => {
                let text = message.text || '';
                // Fix single-line markdown tables where rows are joined with `| |`
                text = text.replace(/\|\s*\|\s*/g, '|\n| ');
                // Ensure table divider rows are separated by newlines
                text = text.replace(/\|\s*(\|(?:\s*[:-]+[-| :]*\|))/g, '|\n$1');
                text = text.replace(/(\|(?:\s*[:-]+[-| :]*\|))\s*\|/g, '$1\n| ');
                // Ensure double newline before table start if preceded by plain text
                text = text.replace(/([^\n])\n(\|)/g, '$1\n\n$2');
                // Ensure double newline after table end if followed by plain text
                text = text.replace(/(\|[^\n]*)\n([^\n|#*-])/g, '$1\n\n$2');
                return text;
              })()}
            </ReactMarkdown>
          </div>

          {/* Key Drivers Grid (Stagnation, Fatigue, Comp Band) */}
          {message.meta?.stagnation && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1.5">
                  <Clock className="w-4 h-4 text-tertiary" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Stagnation</span>
                </div>
                <div className="text-xl font-bold font-metric-mono text-on-surface">{message.meta.stagnation}</div>
                <span className="text-[11px] text-on-surface-variant mt-1">Without grade tier advancement despite top ratings.</span>
              </div>

              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-tertiary" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Fatigue</span>
                </div>
                <div className="text-xl font-bold font-metric-mono text-on-surface">{message.meta.fatigue}</div>
                <span className="text-[11px] text-on-surface-variant mt-1">Weekly avg on-call load post dual-departure.</span>
              </div>

              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-tertiary font-bold text-sm">$</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Comp Band</span>
                </div>
                <div className="text-xl font-bold font-metric-mono text-on-surface">{message.meta.compBand}</div>
                <span className="text-[11px] text-on-surface-variant mt-1">Disparity relative to tech sector L6 median.</span>
              </div>
            </div>
          )}

          {/* Action List */}
          {message.meta?.actions && message.meta.actions.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wide">
                Recommended Immediate Actions
              </span>
              <div className="flex flex-col gap-2">
                {message.meta.actions.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-on-surface leading-relaxed flex-1">
                      {act}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleAction('Prepare 1:1 Agenda')}
              className="px-3.5 py-2 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              Prepare 1:1 Agenda
            </button>
            <button
              type="button"
              onClick={() => handleAction('Draft Compensation Adjustment')}
              className="px-3.5 py-2 bg-surface-container-lowest text-on-surface rounded-lg text-xs font-medium hover:bg-surface-container-high transition-all flex items-center gap-1.5 border border-outline-variant/30"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Draft Compensation Adjustment
            </button>
            <button
              type="button"
              onClick={() => handleAction('Export Brief to PDF')}
              className="px-3.5 py-2 bg-surface-container-lowest text-on-surface-variant rounded-lg text-xs font-medium hover:text-on-surface transition-all flex items-center gap-1 border border-outline-variant/30"
            >
              <Share2 className="w-3.5 h-3.5" />
              Export Brief to PDF
            </button>
          </div>
        </div>

        {/* Feedback Toolbar */}
        <div className="flex items-center gap-4 px-2 text-xs text-on-surface-variant">
          <button
            type="button"
            onClick={() => {
              setLiked(true);
              showToast('Feedback noted: Helpful', 'info');
            }}
            className={`flex items-center gap-1 hover:text-primary transition-colors ${
              liked === true ? 'text-primary font-semibold' : ''
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Helpful
          </button>
          <button
            type="button"
            onClick={() => {
              setLiked(false);
              showToast('Feedback noted: Needs Tuning', 'warning');
            }}
            className={`flex items-center gap-1 hover:text-error transition-colors ${
              liked === false ? 'text-error font-semibold' : ''
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            Needs Tuning
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-on-surface transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy text'}
          </button>
        </div>
      </div>
    </div>
  );
}
