import React from 'react';
import { CheckCircle, BarChart2, Mic } from 'lucide-react';

interface Props {
  token: string;
  onNewQuery: () => void;
  onDashboard: () => void;
}

export default function SuccessPage({ token, onNewQuery, onDashboard }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-400/20 rounded-full p-6">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-2">Email Sent!</h2>
        <p className="text-purple-200 mb-6">Your support query has been delivered successfully.</p>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-8">
          <p className="text-xs text-purple-300 mb-1">Reference Token</p>
          <p className="font-mono text-lg font-bold text-yellow-300">{token}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onNewQuery}
            className="w-full bg-white text-purple-900 font-bold py-4 rounded-2xl text-lg hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
          >
            <Mic className="w-5 h-5" /> New Query
          </button>
          <button
            onClick={onDashboard}
            className="w-full bg-white/20 border border-white/30 text-white font-semibold py-4 rounded-2xl text-lg hover:bg-white/30 transition-all flex items-center justify-center gap-2"
          >
            <BarChart2 className="w-5 h-5" /> View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
