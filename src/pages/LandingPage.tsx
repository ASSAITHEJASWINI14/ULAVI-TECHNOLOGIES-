import React from 'react';
import { Mic, Globe, Mail, BarChart2 } from 'lucide-react';

interface Props {
  onStart: () => void;
  onDashboard: () => void;
}

export default function LandingPage({ onStart, onDashboard }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-6 text-white">
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
