import React, { useState, useRef } from 'react';
import { Mic, Square, ArrowLeft, Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
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

  const selected = LANGUAGES.find((l) => l.code === language)!;

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

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-lg w-full">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-purple-200 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-1 text-center">Voice Recording</h2>
          <p className="text-purple-300 text-sm text-center mb-6">Choose your language, then speak your query</p>

          {/* Language picker */}
          <div className="mb-6">
            <label className="block text-sm text-purple-200 mb-2">Select Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isRecording}
              className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="text-gray-900 bg-white">
                  {l.native} — {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mic button */}
          <div className="flex justify-center mb-5">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                  : 'bg-purple-500 hover:bg-purple-400'
              }`}
            >
              <Mic className="w-12 h-12" />
            </div>
          </div>

          {isRecording && (
            <div className="text-center mb-4">
              <span className="text-3xl font-mono text-red-300">{fmt(seconds)}</span>
              <p className="text-xs text-purple-300 mt-1">Recording in <strong>{selected.label}</strong>…</p>
            </div>
          )}

          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-full bg-white text-purple-900 font-bold py-4 rounded-2xl text-lg hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
            >
              <Mic className="w-5 h-5" /> Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl text-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
            >
              <Square className="w-5 h-5" /> Stop Recording
            </button>
          )}

          <p className="text-xs text-purple-300 mt-4 text-center">
            Speak clearly for 5–20 seconds · Your speech will be translated to English automatically
          </p>
        </div>
      </div>
    </div>
  );
}
