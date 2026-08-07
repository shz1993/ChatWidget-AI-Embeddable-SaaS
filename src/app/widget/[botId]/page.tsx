// src/app/widget/[botId]/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation'; // 🛠️ Diperbaiki: useParams dari next/navigation
import Link from 'next/link';
import { Send, User, Loader2, Bot, MessageCircle, ArrowLeft } from 'lucide-react';

export default function WidgetPage() {
  const { botId } = useParams<{ botId: string }>();
  
  // State Lead
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isLeadSubmitted, setIsLeadSubmitted] = useState(false);
  const [loadingLead, setLoadingLead] = useState(false);

  // State Chat
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLead(true);
    try {
      const res = await fetch('/api/widget/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, name, email }),
      });
      const data = await res.json();
      if (data.success) {
        setLeadId(data.leadId);
        setIsLeadSubmitted(true);
      }
    } catch (error) {
      alert('Failed to start chat. Please try again.');
    } finally {
      setLoadingLead(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loadingChat) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoadingChat(true);

    try {
      const response = await fetch('/api/widget/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, leadId, message: userMessage }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        aiResponse += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = aiResponse;
          return updated;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden text-slate-900 font-sans">
      {/* Navigation Header */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between flex-shrink-0 border-b border-slate-800">
        <Link
          href={`/bots/${botId}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bot Details</span>
        </Link>
        <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
          Preview Mode
        </span>
      </header>

      {!isLeadSubmitted ? (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Bot className="w-8 h-8 text-slate-900" />
          </div>
          <h2 className="font-extrabold text-2xl mb-2 text-black">Hello!</h2>
          <p className="text-slate-600 mb-8">Please fill in your details to start the conversation.</p>
          
          <form onSubmit={handleLeadSubmit} className="w-full max-w-sm space-y-4">
            <input 
              required placeholder="Your Name" value={name} onChange={e => setName(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-black placeholder:text-slate-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            />
            <input 
              required type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-black placeholder:text-slate-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            />
            <button 
              disabled={loadingLead}
              className="w-full bg-black text-white p-3 rounded-lg font-bold hover:bg-slate-800 transition-all flex justify-center items-center"
            >
              {loadingLead ? <Loader2 className="animate-spin w-5 h-5" /> : 'Start Chat'}
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="bg-black p-4 text-white flex items-center gap-2 flex-shrink-0">
            <MessageCircle className="w-5 h-5" />
            <span className="font-bold">Assistant Chat</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-black text-white' : 'bg-slate-100 text-black border border-slate-200'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2 bg-slate-50 flex-shrink-0">
            <input 
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:border-black text-black"
            />
            <button disabled={loadingChat} className="bg-black text-white p-2 rounded-lg hover:bg-slate-800">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}