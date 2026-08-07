// src/app/bots/[id]/crm/page.tsx
import { getLeadsByBot, getBotAnalytics } from '@/actions/crm';
import { Mail, ArrowLeft, MessageSquare, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BotCrmPage({ params }: PageProps) {
  const { id } = await params;

  if (!id || id === 'undefined') {
    return <div className="p-10 text-red-600 font-sans">Error: Invalid Bot ID.</div>;
  }

  const [{ data: leads, success, error }, { data: analytics }] = await Promise.all([
    getLeadsByBot(id),
    getBotAnalytics(id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/bots/${id}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 px-3.5 py-2 rounded-xl shadow-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bot Details
          </Link>
          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5" />
            CRM & Analytics Dashboard
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard & Leads CRM</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor your AI widget's leads and conversation statistics.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Leads</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalLeads}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Messages</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalMessages}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
        </div>

        {!success && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            Failed to load lead data: {error}
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-base font-semibold text-gray-800">Visitor List (Leads)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Visitor Name</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Entry Time</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {leads && leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{lead.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                          <a href={`mailto:${lead.email}`} className="hover:text-blue-600 underline truncate max-w-[220px]">
                            {lead.email}
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-xs">
                        {new Date(lead.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/bots/${id}/crm/${lead.id}`}
                          className="relative z-10 inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          View Chat
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      No leads have been captured from this chat widget yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}