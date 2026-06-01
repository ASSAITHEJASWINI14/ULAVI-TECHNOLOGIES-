import React, { useEffect, useState } from 'react';
import { Mic, Globe, Mail, BarChart2, Settings, CheckCircle, Zap } from 'lucide-react';
import { api } from '../lib/api';

interface Props {
  onStart: () => void;
  onDashboard: () => void;
  onSettings: () => void;
}

export default function LandingPage({ onStart, onDashboard, onSettings }: Props) {
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    api.get('/api/settings/ai-status')
      .then((res) => setAiEnabled(res.data.enabled))
      .catch(() => setAiEnabled(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-6 text-white">
      {/* Settings button top-right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onSettings}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full transition-all"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
          {aiEnabled === true && (
            <span className="flex items-center gap-1 text-green-300 text-xs ml-1">
              <CheckCircle className="w-3 h-3" /> AI On
            </span>
          )}
          {aiEnabled === false && (
            <span className="flex items-center gap-1 text-yellow-300 text-xs ml-1">
              <Zap className="w-3 h-3" /> AI Off
            </span>
          )}
        </button>
      </div>

      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-6">
            <Globe className="w-16 h-16 text-purple-200" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 tracking-tight">ULAVI</h1>
        <p className="text-xl text-purple-200 mb-2">Multilingual Voice Support Platform</p>
        <p className="text-sm text-purple-300 mb-12">
          Record in any language · Transcribe · Translate · Get AI Consultation · Email Support
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <Mic className="w-8 h-8 mb-3 text-pink-300 mx-auto" />
            <h3 className="font-semibold mb-1">Voice Recording</h3>
            <p className="text-xs text-purple-200">Speak in your native language</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <Globe className="w-8 h-8 mb-3 text-blue-300 mx-auto" />
            <h3 className="font-semibold mb-1">AI Translation</h3>
            <p className="text-xs text-purple-200">Whisper-powered transcription &amp; translation</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <Mail className="w-8 h-8 mb-3 text-green-300 mx-auto" />
            <h3 className="font-semibold mb-1">Email Support</h3>
            <p className="text-xs text-purple-200">Send structured support requests</p>
          </div>
        </div>

        {/* AI status banner */}
        {aiEnabled === false && (
          <div
            onClick={onSettings}
            className="cursor-pointer mb-6 inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-200 text-sm px-5 py-2.5 rounded-full hover:bg-yellow-400/20 transition-all"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            AI chat is in fallback mode —
            <span className="font-semibold underline underline-offset-2">add OpenAI key to enable</span>
          </div>
        )}
        {aiEnabled === true && (
          <div className="mb-6 inline-flex items-center gap-2 bg-green-400/10 border border-green-400/30 text-green-200 text-sm px-5 py-2.5 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-300" />
            AI-powered chat &amp; recommendations are active
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onStart}
            className="bg-white text-purple-900 font-bold py-4 px-10 rounded-full text-lg hover:bg-purple-100 transition-all transform hover:scale-105 shadow-lg"
          >
            <Mic className="inline w-5 h-5 mr-2 mb-0.5" />
            Start Recording
          </button>
          <button
            onClick={onDashboard}
            className="bg-white/20 border border-white/30 text-white font-semibold py-4 px-10 rounded-full text-lg hover:bg-white/30 transition-all"
          >
            <BarChart2 className="inline w-5 h-5 mr-2 mb-0.5" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
