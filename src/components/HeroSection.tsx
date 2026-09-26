import React, { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Clock,
  GraduationCap,
  BookOpen,
  Code2,
  Compass
} from 'lucide-react';
import { ProfileInfo, Language, Story } from '../types';

interface HeroSectionProps {
  profile: ProfileInfo;
  totalPosts: number;
  totalLikes: number;
  language: Language;
  stories?: Story[];
  isLoading?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  totalPosts,
  totalLikes,
  language,
  stories = [],
  isLoading = false
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const telegramUrl = profile.telegram || 'https://t.me/thevrishbihari';
  const instagramUrl = profile.instagram || 'https://instagram.com/thevrishbihari';
  const linkedinUrl = profile.linkedin || 'https://linkedin.com/in/vrishketu-ray';
  const emailAddress = profile.email || 'vrishketuray000@gmail.com';

  // Story Autoplay & Progress Tracker Hook
  useEffect(() => {
    if (!isStoryOpen || stories.length === 0) {
      setProgress(0);
      return;
    }

    if (isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    // Run interval every 100ms. Over 5000ms, each tick is 2%
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story
          if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex((idx) => idx + 1);
            return 0;
          } else {
            // End of stories
            setIsStoryOpen(false);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isStoryOpen, currentStoryIndex, isPaused, stories]);

  // SKELETON SCREEN PLACEHOLDER WHILE DATA IS BEING FETCHED
  if (isLoading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 animate-pulse">
        {/* Background Accent Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Main Profile Info Header Skeleton */}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar Skeleton */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gray-800/80 border-2 border-gray-700/50 shrink-0" />

          {/* Profile Details Skeleton */}
          <div className="flex-1 w-full space-y-4">
            <div className="space-y-2 flex flex-col items-center md:items-start">
              <div className="h-9 bg-gray-800 rounded-xl w-3/4 max-w-sm" />
              <div className="h-5 bg-gray-800/60 rounded-lg w-1/2 max-w-xs" />
            </div>

            <div className="space-y-2">
              <div className="h-4 bg-gray-800/60 rounded w-full" />
              <div className="h-4 bg-gray-800/60 rounded w-5/6" />
              <div className="h-4 bg-gray-800/40 rounded w-2/3" />
            </div>

            {/* Social icons skeleton */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-7 w-24 bg-gray-800/60 rounded-xl" />
              ))}
            </div>

            {/* Skills Badges Skeleton */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-6 w-16 bg-gray-800/50 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Highlights Skeleton Row */}
        <div className="relative z-10 pt-6 border-t border-gray-800/80 space-y-4">
          <div className="h-5 bg-gray-800 rounded w-48" />
          <div className="flex items-center gap-5 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-16 h-16 rounded-full bg-gray-800/80 border-2 border-gray-700/60" />
                <div className="h-3 bg-gray-800 rounded w-14" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const handlePrevStory = () => {
    setProgress(0);
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  };

  const handleNextStory = () => {
    setProgress(0);
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      setIsStoryOpen(false);
    }
  };

  const handleOpenStory = () => {
    if (stories.length > 0) {
      setCurrentStoryIndex(0);
      setProgress(0);
      setIsStoryOpen(true);
      setIsPaused(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
      {/* Background Accent Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Profile Info Header */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Profile Avatar with Live Status and WhatsApp/Instagram 24-Hour Story Integration */}
        <div className="relative group shrink-0">
          {/* Pulsating Story indicator badge */}
          {stories.length > 0 && (
            <div 
              onClick={handleOpenStory}
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-lg shadow-pink-500/20 cursor-pointer hover:scale-105 active:scale-95 transition flex items-center gap-1 border border-white/20 select-none animate-bounce"
            >
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>{language === 'hi' ? 'स्टोरी' : 'STORY'}</span>
            </div>
          )}

          <div 
            onClick={stories.length > 0 ? handleOpenStory : undefined}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden p-[3px] bg-gray-800 shadow-xl transition-all duration-300 ${
              stories.length > 0 
                ? 'bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-500 cursor-pointer shadow-pink-500/15 scale-102 hover:scale-108 hover:rotate-2 ring-4 ring-pink-500/10' 
                : 'border-2 border-blue-500/40 shadow-blue-500/10 hover:scale-105'
            }`}
            title={stories.length > 0 ? (language === 'hi' ? 'स्टोरी देखने के लिए क्लिक करें ⚡' : 'Click to watch 24h Story ⚡') : undefined}
          >
            <div className="w-full h-full rounded-[13px] overflow-hidden bg-gray-950">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl font-bold text-white">
                  VR
                </div>
              )}
            </div>
          </div>
          <span 
            className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-emerald-500 border-2 border-gray-900 rounded-full shadow-md shadow-emerald-500/30 z-10" 
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
            {profile.venture_1 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-800/80 border border-gray-700/80 text-xs text-gray-200">
                <Rocket className="w-3.5 h-3.5 text-blue-400" />
                <span>{profile.venture_1}</span>
              </div>
            )}
            {profile.venture_2 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-800/80 border border-gray-700/80 text-xs text-gray-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{profile.venture_2}</span>
              </div>
            )}
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

      {/* Instagram-Style Circular Highlights Section */}
      <div className="relative z-10 pt-6 border-t border-gray-800/90 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight font-heading">
              {language === 'hi' ? '✨ मुख्य हाइलाइट्स व स्टोरीज' : '✨ Featured Highlights & Stories'}
            </h3>
          </div>
          <span className="text-[10px] text-pink-400/90 font-medium">
            {language === 'hi' ? 'क्लिक करके देखें' : 'Click to watch'}
          </span>
        </div>

        {/* Circular Highlights Carousel */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 scrollbar-none -mx-2 px-2">
          {stories.map((story, idx) => {
            const title = story.title || (story.caption ? story.caption.slice(0, 16) : `Highlight ${idx + 1}`);

            return (
              <button
                key={story.id || idx}
                onClick={() => {
                  setCurrentStoryIndex(idx);
                  setProgress(0);
                  setIsStoryOpen(true);
                  setIsPaused(false);
                }}
                className="group flex flex-col items-center gap-2 shrink-0 transition-transform active:scale-95 focus:outline-none"
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-500 group-hover:rotate-6 group-hover:scale-105 shadow-md shadow-pink-500/15 transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-950 p-[1.5px]">
                    {story.media_type === 'video' ? (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center text-pink-300">
                        <Play className="w-5 h-5 ml-0.5 fill-pink-300" />
                      </div>
                    ) : (
                      <img
                        src={story.media_url}
                        alt={title}
                        className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-gray-300 group-hover:text-pink-300 transition-colors max-w-[76px] truncate text-center">
                  {title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Introduction & Vision Section */}
      <div className="relative z-10 pt-6 border-t border-gray-800/90 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-heading">
            {language === 'hi' ? '📖 परिचय व विजन (About & Tech Journey)' : '📖 Introduction & Mission'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Mukt Vishwavidyalay & EdTech Vision */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800/90 rounded-2xl p-5 space-y-2.5 hover:border-blue-500/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">
              {language === 'hi' ? 'मुक्त विश्वविद्यालय विजन' : 'Democratic EdTech'}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {language === 'hi'
                ? 'हर छात्र तक उच्च गुणवत्ता वाली आधुनिक डिजिटल शिक्षा पहुँचाने का मिशन। Ugrasena Educum और AI-Edura के जरिए एडाप्टिव लर्निंग का सशक्त निर्माण।'
                : 'Pioneering accessible, personalized digital learning environments and AI-assisted educational mentorship.'}
            </p>
          </div>

          {/* 2. The Vrish Bihari & Digital Innovations */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800/90 rounded-2xl p-5 space-y-2.5 hover:border-amber-500/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Rocket className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">
              {language === 'hi' ? 'The Vrish Bihari वेंचर' : 'Digital Innovations'}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {language === 'hi'
                ? 'बिहार से तकनीकी नवाचार का नेतृत्व। युवाओं को तकनीकी रूप से सक्षम और आत्मनिर्भर बनाने के लिए डिजिटल टूल्स व मीडिया का विस्तार।'
                : 'Leading digital initiatives that combine impactful regional outreach with modern software entrepreneurship.'}
            </p>
          </div>

          {/* 3. Full-Stack Cloud Architecture */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800/90 rounded-2xl p-5 space-y-2.5 hover:border-indigo-500/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">
              {language === 'hi' ? 'फुल-स्टैक सिस्टम इंजीनियरिंग' : 'Full-Stack Architecture'}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {language === 'hi'
                ? 'React, Next.js, Supabase, PostgreSQL और जेमिनी AI का उपयोग करके स्केलेबल, सुरक्षित व हाई-परफॉर्मेंस वेब एप्लिकेशन्स तैयार करना।'
                : 'Building mission-critical full-stack applications with robust database designs, vector intelligence, and modern UI systems.'}
            </p>
          </div>
        </div>
      </div>

      {/* ==================== 24-HOUR STORY IMMERSIVE VIEWER (Instagram/WhatsApp style) ==================== */}
      {isStoryOpen && stories.length > 0 && stories[currentStoryIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center select-none animate-fade-in">
          {/* Background Ambient Glow matching the active story */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] bg-pink-600/10 rounded-full blur-3xl" />
          </div>

          {/* Interactive Modal Frame */}
          <div className="relative w-full max-w-lg h-full sm:h-[85vh] sm:max-h-[820px] bg-gray-950 sm:rounded-3xl border border-gray-900 shadow-2xl overflow-hidden flex flex-col justify-between">
            
            {/* Top Interactive Overlay: Segmented Progress Indicator & Story Meta */}
            <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/85 via-black/45 to-transparent z-30 space-y-3.5">
              
              {/* Segmented Progress bar */}
              <div className="flex gap-1.5 w-full">
                {stories.map((story, idx) => {
                  let barWidth = '0%';
                  if (idx < currentStoryIndex) barWidth = '100%';
                  else if (idx === currentStoryIndex) barWidth = `${progress}%`;

                  return (
                    <div key={story.id} className="h-[3px] flex-1 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 transition-all duration-100 ease-linear rounded-full"
                        style={{ width: barWidth }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Story Author Meta Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 to-amber-500 shrink-0">
                    <img 
                      src={profile.avatar_url || 'https://via.placeholder.com/150'} 
                      alt={profile.name} 
                      className="w-full h-full object-cover rounded-full bg-gray-900"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">{profile.name}</h4>
                    <p className="text-[10px] text-gray-300 font-medium flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-pink-400" />
                      <span>
                        {language === 'hi' ? '24 घंटे सक्रिय स्टोरी' : 'Live Status Story'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Controller Action buttons */}
                <div className="flex items-center gap-2">
                  {/* Pause / Play Trigger */}
                  <button 
                    onClick={() => setIsPaused(!isPaused)} 
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                    title={isPaused ? 'Resume Autoplay' : 'Pause Autoplay'}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>

                  {/* Close Modal */}
                  <button 
                    onClick={() => setIsStoryOpen(false)} 
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Viewport: Media rendering with Left/Right Tapping zones */}
            <div 
              className="relative flex-1 flex items-center justify-center bg-black/40 cursor-pointer"
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {/* Tap Left Zone */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevStory();
                }}
                className="absolute left-0 inset-y-0 w-[25%] z-20 cursor-w-resize"
                title="Previous Story"
              />

              {/* Tap Right Zone */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextStory();
                }}
                className="absolute right-0 inset-y-0 w-[25%] z-20 cursor-e-resize"
                title="Next Story"
              />

              {/* Media Content Box */}
              <div className="w-full h-full flex items-center justify-center p-2">
                {stories[currentStoryIndex].media_type === 'video' ? (
                  <video 
                    src={stories[currentStoryIndex].media_url} 
                    className="max-w-full max-h-full object-contain sm:rounded-2xl"
                    autoPlay
                    playsInline
                    muted
                    loop
                  />
                ) : (
                  <img 
                    src={stories[currentStoryIndex].media_url} 
                    alt={stories[currentStoryIndex].caption || 'Story Content'} 
                    className="max-w-full max-h-full object-contain sm:rounded-2xl"
                    draggable={false}
                  />
                )}
              </div>

              {/* Floating Desktop Side Nav Arrows */}
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevStory(); }}
                disabled={currentStoryIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-gray-800 flex items-center justify-center text-white transition hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none hidden sm:flex"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleNextStory(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-gray-800 flex items-center justify-center text-white transition hover:scale-105 active:scale-95 hidden sm:flex"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom: Caption Overlay Pane */}
            {stories[currentStoryIndex].caption && (
              <div className="p-5 bg-gradient-to-t from-black via-black/80 to-transparent pt-10 text-center z-30">
                <p className="text-sm font-semibold text-white/95 max-w-sm mx-auto leading-relaxed filter drop-shadow">
                  {stories[currentStoryIndex].caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
