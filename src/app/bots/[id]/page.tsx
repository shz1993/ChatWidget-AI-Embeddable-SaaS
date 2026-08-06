// src/app/bots/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getBotById, updateBotSettings } from '@/actions/bots';
import { addKnowledgeToBot, getBotKnowledgeList, deleteKnowledge } from '@/actions/knowledge';
import { Bot, ArrowLeft, Palette, Code, FileText, CheckCircle2, Trash2, UploadCloud, Copy, ExternalLink } from 'lucide-react';

export default function BotConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: botId } = use(params);

  const [bot, setBot] = useState<any>(null);
  const [knowledgeList, setKnowledgeList] = useState<any[]>([]);

  // Settings State
  const [name, setName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [requireLead, setRequireLead] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Knowledge State
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [uploadingKnowledge, setUploadingKnowledge] = useState(false);

  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    const botData = await getBotById(botId);
    if (botData) {
      setBot(botData);
      setName(botData.name);
      setWelcomeMessage(botData.welcomeMessage);
      setPrimaryColor(botData.primaryColor);
      setRequireLead(botData.requireLead);
    }

    const kList = await getBotKnowledgeList(botId);
    setKnowledgeList(kList);
  };

  useEffect(() => {
    loadData();
  }, [botId]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    await updateBotSettings(botId, { name, welcomeMessage, primaryColor, requireLead });
    await loadData();
    setSavingSettings(false);
    alert('Settings saved successfully!');
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim() || uploadingKnowledge) return;

    setUploadingKnowledge(true);
    const res = await addKnowledgeToBot(botId, docTitle, docContent);
    if (res.success) {
      setDocTitle('');
      setDocContent('');
      await loadData();
    } else {
      alert('Failed to upload knowledge: ' + res.error);
    }
    setUploadingKnowledge(false);
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Delete this knowledge chunk?')) return;
    await deleteKnowledge(id, botId);
    await loadData();
  };

  const embedCode = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-bot-id="${botId}"></script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-sans text-sm">
        Loading bot details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-12">
      {/* Navbar Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: primaryColor }}>
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base">{bot.name}</h1>
              <p className="text-xs text-slate-500">Bot Configurator & Knowledge Ingestion</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
        {/* Section 1: Embed Code Snippet & Live Preview */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Code className="h-4 w-4" />
              Embed Code Snippet
            </div>

            <div className="flex items-center gap-2">
              {/* 💡 TOMBOL TES INSTAN (Langsung Buka Chatbot) */}
              <a
                href={`/widget/${botId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Test / Preview Widget</span>
              </a>

              <button
                onClick={copyEmbedCode}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Script Tag'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Copy and paste into your website, or click button <span className="text-emerald-400 font-bold">"Test / Preview Widget"</span> for try chatbot in new tab !
          </p>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
            {embedCode}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 2: Bot Customization Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Palette className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-lg">Widget Appearance</h2>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bot Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Welcome Message</label>
                <textarea
                  rows={2}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Theme Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 rounded-lg cursor-pointer border border-slate-300 p-1 bg-white"
                  />
                  <span className="font-mono text-xs text-slate-600">{primaryColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="requireLead"
                  checked={requireLead}
                  onChange={(e) => setRequireLead(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="requireLead" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Require Visitor Name & Email Before Chatting (Lead Form)
                </label>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm"
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* Section 3: Knowledge Base Upload */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-lg">Add Knowledge Base / SOP</h2>
            </div>

            <form onSubmit={handleAddKnowledge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document / SOP Title</label>
                <input
                  type="text"
                  placeholder="e.g. Kebijakan Pengembalian Barang & FAQ Toko"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SOP Text Content</label>
                <textarea
                  rows={4}
                  placeholder="Paste your store policies, product details, or FAQ text here..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={uploadingKnowledge}
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                <UploadCloud className="h-4 w-4" />
                <span>{uploadingKnowledge ? 'Generating Vector Embeddings...' : 'Add Knowledge to Bot'}</span>
              </button>
            </form>

            {/* Knowledge Chunk List */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Uploaded Knowledge Chunks ({knowledgeList.length})
              </h3>
              <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {knowledgeList.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 text-center">No knowledge added yet.</p>
                ) : (
                  knowledgeList.map((item) => (
                    <div key={item.id} className="p-3 flex items-start justify-between gap-2 hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{item.title}</span>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{item.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteKnowledge(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}