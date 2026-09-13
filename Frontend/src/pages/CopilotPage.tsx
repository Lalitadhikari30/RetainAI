import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { CopilotMessage } from '../types';
import { getCopilotMessages, sendCopilotMessage } from '../api/service';
import { starterPromptChips } from '../mocks/copilotResponses';
import { ChatBubble } from '../components/ChatBubble';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function CopilotPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const msgs = await getCopilotMessages();
      // Personalize demo message sender to current user
      const personalized = msgs.map((m) => {
        if (m.sender === 'user' && m.timestamp.includes('Sent by')) {
          return {
            ...m,
            timestamp: m.timestamp.replace(/Sent by .*/, `Sent by ${user.name}`),
          };
        }
        return m;
      });
      setMessages(personalized);
    }
    load();
  }, [user.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isGenerating) return;

    setInputQuery('');
    setIsGenerating(true);

    try {
      const { userMessage, aiMessage } = await sendCopilotMessage(text, user.name);
      setMessages((prev) => [...prev, userMessage, aiMessage]);
    } catch (err) {
      showToast('Error communicating with Copilot service', 'warning');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-1 gap-6 animate-in fade-in duration-150 min-h-0">
      {/* Main Chat Stream (Left/Center) */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-on-surface">Manager Copilot</h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
                <span className="text-[10px] font-semibold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">
                  Model v2.4
                </span>
              </div>
              <span className="text-xs text-on-surface-variant">
                Context: Workday Sync #4192 • 1,248 Employees
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Enterprise Confidential</span>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {isGenerating && (
            <div className="flex gap-3.5 items-center text-xs text-on-surface-variant animate-pulse pl-2">
              <div className="w-8 h-8 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface-container-low text-xs text-on-surface">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Copilot is analyzing workforce telemetry and formulating retention strategies...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Chips Bar */}
        <div className="px-6 pt-2 pb-1 border-t border-outline-variant/15 flex items-center gap-2 overflow-x-auto bg-surface-container-lowest">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            Suggested:
          </span>
          {starterPromptChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip)}
              className="px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-primary-fixed hover:text-primary text-xs font-medium text-on-surface whitespace-nowrap transition-colors border border-outline-variant/20 shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Compact Inline Input Bar */}
        <div className="p-4 pt-2 bg-surface-container-lowest">
          <div className="relative flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low/60 focus-within:bg-surface-container-lowest focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all py-1.5 pl-4 pr-1.5 shadow-2xs">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Copilot about an employee's flight risk, 1:1 conversation scripts, or retention incentives..."
              className="w-full text-xs text-on-surface bg-transparent outline-none placeholder:text-on-surface-variant/70 leading-normal"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isGenerating}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Rail Context Drawer */}
      <div className="w-80 shrink-0 hidden xl:flex flex-col gap-4">
        {/* Pinned At-Risk Quick Select */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
              High Risk Cohort
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary">
              3 Critical
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleSend('Why is Marcus Thorne flagged at 88% risk, and what is our action plan?')}
              className="p-3 rounded-xl bg-surface-container-low hover:bg-primary-fixed/30 text-left transition-all border border-outline-variant/20 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span>Marcus Thorne</span>
                <span className="text-tertiary">88% High</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                Sr. Staff Engineer • $215k Replacement Cost
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSend('Tell me about Samantha Reed in Sales and her recent quota spike.')}
              className="p-3 rounded-xl bg-surface-container-low hover:bg-primary-fixed/30 text-left transition-all border border-outline-variant/20 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span>Samantha Reed</span>
                <span className="text-tertiary">84% High</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                Account Exec • New VP Manager Transition
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSend('How can we retain David Chen in Product?')}
              className="p-3 rounded-xl bg-surface-container-low hover:bg-primary-fixed/30 text-left transition-all border border-outline-variant/20 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span>David Chen</span>
                <span className="text-tertiary">79% High</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                Product Lead • Radford Median Gap
              </span>
            </button>
          </div>
        </div>

        {/* Manager Guidance Box */}
        <div className="bg-primary-fixed/40 rounded-2xl p-5 border border-primary-container/20 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wide">
              Design Principle
            </span>
          </div>
          <p className="text-xs text-on-surface leading-relaxed">
            <strong>Suggest, never auto-execute:</strong> RetainAI Copilot calculates probabilistic risk and offers structured conversation blueprints. Manager discretion guides all retention commitments.
          </p>
        </div>
      </div>
    </div>
  );
}
