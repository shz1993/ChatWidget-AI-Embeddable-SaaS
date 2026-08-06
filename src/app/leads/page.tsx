// src/app/leads/page.tsx
import { db } from '@/db';
import { leads, bots } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowLeft, Users, Mail, Calendar, Bot } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const capturedLeads = await db
    .select({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      createdAt: leads.createdAt,
      botName: bots.name,
    })
    .from(leads)
    .leftJoin(bots, eq(leads.botId, bots.id))
    .orderBy(desc(leads.createdAt));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-12">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base">Captured Leads</h1>
              <p className="text-xs text-slate-500">Website visitors who interacted with your AI bots</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Leads Collected: {capturedLeads.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {capturedLeads.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400">No leads captured yet.</p>
            ) : (
              capturedLeads.map((lead) => (
                <div key={lead.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {lead.name}
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        {lead.botName || 'Unknown Bot'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {lead.email}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(lead.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}