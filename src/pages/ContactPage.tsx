import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Phone, Mail } from 'lucide-react';
import { ContactData } from '../types';

const COUNTRY_CODES = [
  { code: '+1', country: 'US/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+55', country: 'Brazil' },
  { code: '+971', country: 'UAE' },
  { code: '+65', country: 'Singapore' },
  { code: '+60', country: 'Malaysia' },
  { code: '+92', country: 'Pakistan' },
  { code: '+880', country: 'Bangladesh' },
];

interface Props {
  onBack: () => void;
  onNext: (data: ContactData) => void;
}

export default function ContactPage({ onBack, onNext }: Props) {
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!phone.trim()) { setError('Please enter a phone number'); return; }
    if (!fromEmail.trim()) { setError('Please enter your From email'); return; }
    if (!toEmail.trim()) { setError('Please enter a To email'); return; }
    setError('');
    onNext({ countryCode, phone, fromEmail, toEmail });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-md w-full">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6">Contact Details</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-purple-200 mb-2">
                <Phone className="inline w-4 h-4 mr-1" /> Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code} className="text-gray-900 bg-white">
                      {c.code} {c.country}
                    </option>
                  ))}
                </select>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="flex-1 bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-sm placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-purple-200 mb-2">
                <Mail className="inline w-4 h-4 mr-1" /> From Email (your Gmail)
              </label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="sender@gmail.com"
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-sm placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm text-purple-200 mb-2">
                <Mail className="inline w-4 h-4 mr-1" /> To Email (support address)
              </label>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="support@example.com"
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-sm placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {error && <p className="text-red-300 text-sm">{error}</p>}

            <button
              onClick={handleNext}
              className="w-full bg-white text-purple-900 font-bold py-4 rounded-2xl text-lg hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
            >
              Preview Email <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
