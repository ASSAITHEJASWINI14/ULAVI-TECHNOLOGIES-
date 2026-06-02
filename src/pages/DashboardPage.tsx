import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Loader2, BarChart2, Search, RefreshCw,
  CheckCircle, Clock, XCircle, Mail, Phone, ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import { getEmailOutbox } from '../lib/api';

interface Props {
  onBack: () => void;
}

interface EmailEntry {
  id?: string;
  token?: string;
  to_email?: string;
  from_email?: string;
  subject?: string;
  query?: string;
  phone_number?: string;
  timestamp?: string;
  created_at?: string;
  status?: string;
  body?: string;
  error?: string;
}

type StatusFilter = 'all' | 'sent' | 'queued' | 'failed';

function StatusBadge({ status }: { status?: string }) {
  if (status === 'sent') return (
    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-400/20 text-green-300 font-semibold">
      <CheckCircle className="w-3 h-3" /> Sent
    </span>
  );
  if (status === 'failed') return (
    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-400/20 text-red-300 font-semibold">
      <XCircle className="w-3 h-3" /> Failed
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-yellow-400/20 text-yellow-300 font-semibold">
      <Clock className="w-3 h-3" /> Queued
    </span>
  );
}

export default function DashboardPage({ onBack }: Props) {
  const [entries, setEntries] = useState<EmailEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getEmailOutbox();
      setEntries(data || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = entries.filter((e) => {
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q || (
      (e.from_email || '').toLowerCase().includes(q) ||
      (e.query || '').toLowerCase().includes(q) ||
      (e.phone_number || '').toLowerCase().includes(q) ||
      (e.token || '').toLowerCase().includes(q)
    );
    return matchesStatus && matchesSearch;
  });

  const totalSent = entries.filter((e) => e.status === 'sent').length;
  const totalFailed = entries.filter((e) => e.status === 'failed').length;
  const totalQueued = entries.filter((e) => e.status === 'queued').length;

  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 text-white">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart2 className="w-5 h-5" /> Email History
            </h2>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm text-purple-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-green-300">{totalSent}</p>
            <p className="text-xs text-purple-300 mt-1">Sent</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-300">{totalQueued}</p>
            <p className="text-xs text-purple-300 mt-1">Queued</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-red-300">{totalFailed}</p>
            <p className="text-xs text-purple-300 mt-1">Failed</p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, query, phone, token…"
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-white/10 border border-white/20 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-indigo-900">All</option>
              <option value="sent" className="bg-indigo-900">Sent</option>
              <option value="queued" className="bg-indigo-900">Queued</option>
              <option value="failed" className="bg-indigo-900">Failed</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-purple-300">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-semibold">
              {entries.length === 0 ? 'No emails yet' : 'No results found'}
            </p>
            <p className="text-sm mt-1">
              {entries.length === 0 ? 'Sent emails will appear here after a query is submitted' : 'Try adjusting your search or filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e, i) => {
              const entryId = e.id || e.token || String(i);
              const isExpanded = expandedId === entryId;
              return (
                <div key={entryId} className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
                  {/* Summary row */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={e.status} />
                          {e.token && (
                            <span className="text-xs text-purple-400 font-mono">{e.token}</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold truncate">{e.subject || 'ULAVI Support Query'}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                          {e.from_email && (
                            <p className="text-xs text-purple-300 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {e.from_email}
                            </p>
                          )}
                          {e.phone_number && (
                            <p className="text-xs text-purple-300 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {e.phone_number}
                            </p>
                          )}
                        </div>
                        {e.query && (
                          <p className="text-xs text-purple-200 mt-2 line-clamp-2 leading-relaxed">{e.query}</p>
                        )}
                        {e.error && (
                          <p className="text-xs text-red-300 mt-1.5 flex items-start gap-1">
                            <XCircle className="w-3 h-3 flex-shrink-0 mt-0.5" /> {e.error}
                          </p>
                        )}
                        {(e.timestamp || e.created_at) && (
                          <p className="text-xs text-purple-400 mt-2">
                            {new Date(e.timestamp || e.created_at || '').toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {e.body && (
                      <button
                        onClick={() => toggleExpand(entryId)}
                        className="mt-3 flex items-center gap-1 text-xs text-purple-300 hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? 'Hide' : 'View'} full email
                      </button>
                    )}
                  </div>

                  {/* Expanded body */}
                  {isExpanded && e.body && (
                    <div className="border-t border-white/10 px-5 pb-5 pt-4">
                      <p className="text-xs uppercase tracking-widest text-purple-400 mb-2">Email Body</p>
                      <pre className="text-xs text-purple-100 leading-relaxed whitespace-pre-wrap font-sans bg-white/5 rounded-xl p-4 max-h-64 overflow-y-auto">
                        {e.body}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-center text-xs text-purple-400 mt-6">
            Showing {filtered.length} of {entries.length} total email{entries.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
