// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBot, getBots, deleteBot } from '@/actions/bots';
import { Bot, Plus, Sparkles, Settings, ArrowRight, Trash2, Users } from 'lucide-react';

export default function DashboardHome() {
  const [botList, setBotList] = useState<any[]>([]);
  const [newBotName, setNewBotName] = useState('');
  const [loading, setLoading] = useState(false);

  const loadBots = async () => {
    const data = await getBots();
    setBotList(data);
  };

  useEffect(() => {
    loadBots();
  }, []);

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim() || loading) return;

    setLoading(true);
    const res = await createBot(newBotName);
    if (res.success) {
      setNewBotName('');
      loadBots();
    } else {
      alert('Failed to create bot: ' + res.error);
    }
    setLoading(false);
  };

  const handleDeleteBot = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this bot?')) return;
    await deleteBot(id);
    loadBots();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 text-base">ChatWidget AI</span>
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                Embeddable SaaS
              </span>
            </div>
          </div>

          {/* 💡 TOMBOL BARU: Arahkan ke Halaman Captured Leads */}
          <Link
            href="/leads"
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all border border-slate-200 shadow-2xs"
          >
            <Users className="h-4 w-4 text-blue-600" />
            <span>View Captured Leads</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
        {/* Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Your AI Chatbots</h1>
            <p className="text-sm text-slate-600 mt-1">
              Create and manage embeddable AI widgets for your websites and e-commerce stores.
            </p>
          </div>

          {/* Quick Create Form */}
          <form onSubmit={handleCreateBot} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter bot name (e.g. Toko CS Bot)..."
              value={newBotName}
              onChange={(e) => setNewBotName(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{loading ? 'Creating...' : 'Create Bot'}</span>
            </button>
          </form>
        </div>

        {/* Bot Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {botList.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900">No Bots Created Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Type a name above and click "Create Bot" to build your first embeddable AI customer support assistant.
              </p>
            </div>
          ) : (
            botList.map((bot) => (
              <Link
                key={bot.id}
                href={`/bots/${bot.id}`}
                className="group relative bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-bold shadow-xs"
                      style={{ backgroundColor: bot.primaryColor || '#2563eb' }}
                    >
                      <Bot className="h-4 w-4" />
                    </div>
                    <button
                      onClick={(e) => handleDeleteBot(bot.id, e)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                      title="Delete Bot"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base">
                      {bot.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      "{bot.welcomeMessage}"
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Settings className="h-3.5 w-3.5" />
                    Configure & Embed
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}