import React, { useState } from 'react';
import { ArrowLeft, Send, Loader2, Mail } from 'lucide-react';
import { TranscriptData, ContactData, ConsultationData } from '../types';
import { sendEmail } from '../lib/api';

interface Props {
  transcript: TranscriptData;
  contact: ContactData;
  consultation: ConsultationData | null;
  onBack: () => void;
  onSuccess: (token: string) => void;
}

export default function EmailPreviewPage({ transcript, contact, consultation, onBack, onSuccess }: Props) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const timestamp = new Date().toISOString();
  const phoneNumber = `${contact.countryCode} ${contact.phone}`;

  const buildEmailBody = () => {
    let body = `QUERY:\n${transcript.english}\n\nPHONE NUMBER:\n${phoneNumber}\n\nTIMESTAMP:\n${timestamp}`;

    if (consultation) {
      const { days, persons, budget, packagePreference, foodPreference, additionalPreferences, chatHistory, recommendations } = consultation;
      if (days || persons || budget) {
        body += '\n\n--- CONSULTATION DETAILS ---';
        if (days) body += `\nDays: ${days}`;
        if (persons) body += `\nPersons: ${persons}`;
        if (budget) body += `\nBudget: ${budget}`;
        if (packagePreference) body += `\nPackage: ${packagePreference}`;
        if (foodPreference) body += `\nFood Preference: ${foodPreference}`;
        if (additionalPreferences) body += `\nAdditional: ${additionalPreferences}`;
      }
      if (chatHistory.length > 0) {
        body += '\n\n--- Q&A ---';
        chatHistory.forEach((m) => {
          body += `\n${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`;
        });
      }
      if (recommendations) {
        body += `\n\n--- RECOMMENDATIONS ---\n${recommendations}`;
      }
    }
    return body;
  };

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      const res = await sendEmail({
        to_email: contact.toEmail,
        from_email: contact.fromEmail,
        subject: `ULAVI Support Query — ${new Date().toLocaleString()}`,
        query: transcript.english,
        phone_number: phoneNumber,
        timestamp,
        consultation: consultation || undefined,
      });
      onSuccess(res.token || 'ULAVI-' + Date.now().toString(36).toUpperCase());
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6 pt-4">
          <button onClick={onBack} className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mail className="w-5 h-5" /> Email Preview
          </h2>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6">
          <div className="space-y-3 text-sm mb-4">
            <div className="flex gap-4">
              <span className="text-purple-300 w-12">From:</span>
              <span>{contact.fromEmail}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-purple-300 w-12">To:</span>
              <span>{contact.toEmail}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-purple-300 w-12">Subject:</span>
              <span>ULAVI Support Query — {new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            <h4 className="text-xs uppercase tracking-widest text-purple-300 mb-3">Email Body</h4>
            <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-white/10 rounded-2xl p-4">
              {buildEmailBody()}
            </pre>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 mb-4 text-red-200 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full bg-white text-purple-900 font-bold py-4 rounded-2xl text-lg hover:bg-purple-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {sending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Sending…</>
          ) : (
            <><Send className="w-5 h-5" /> Confirm &amp; Send Email</>
          )}
        </button>
      </div>
    </div>
  );
}
