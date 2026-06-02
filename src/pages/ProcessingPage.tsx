import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Clock } from 'lucide-react';
import { transcribeAudio } from '../lib/api';
import { TranscriptData } from '../types';

interface Props {
  audioBlob: Blob | null;
  language: string;
  onComplete: (data: TranscriptData) => void;
  onError: (err: string) => void;
}

export default function ProcessingPage({ audioBlob, language, onComplete, onError }: Props) {
  const calledRef = useRef(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!audioBlob || calledRef.current) return;
    calledRef.current = true;

    transcribeAudio(audioBlob, language)
      .then((data) => {
        onComplete({
          original: data.transcript,
          english: data.english_translation || data.transcript,
          language,
        });
      })
      .catch((err) => {
        onError(err?.response?.data?.detail || err.message || 'Transcription failed');
      });
  }, [audioBlob, language]);

  const isFirstRun = seconds > 20;
  const isDownloading = seconds > 40;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-6 text-white">
      <div className="text-center max-w-md">
        <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-purple-300" />
        <h2 className="text-2xl font-bold mb-2">Processing Audio</h2>
        <p className="text-purple-200 mb-1">Transcribing and translating your recording…</p>

        <div className="text-sm text-purple-400 font-mono mb-6">{seconds}s elapsed</div>

        {isDownloading && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl px-5 py-4 text-sm text-yellow-200 flex items-start gap-3">
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-300" />
            <div className="text-left">
              <p className="font-semibold mb-1">Downloading Whisper model…</p>
              <p className="text-yellow-300">The AI model is downloading for the first time (~150MB for tiny). This only happens once — future recordings will be much faster.</p>
            </div>
          </div>
        )}

        {isFirstRun && !isDownloading && (
          <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-sm text-purple-200 flex items-start gap-3">
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-300" />
            <div className="text-left">
              <p className="font-semibold mb-1">This is taking a moment…</p>
              <p>First run loads the Whisper model into memory. Please wait — don't close the window.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
