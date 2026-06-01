import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-6 text-white">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-purple-300" />
        <h2 className="text-2xl font-bold mb-2">Processing Audio</h2>
        <p className="text-purple-200">Transcribing and translating your recording…</p>
        <p className="text-sm text-purple-300 mt-2">This may take a few seconds</p>
      </div>
    </div>
  );
}
