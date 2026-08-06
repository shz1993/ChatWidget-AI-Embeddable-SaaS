// src/app/widget/[botId]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getBotById } from '@/actions/bots';
import { Bot, Send, Sparkles, User, Mail, ArrowLeft, RotateCcw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function WidgetIframePage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = use(params);

  const [bot, setBot] = useState<any>(null);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  // Form Lead State
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBotById(botId).then((data) => {
      if (data) {
        setBot(data);
        if (!data.requireLead) {
          setLeadCaptured(true);
        }
      }
    });
  }, [botId]);

  // Fungsi untuk Kembali ke Form Awal / Reset Chat
  const handleReset = () => {
    if (bot?.requireLead) {
      setLeadCaptured(false);
    }
    setMessages([]);
    setLeadId(null);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim()) return;

    const res = await fetch('/api/widget/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botId, name: leadName, email: leadEmail }),
    });

    const data = await res.json();
    if (data.success) {
      setLeadId(data.leadId);
      setLeadCaptured(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const response = await fetch('/api/widget/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, leadId, message: userText }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value, { stream: true });

          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            const updatedLastMsg = {
              ...lastMsg,
              content: lastMsg.content + chunkValue,
            };
            return [...prev.slice(0, -1), updatedLastMsg];
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!bot) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white text-slate-500 font-sans p-6 text-center space-y-2">
        <div className="font-bold text-sm">Bot tidak ditemukan.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden border border-slate-200 rounded-2xl shadow-2xl">
      {/* Widget Header */}
      <div
        className="p-4 text-white flex items-center justify-between shadow-sm shrink-0"
        style={{ backgroundColor: bot.primaryColor || '#2563eb' }}
      >
        <div className="flex items-center gap-2.5">
          {/* 💡 Tombol Back di Header */}
          {leadCaptured ? (
            // Jika sedang Chatting: Tombol ini kembali ke Form Lead
            <button
              onClick={handleReset}
              title="Kembali ke Form Lead"
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/20 transition-all text-white/90 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            // Jika di Form Lead: Tombol ini kembali ke Dashboard Bot
            <Link
              href={`/bots/${botId}`}
              title="Kembali ke Dashboard Admin"
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/20 transition-all text-white/90 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}

          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>

          <div>
            <h2 className="font-bold text-sm leading-tight">{bot.name}</h2>
            <p className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>

        {/* Tombol Reset Percakapan di Kanan Header (Saat Mode Chat) */}
        {leadCaptured && (
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-[11px] font-semibold flex items-center gap-1 text-white/90"
            title="Reset Percakapan"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Main Body: Lead Form OR Chat View */}
      {!leadCaptured ? (
        <div className="flex-1 p-6 flex flex-col justify-center space-y-4 bg-white">
          <div className="text-center space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Welcome! 👋</h3>
            <p className="text-xs text-slate-500">Please enter your details to start chatting.</p>
          </div>

          <form onSubmit={handleLeadSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm mt-2"
              style={{ backgroundColor: bot.primaryColor || '#2563eb' }}
            >
              Start Conversation
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Initial Welcome Message */}
            <div className="flex gap-2 text-xs">
              <div
                className="h-6 w-6 rounded-full text-white flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: bot.primaryColor || '#2563eb' }}
              >
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none text-slate-800 max-w-[85%] shadow-xs">
                {bot.welcomeMessage}
              </div>
            </div>

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 text-xs ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div
                    className="h-6 w-6 rounded-full text-white flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: bot.primaryColor || '#2563eb' }}
                  >
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.role === 'user'
                      ? 'text-white rounded-tr-none font-medium'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                  }`}
                  style={m.role === 'user' ? { backgroundColor: bot.primaryColor || '#2563eb' } : {}}
                >
                  {m.content ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      Thinking...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200 focus-within:border-blue-600 transition-all"
            >
              <input
                type="text"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 text-white rounded-lg disabled:opacity-40 transition-all"
                style={{ backgroundColor: bot.primaryColor || '#2563eb' }}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}