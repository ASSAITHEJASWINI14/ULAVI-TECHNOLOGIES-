import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Globe, Mic, Pencil, CheckCircle } from 'lucide-react';
import { TranscriptData } from '../types';

interface Props {
  transcript: TranscriptData;
  onBack: () => void;
  onNext: (editedEnglish: string) => void;
}

export default function TranscriptPage({ transcript, onBack, onNext }: Props) {
  const [english, setEnglish] = useState(transcript.english);
  const [editing, setEditing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-lg w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-purple-300" />
            <h2 className="text-2xl font-bold">Transcript</h2>
          </div>

          {/* Original */}
          <div className="mb-5">
            <h3 className="text-xs uppercase tracking-widest text-purple-300 mb-2">
              Original ({transcript.language})
            </h3>
            <div className="bg-white/10 rounded-2xl p-4 text-sm leading-relaxed">
              {transcript.original || (
                <span className="text-purple-300 italic">No original transcript</span>
              )}
            </div>
          </div>

          {/* English — editable */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs uppercase tracking-widest text-purple-300">
                English Query
              </h3>
              <button
                onClick={() => setEditing((v) => !v)}
                className="flex items-center gap-1 text-xs text-purple-300 hover:text-white transition-colors"
              >
                {editing ? (
                  <><CheckCircle className="w-3.5 h-3.5 text-green-300" /> Done editing</>
                ) : (
                  <><Pencil className="w-3.5 h-3.5" /> Edit</>
                )}
              </button>
            </div>

            {editing ? (
              <textarea
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                rows={4}
                autoFocus
                className="w-full bg-white/10 border border-purple-400 rounded-2xl p-4 text-sm leading-relaxed text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />
            ) : (
              <div
                onClick={() => setEditing(true)}
                className="bg-white/10 rounded-2xl p-4 text-sm leading-relaxed cursor-text hover:bg-white/15 transition-colors border border-transparent hover:border-white/20"
                title="Click to edit"
              >
                {english || <span className="text-purple-300 italic">No translation</span>}
              </div>
            )}

            <p className="text-xs text-purple-400 mt-1.5">
              Not quite right? Click <strong>Edit</strong> to fix the text before continuing.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => onNext(english)}
              className="w-full bg-white text-purple-900 font-bold py-4 rounded-2xl text-lg hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onBack}
              className="w-full bg-white/10 border border-white/20 text-white font-semibold py-3 rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" /> Record Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
