import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2, 
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../data/defaultData';
import { testSupabaseConnection } from '../lib/supabase';
import { Language } from '../types';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  currentAnonKey: string;
  isConnected: boolean;
  onSaveConfig: (url: string, anonKey: string) => Promise<void>;
  onClearConfig: () => void;
  language: Language;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  currentAnonKey,
  isConnected,
  onSaveConfig,
  onClearConfig,
  language
}) => {
  const [url, setUrl] = useState(currentUrl);
  const [anonKey, setAnonKey] = useState(currentAnonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url || !anonKey) {
      setTestResult({
        success: false,
        message: language === 'hi' ? 'कृपया URL और Anon Key दर्ज करें!' : 'Please enter Supabase URL and Anon Key!'
      });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, anonKey);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveConfig(url, anonKey);
    onClose();
  };

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                {language === 'hi' ? 'सुपाबेस डेटाबेस सेटिंग्स' : 'Supabase Database Connection'}
              </h3>
              <p className="text-xs text-gray-400">
                {language === 'hi' 
                  ? 'रियल-टाइम क्लाउड सिंक या स्थानीय स्टोरेज प्रबंधित करें' 
                  : 'Configure Supabase Cloud Sync or use Local Demo mode'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status */}
        <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
          isConnected
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          {isConnected ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <HardDrive className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="font-semibold text-sm">
              {isConnected 
                ? (language === 'hi' ? 'सुपाबेस क्लाउड लाइव कनेक्टेड है' : 'Supabase Cloud Live Connected')
                : (language === 'hi' ? 'लोकल स्टोरेज मोड सक्रिय है' : 'Local Storage Mode Active')}
            </p>
            <p className="text-gray-400 text-xs">
              {isConnected
                ? (language === 'hi' ? 'आपके प्रोफाइल और मीडिया पोस्ट्स सीधे सुपाबेस क्लाउड डेटाबेस पर सेव हो रहे हैं।' : 'Data is saving directly to your Supabase PostgreSQL cloud database.')
                : (language === 'hi' ? 'सुपाबेस की डिटेल्स न होने पर ऐप ब्राउज़र के लोकल स्टोरेज में पूरी तरह काम करता है।' : 'The application is fully functional using your local browser storage. Enter your credentials below to connect to your live Supabase cloud project.')}
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-blue-500 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Supabase Anon / Public Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-blue-500 transition font-mono"
            />
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
              testResult.success 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}>
              {testResult.success ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition flex items-center gap-1.5"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-blue-400" />}
              <span>{language === 'hi' ? 'कनेक्शन टेस्ट करें' : 'Test Connection'}</span>
            </button>

            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
            >
              {language === 'hi' ? 'कॉन्फ़िगरेशन सेव करें' : 'Save & Connect'}
            </button>

            {isConnected && (
              <button
                type="button"
                onClick={() => {
                  onClearConfig();
                  setUrl('');
                  setAnonKey('');
                  setTestResult(null);
                }}
                className="px-3 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-600/30 text-xs font-medium transition"
              >
                {language === 'hi' ? 'डिस्कनेक्ट' : 'Disconnect'}
              </button>
            )}
          </div>
        </form>

        {/* Supabase SQL Table Setup Instructions */}
        <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <span>SQL Schema Script for Supabase</span>
            </span>
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {language === 'hi'
              ? 'सुपाबेस डैशबोर्ड में SQL Editor खोलें और इस स्क्रिप्ट को पेस्ट करके "Run" करें। इससे portfolio_info, media_posts और post_likes टेबल तैयार हो जाएंगे।'
              : 'Paste this script into the Supabase Dashboard SQL Editor and click "Run". It automatically configures the portfolio_info, media_posts, and post_likes tables with public access policies.'}
          </p>
          <div className="bg-gray-900 rounded-xl p-3 text-[11px] font-mono text-gray-400 max-h-32 overflow-y-auto border border-gray-800 select-all">
            {SUPABASE_SQL_SCHEMA}
          </div>
        </div>
      </div>
    </div>
  );
};
