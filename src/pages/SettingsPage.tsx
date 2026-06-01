import React, { useState, useEffect } from 'react';
import { ArrowLeft, Key, CheckCircle, XCircle, Eye, EyeOff, Save, Loader2, Sparkles, Zap, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';

interface Props {
  onBack: () => void;
}

interface AIStatus {
  enabled: boolean;
  has_key: boolean;
  model: string;
}

export default function SettingsPage({ onBack }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testMsg, setTestMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/settings/ai-status');
      setStatus(res.data);
    } catch {
      setStatus({ enabled: false, has_key: false, model: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await api.post('/api/settings/openai-key', { api_key: apiKey.trim() });
      if (res.data.success) {
        setSaveMsg({ type: 'success', text: 'API key saved! AI-powered responses are now active.' });
        setApiKey('');
        await fetchStatus();
      } else {
        setSaveMsg({ type: 'error', text: res.data.message || 'Failed to save key.' });
      }
    } catch (e: any) {
      setSaveMsg({ type: 'error', text: e?.response?.data?.detail || 'Could not reach backend.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestMsg(null);
    try {
      const res = await api.post('/api/consultation/chat', {
        query: 'Hello, are you working?',
        context: {},
      });
      setTestMsg({ type: 'success', text: `AI responded: "${res.data.answer.slice(0, 120)}${res.data.answer.length > 120 ? '…' : ''}"` });
    } catch (e: any) {
      setTestMsg({ type: 'error', text: 'Test failed. Check if the backend is running.' });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await api.post('/api/settings/openai-key', { api_key: '' });
      setSaveMsg({ type: 'success', text: 'API key removed. Using built-in fallback responses.' });
      await fetchStatus();
    } catch {
      setSaveMsg({ type: 'error', text: 'Could not clear key.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 text-white">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-8 pt-4">
          <button onClick={onBack} className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-xl font-bold">Settings</h2>
        </div>

        {/* AI Status Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" /> AI Status
            </h3>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-purple-300" />
            ) : status?.enabled ? (
              <span className="flex items-center gap-1.5 text-green-300 text-sm font-semibold bg-green-400/10 border border-green-400/30 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4" /> AI Enabled
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-yellow-300 text-sm font-semibold bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 rounded-full">
                <Zap className="w-4 h-4" /> Fallback Mode
              </span>
            )}
          </div>

          {!loading && (
            <div className="text-sm text-purple-200 leading-relaxed">
              {status?.enabled ? (
                <>
                  <p className="mb-1">
                    <span className="text-white font-medium">OpenAI GPT</span> is active and powering your AI consultation chat and recommendations.
                  </p>
                  {status.model && (
                    <p className="text-xs text-purple-300">Model: {status.model}</p>
                  )}
                </>
              ) : (
                <p>
                  Using built-in fallback responses. Add an OpenAI API key below to enable
                  <span className="text-white font-medium"> GPT-powered</span> chat and recommendations.
                </p>
              )}
            </div>
          )}

          {!loading && status?.enabled && (
            <button
              onClick={handleClear}
              disabled={saving}
              className="mt-4 text-xs text-red-300 hover:text-red-200 transition-colors flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" /> Remove API key
            </button>
          )}
        </div>

        {/* API Key Input */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-5">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
            <Key className="w-5 h-5 text-purple-300" /> OpenAI API Key
          </h3>
          <p className="text-xs text-purple-300 mb-5">
            Your key is stored in memory only — never written to disk or sent anywhere except OpenAI.
          </p>

          <div className="relative mb-4">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="sk-proj-..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-sm font-mono text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-200 transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !apiKey.trim()}
            className="w-full bg-white text-purple-900 font-bold py-3 rounded-2xl hover:bg-purple-100 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mb-3"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save &amp; Activate</>
            )}
          </button>

          {saveMsg && (
            <div className={`rounded-2xl px-4 py-3 text-sm flex items-start gap-2 ${saveMsg.type === 'success' ? 'bg-green-400/10 border border-green-400/30 text-green-200' : 'bg-red-400/10 border border-red-400/30 text-red-200'}`}>
              {saveMsg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              {saveMsg.text}
            </div>
          )}
        </div>

        {/* Test AI */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-5">
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-300" /> Test AI Response
          </h3>
          <p className="text-xs text-purple-300 mb-4">Send a quick ping to verify the AI assistant is responding.</p>

          <button
            onClick={handleTest}
            disabled={testing}
            className="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-2xl hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {testing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Testing…</>
            ) : (
              <><Zap className="w-4 h-4" /> Test AI Now</>
            )}
          </button>

          {testMsg && (
            <div className={`mt-3 rounded-2xl px-4 py-3 text-sm flex items-start gap-2 ${testMsg.type === 'success' ? 'bg-green-400/10 border border-green-400/30 text-green-200' : 'bg-red-400/10 border border-red-400/30 text-red-200'}`}>
              {testMsg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              {testMsg.text}
            </div>
          )}
        </div>

        {/* How to get a key */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="font-semibold mb-3 text-sm text-purple-200 uppercase tracking-widest">How to get an API key</h3>
          <ol className="space-y-2 text-sm text-purple-200">
            <li className="flex gap-2"><span className="text-purple-400 font-bold">1.</span> Go to <span className="text-white font-medium">platform.openai.com</span></li>
            <li className="flex gap-2"><span className="text-purple-400 font-bold">2.</span> Sign in or create an account</li>
            <li className="flex gap-2"><span className="text-purple-400 font-bold">3.</span> Navigate to <span className="text-white font-medium">API Keys</span> in the dashboard</li>
            <li className="flex gap-2"><span className="text-purple-400 font-bold">4.</span> Click <span className="text-white font-medium">Create new secret key</span></li>
            <li className="flex gap-2"><span className="text-purple-400 font-bold">5.</span> Copy it and paste it above</li>
          </ol>
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-purple-300 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open OpenAI API Keys
          </a>
        </div>
      </div>
    </div>
  );
}
