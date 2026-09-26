import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, MessageSquare, User, Sparkles, MapPin, Clock, Linkedin, Instagram, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { createContactMessage } from '../lib/supabase';

interface ContactSectionProps {
  language: Language;
  recipientEmail?: string;
  telegramUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  language,
  recipientEmail = 'vrishketuray000@gmail.com',
  telegramUrl = 'https://t.me/thevrishbihari',
  instagramUrl = 'https://instagram.com/thevrishbihari',
  linkedinUrl = 'https://linkedin.com/in/vrishketu-ray'
}) => {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await createContactMessage({
        sender_name: senderName.trim(),
        sender_email: senderEmail.trim(),
        message: message.trim()
      });

      setIsSubmitting(false);

      if (res.success) {
        setFeedback({
          type: 'success',
          text: language === 'hi' 
            ? 'धन्यवाद! आपका संदेश सफलतापूर्वक भेज दिया गया है। ऋषिकेतू राय जल्द ही आपसे संपर्क करेंगे।'
            : 'Thank you! Your message has been sent successfully. Vrishketu Ray will get back to you shortly.'
        });
        setSenderName('');
        setSenderEmail('');
        setMessage('');
        setTimeout(() => setFeedback(null), 8000);
      } else {
        setFeedback({
          type: 'error',
          text: res.error || (language === 'hi' ? 'संदेश भेजने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to send message. Please try again.')
        });
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'An unexpected error occurred.'
      });
    }
  };

  return (
    <section id="contact-section" className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
      {/* Background Accent Glows */}
      <div className="absolute top-0 left-1/4 -mt-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सीधे संपर्क करें' : 'Get in Touch'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            {language === 'hi' ? 'बातचीत शुरू करें या सहयोग प्रस्ताव भेजें' : "Let's Build Something Exceptional"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            {language === 'hi'
              ? 'चाहे आपके पास कोई फुल-स्टैक प्रोजेक्ट, एडटेक इनोवेशन, कंसल्टिंग अवसर हो या सिर्फ नमस्ते कहना हो — संदेश भेजें।'
              : 'Have an EdTech venture, full-stack architectural question, partnership proposal, or consulting opportunity? Send a direct message.'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/60 border border-gray-700/60">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'hi' ? 'त्वरित प्रतिक्रिया: 24 घंटे' : 'Quick Response: < 24h'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info & Value Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'सीधा संपर्क' : 'Direct Channels'}</span>
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {language === 'hi' 
                ? 'टेलीग्राम, इंस्टाग्राम, लिंक्डइन या ईमेल के ज़रिए सीधे जुड़ें। सभी संदेश सुरक्षित रूप से व्यवस्थापक को भेजे जाते हैं।'
                : 'Connect instantly across preferred direct channels or send a structured inquiry through the form.'}
            </p>

            {/* 4 Direct Channel Buttons */}
            <div className="pt-2 space-y-2">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-200 hover:text-white transition group text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-sm">
                    <Send className="w-3.5 h-3.5 translate-x-px -translate-y-px" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Telegram</p>
                    <p className="text-[10px] text-sky-300/80">@thevrishbihari</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/25 text-pink-200 hover:text-white transition group text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                    <Instagram className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Instagram</p>
                    <p className="text-[10px] text-pink-300/80">@thevrishbihari</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-pink-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/25 text-blue-200 hover:text-white transition group text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#0A66C2] flex items-center justify-center text-white shadow-sm">
                    <Linkedin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">LinkedIn</p>
                    <p className="text-[10px] text-blue-300/80">vrishketu-ray</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href={`mailto:${recipientEmail}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700/80 text-gray-200 hover:text-white transition group text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Email Address</p>
                    <p className="text-[10px] text-gray-400 font-mono">{recipientEmail}</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-200">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>{language === 'hi' ? 'स्थान व टाइमज़ोन' : 'Location & Availability'}</span>
            </div>
            <p className="text-xs text-gray-400">
              {language === 'hi' ? 'भारत (IST) • वैश्विक रिमोट सहयोग व परामर्श के लिए उपलब्ध' : 'India (IST) • Open for global remote contracts, startup advisory & technical leadership'}
            </p>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-gray-950/90 border border-gray-800/90 p-6 sm:p-7 rounded-2xl shadow-xl">
          {feedback && (
            <div className={`p-4 rounded-xl text-xs flex items-start gap-3 mb-5 animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-bold">
                  {feedback.type === 'success' 
                    ? (language === 'hi' ? 'सफलतापूर्वक भेजा गया' : 'Message Delivered') 
                    : (language === 'hi' ? 'भेजने में त्रुटि' : 'Submission Failed')}
                </p>
                <p className="leading-relaxed">{feedback.text}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sender Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>{language === 'hi' ? 'आपका नाम (Full Name)' : 'Your Full Name'}</span>
                </label>
                <input
                  type="text"
                  required
                  id="contact-sender-name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder={language === 'hi' ? 'जैसे: राहुल शर्मा' : 'e.g. Alex Morgan / Sarah Jenkins'}
                  className="w-full bg-gray-900 border border-gray-700/90 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-gray-600"
                />
              </div>

              {/* Sender Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>{language === 'hi' ? 'ईमेल पता (Email Address)' : 'Your Email Address'}</span>
                </label>
                <input
                  type="email"
                  required
                  id="contact-sender-email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full bg-gray-900 border border-gray-700/90 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'hi' ? 'संदेश / प्रस्ताव (Message)' : 'Message or Project Inquiry'}</span>
              </label>
              <textarea
                required
                id="contact-message-body"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={language === 'hi' 
                  ? 'अपने प्रोजेक्ट, आवश्यकता या सहयोग के बारे में विस्तार से लिखें...' 
                  : 'Describe your project, timeline, scope, or collaboration idea...'}
                className="w-full bg-gray-900 border border-gray-700/90 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-gray-600 resize-y"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-[11px] text-gray-500">
                {language === 'hi' ? '🔒 आपका डेटा सुरक्षित रहेगा और केवल व्यवस्थापक को दिखेगा।' : '🔒 Private submission synced directly to admin records.'}
              </span>
              <button
                type="submit"
                id="contact-submit-btn"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition active:scale-95 shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{language === 'hi' ? 'भेजा जा रहा है...' : 'Sending...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'संदेश भेजें' : 'Send Message'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
