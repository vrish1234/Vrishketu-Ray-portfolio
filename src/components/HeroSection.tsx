import React from 'react';
import { 
  Mail, 
  Github, 
  Linkedin, 
  Twitter, 
  Instagram,
  MapPin, 
  Sparkles, 
  Rocket, 
  Heart, 
  Layers, 
  ExternalLink, 
  ShieldCheck, 
  Send,
  MessageCircle,
  MessageSquare
} from 'lucide-react';
import { ProfileInfo, Language } from '../types';

interface HeroSectionProps {
  profile: ProfileInfo;
  totalPosts: number;
  totalLikes: number;
  language: Language;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  totalPosts,
  totalLikes,
  language
}) => {
  const telegramUrl = profile.telegram || 'https://t.me/thevrishbihari';
  const instagramUrl = profile.instagram || 'https://instagram.com/thevrishbihari';
  const linkedinUrl = profile.linkedin || 'https://linkedin.com/in/vrishketu-ray';
  const emailAddress = profile.email || 'vrishketuray000@gmail.com';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
      {/* Background Accent Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Profile Info Header */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Profile Avatar with Live Status */}
        <div className="relative group shrink-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-blue-500/40 p-1 bg-gray-800 shadow-xl shadow-blue-500/10 transition-transform group-hover:scale-105 duration-300">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl font-bold text-white rounded-xl">
                VR
              </div>
            )}
          </div>
          <span 
            className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-gray-900 rounded-full" 
            title="Available for collaboration & development" 
          />
        </div>

        {/* Profile Details */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 id="profile-name" className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-heading">
                {profile.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {language === 'hi' ? 'सक्रिय डेवलपर' : 'Available for Work'}
              </span>
            </div>

            <p id="profile-title" className="text-lg sm:text-xl font-medium text-blue-400">
              {profile.title}
            </p>
          </div>

          <p id="profile-bio" className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            {profile.bio}
          </p>

          {/* Key Direct Connect Channels Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1 pb-1">
            {/* Telegram Direct Channel */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect on Telegram"
              className="group/btn inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 hover:text-white border border-sky-500/30 hover:border-sky-400/60 text-xs font-semibold shadow-sm hover:shadow-md hover:shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
              title="Telegram: @thevrishbihari"
            >
              <div className="w-5 h-5 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-sm">
                <Send className="w-3 h-3 translate-x-px -translate-y-px" />
              </div>
              <span>Telegram</span>
              <ExternalLink className="w-3 h-3 text-sky-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all duration-200" />
            </a>

            {/* Instagram Direct Channel (@thevrishbihari) */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Instagram @thevrishbihari"
              className="group/btn inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-amber-500/15 hover:from-pink-500/25 hover:via-purple-500/25 hover:to-amber-500/25 text-pink-200 hover:text-white border border-pink-500/30 hover:border-pink-400/60 text-xs font-semibold shadow-sm hover:shadow-md hover:shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
              title="Instagram: @thevrishbihari"
            >
              <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <Instagram className="w-3 h-3" />
              </div>
              <span>@thevrishbihari</span>
              <ExternalLink className="w-3 h-3 text-pink-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all duration-200" />
            </a>

            {/* LinkedIn Direct Channel */}
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit LinkedIn Profile"
              className="group/btn inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0A66C2]/15 hover:bg-[#0A66C2]/25 text-blue-200 hover:text-white border border-[#0A66C2]/35 hover:border-[#0A66C2]/60 text-xs font-semibold shadow-sm hover:shadow-md hover:shadow-[#0A66C2]/20 hover:scale-105 active:scale-95 transition-all duration-200"
              title={`LinkedIn: ${linkedinUrl}`}
            >
              <div className="w-5 h-5 rounded-lg bg-[#0A66C2] flex items-center justify-center text-white shadow-sm">
                <Linkedin className="w-3 h-3" />
              </div>
              <span>LinkedIn</span>
              <ExternalLink className="w-3 h-3 text-blue-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all duration-200" />
            </a>

            {/* Direct Email Address */}
            <a
              href={`mailto:${emailAddress}`}
              aria-label="Send direct email"
              className="group/btn inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-800/90 hover:bg-gray-800 text-gray-200 hover:text-white border border-gray-700/80 hover:border-blue-500/50 text-xs font-semibold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
              title={`Email: ${emailAddress}`}
            >
              <div className="w-5 h-5 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Mail className="w-3 h-3" />
              </div>
              <span>{emailAddress}</span>
            </a>

            {/* GitHub Profile (if set) */}
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit GitHub Profile"
                className="group/btn inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white border border-gray-700/80 hover:border-gray-500 text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
                title={`GitHub: ${profile.github}`}
              >
                <Github className="w-3.5 h-3.5 text-gray-300 group-hover/btn:text-white" />
                <span>GitHub</span>
              </a>
            )}

            {/* Twitter Profile (if set) */}
            {profile.twitter && (
              <a
                href={profile.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Twitter Profile"
                className="group/btn inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-sky-300 border border-gray-700/80 hover:border-sky-500/50 text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
                title={`Twitter / X: ${profile.twitter}`}
              >
                <Twitter className="w-3.5 h-3.5 text-sky-400" />
                <span>Twitter / X</span>
              </a>
            )}
          </div>

          {/* Key Ventures / Highlight Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-800/80 border border-gray-700/80 text-xs text-gray-200">
              <Rocket className="w-3.5 h-3.5 text-blue-400" />
              <span>Founder: <strong>Ugrasena Educum</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-800/80 border border-gray-700/80 text-xs text-gray-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Creator: <strong>AI-Edura</strong></span>
            </div>
            {profile.location && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-800/80 border border-gray-700/80 text-xs text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          {/* Skills Badges */}
          <div id="skills-container" className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
            {(Array.isArray(profile?.skills) 
              ? profile.skills 
              : (typeof profile?.skills === 'string' ? (profile.skills as string).split(',') : [])
            ).map((skill, index) => {
              const label = typeof skill === 'string' ? skill.trim() : String(skill || '');
              if (!label) return null;
              return (
                <span
                  key={index}
                  className="bg-blue-600/15 text-blue-300 hover:bg-blue-600/25 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/30 transition-colors"
                >
                  {label}
                </span>
              );
            })}
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 pt-3 border-t border-gray-800/80">
            <div className="flex items-center gap-2.5">
              <a
                href={`mailto:${emailAddress}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm"
                title="Send an Email"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ईमेल भेजें' : 'Get in Touch'}</span>
              </a>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  <strong className="text-white font-semibold">{totalPosts}</strong> {language === 'hi' ? 'प्रोजेक्ट्स' : 'Projects'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
                <span>
                  <strong className="text-white font-semibold">{totalLikes}</strong> {language === 'hi' ? 'लाइक्स' : 'Total Likes'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Verified Contact Channels Grid */}
      <div className="relative z-10 pt-6 border-t border-gray-800/90 space-y-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-bold text-white tracking-tight font-heading">
              {language === 'hi' ? 'सत्यापित संपर्क व सोशल प्रोफाइल्स' : 'Direct Connect & Verified Channels'}
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Official Links
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {language === 'hi' 
              ? 'Telegram, Instagram, LinkedIn या डायरेक्ट ईमेल के ज़रिए सीधे Vrishketu Ray से संपर्क करें।' 
              : 'Direct access channels to reach Vrishketu Ray for project collaborations, technical consulting, or speaking engagements.'}
          </p>
        </div>

        {/* 4 Direct Channel Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Telegram Card */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 hover:border-sky-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-sky-500/10"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5 translate-x-px -translate-y-px" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  Instant Chat
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                  Telegram
                </h4>
                <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                  @thevrishbihari
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-800/80 flex items-center justify-between text-xs font-semibold text-sky-400">
              <span>{language === 'hi' ? 'मैसेज भेजें' : 'Send Message'}</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* 2. Instagram Card */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 hover:border-pink-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-pink-500/10"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 via-pink-500/20 to-purple-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                  <Instagram className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                  Creator Profile
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                  Instagram
                </h4>
                <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                  @thevrishbihari
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-800/80 flex items-center justify-between text-xs font-semibold text-pink-400">
              <span>{language === 'hi' ? 'फॉलो करें' : 'Follow & DM'}</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* 3. LinkedIn Card */}
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-blue-500/10"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#0A66C2]/15 border border-[#0A66C2]/30 flex items-center justify-center text-[#0A66C2] group-hover:scale-110 transition-transform">
                  <Linkedin className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Professional
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                  LinkedIn
                </h4>
                <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                  vrishketu-ray
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-800/80 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>{language === 'hi' ? 'कनेक्ट करें' : 'Connect'}</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* 4. Direct Email Card */}
          <a
            href={`mailto:${emailAddress}`}
            className="group bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-indigo-500/10"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Direct Inbox
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Email
                </h4>
                <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                  {emailAddress}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400">
              <span>{language === 'hi' ? 'ईमेल लिखें' : 'Write Email'}</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};
