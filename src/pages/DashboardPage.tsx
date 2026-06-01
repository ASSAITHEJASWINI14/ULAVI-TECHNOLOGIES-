import React, { useEffect, useState } from 'react';
import { ArrowLeft, Inbox, Send, Loader2, BarChart2 } from 'lucide-react';
import { getEmailOutbox } from '../lib/api';
import { supabase } from '../lib/supabase';

interface Props {
  onBack: () => void;
}

interface EmailEntry {
  id?: string;
  to_email?: string;
  from_email?: string;
  subject?: string;
  query?: string;
  phone_number?: string;
  timestamp?: string;
  status?: string;
  created_at?: string;
}

export default function DashboardPage({ onBack }: Props) {
  const [tab, setTab] = useState<'sent' | 'inbox'>('sent');
  const [entries, setEntries] = useState<EmailEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (supabase) {
          const { data } = await supabase
            .from('ulavi_sessions')
            .select('*')
            .order('created_at', { ascending: false });
          setEntries(data || []);
        } else {
          const data = await getEmailOutbox();
          setEntries(data || []);
        }
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sentEntries = entries.filter((e) => e.from_email || e.status === 'sent' || e.status === 'queued');
  const inboxEntries = entries.filter((e) => e.to_email);

  const displayEntries = tab === 'sent' ? sentEntries : inboxEntries;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6 pt-4">
          <button onClick={onBack} className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart2 className="w-5 h-5" /> Dashboard
          </h2>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('sent')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${tab === 'sent' ? 'bg-white text-purple-900' : 'bg-white/20 hover:bg-white/30'}`}
          >
            <Send className="w-4 h-4" /> Sent
          </button>
          <button
            onClick={() => setTab('inbox')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${tab === 'inbox' ? 'bg-white text-purple-900' : 'bg-white/20 hover:bg-white/30'}`}
          >
            <Inbox className="w-4 h-4" /> Inbox
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-300" />
          </div>
        ) : displayEntries.length === 0 ? (
          <div className="text-center py-16 text-purple-300">
            <p className="text-lg">No entries yet</p>
            <p className="text-sm mt-2">Sent emails will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEntries.map((e, i) => (
              <div key={e.id || i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{e.subject || 'ULAVI Support Query'}</p>
                    <p className="text-xs text-purple-300 mt-0.5">
                      {tab === 'sent' ? `To: ${e.to_email || '—'}` : `From: ${e.from_email || '—'}`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${e.status === 'sent' ? 'bg-green-400/20 text-green-300' : 'bg-yellow-400/20 text-yellow-300'}`}>
                    {e.status || 'sent'}
                  </span>
                </div>
                {e.query && (
                  <p className="text-xs text-purple-200 mt-2 line-clamp-2">{e.query}</p>
                )}
                {e.phone_number && (
                  <p className="text-xs text-purple-300 mt-1">📞 {e.phone_number}</p>
                )}
                {(e.timestamp || e.created_at) && (
                  <p className="text-xs text-purple-400 mt-1">
                    {new Date(e.timestamp || e.created_at || '').toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
