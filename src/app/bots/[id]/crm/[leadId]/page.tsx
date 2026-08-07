// src/app/bots/[id]/crm/[leadId]/page.tsx
import { getChatLogsByLead } from '@/actions/crm';
import { ArrowLeft, MessageSquare, User, Bot, Clock } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string; leadId: string }>;
}

export default async function ChatTranscriptPage({ params }: PageProps) {
  const { id, leadId } = await params;
  const { data: logs, success, error } = await getChatLogsByLead(leadId);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={`/bots/${id}/crm`}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads List
          </Link>
        </div>

        {/* Transcript Header */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Visitor Chat Transcript
            </h1>
            <p className="text-xs text-gray-500 mt-1">Lead ID: {leadId}</p>
          </div>
          <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-full">
            Chat Logs
          </span>
        </div>

        {/* Error Notification */}
        {!success && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            Failed to load transcript: {error}
          </div>
        )}

        {/* Chat Bubbles */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-4">
          {logs && logs.length > 0 ? (
            logs.map((log: any) => {
              const isUser = log.role === 'user';
              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 ${
                    isUser ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isUser
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tl-none'
                        : 'bg-gray-100 text-gray-800 rounded-tr-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{log.message}</p>
                    <div
                      className={`text-[10px] mt-1.5 flex items-center gap-1 ${
                        isUser ? 'text-blue-200 justify-end' : 'text-gray-400 justify-start'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              No chat history recorded for this lead.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}