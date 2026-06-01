import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import RecordingPage from './pages/RecordingPage';
import ProcessingPage from './pages/ProcessingPage';
import TranscriptPage from './pages/TranscriptPage';
import ConsultationPage from './pages/ConsultationPage';
import ContactPage from './pages/ContactPage';
import EmailPreviewPage from './pages/EmailPreviewPage';
import SuccessPage from './pages/SuccessPage';
import DashboardPage from './pages/DashboardPage';
import { AppScreen, TranscriptData, ContactData, ConsultationData } from './types';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioLanguage, setAudioLanguage] = useState('en');
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [contact, setContact] = useState<ContactData | null>(null);
  const [referenceToken, setReferenceToken] = useState('');
  const [processingError, setProcessingError] = useState('');

  const resetAll = () => {
    setAudioBlob(null);
    setTranscript(null);
    setConsultation(null);
    setContact(null);
    setReferenceToken('');
    setProcessingError('');
    setScreen('landing');
  };

  if (screen === 'landing') {
    return (
      <LandingPage
        onStart={() => setScreen('recording')}
        onDashboard={() => setScreen('dashboard')}
      />
    );
  }

  if (screen === 'recording') {
    return (
      <RecordingPage
        onBack={() => setScreen('landing')}
        onRecordingComplete={(blob, lang) => {
          setAudioBlob(blob);
          setAudioLanguage(lang);
          setScreen('processing');
        }}
      />
    );
  }

  if (screen === 'processing') {
    if (processingError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-6 text-white">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-500/20 rounded-2xl p-6 mb-6">
              <p className="text-lg font-semibold mb-2">Processing Failed</p>
              <p className="text-sm text-red-200">{processingError}</p>
            </div>
            <button
              onClick={() => { setProcessingError(''); setScreen('recording'); }}
              className="bg-white text-purple-900 font-bold py-3 px-8 rounded-2xl hover:bg-purple-100 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return (
      <ProcessingPage
        audioBlob={audioBlob}
        language={audioLanguage}
        onComplete={(data) => {
          setTranscript(data);
          setScreen('transcript');
        }}
        onError={(err) => setProcessingError(err)}
      />
    );
  }

  if (screen === 'transcript' && transcript) {
    return (
      <TranscriptPage
        transcript={transcript}
        onBack={() => setScreen('recording')}
        onNext={() => setScreen('consultation')}
      />
    );
  }

  if (screen === 'consultation' && transcript) {
    return (
      <ConsultationPage
        transcript={transcript}
        onBack={() => setScreen('transcript')}
        onNext={(data) => {
          setConsultation(data);
          setScreen('contact');
        }}
      />
    );
  }

  if (screen === 'contact') {
    return (
      <ContactPage
        onBack={() => setScreen('consultation')}
        onNext={(data) => {
          setContact(data);
          setScreen('email-preview');
        }}
      />
    );
  }

  if (screen === 'email-preview' && transcript && contact) {
    return (
      <EmailPreviewPage
        transcript={transcript}
        contact={contact}
        consultation={consultation}
        onBack={() => setScreen('contact')}
        onSuccess={(token) => {
          setReferenceToken(token);
          setScreen('success');
        }}
      />
    );
  }

  if (screen === 'success') {
    return (
      <SuccessPage
        token={referenceToken}
        onNewQuery={resetAll}
        onDashboard={() => setScreen('dashboard')}
      />
    );
  }

  if (screen === 'dashboard') {
    return (
      <DashboardPage
        onBack={() => setScreen('landing')}
      />
    );
  }

  return null;
}
