import React, { useState, useRef } from 'react';
import { Mic, Square, ArrowLeft } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'ja', label: 'Japanese' },
];

interface Props {
  onBack: () => void;
  onRecordingComplete: (blob: Blob, language: string) => void;
}

export default function RecordingPage({ onBack, onRecordingComplete }: Props) {
  const [language, setLanguage] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob, language);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      alert('Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-md w-full">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-6">Voice Recording</h2>

          <div className="mb-6">
            <label className="block text-sm text-purple-200 mb-2">Select Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isRecording}
              className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="text-gray-900 bg-white">{l.label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center mb-6">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-purple-500'}`}>
              <Mic className="w-14 h-14" />
            </div>
          </div>

          {isRecording && (
            <div className="mb-4 text-2xl font-mono text-red-300">{fmt(seconds)}</div>
          )}

          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-full bg-white text-purple-900 font-bold py-4 rounded-2xl text-lg hover:bg-purple-100 transition-all"
            >
              <Mic className="inline w-5 h-5 mr-2 mb-0.5" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl text-lg hover:bg-red-600 transition-all"
            >
              <Square className="inline w-5 h-5 mr-2 mb-0.5" />
              Stop Recording
            </button>
          )}

          <p className="text-xs text-purple-300 mt-4">
            Speak clearly for 5–20 seconds for best results
          </p>
        </div>
      </div>
    </div>
  );
}
