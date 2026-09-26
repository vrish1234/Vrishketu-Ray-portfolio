import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileUp, Loader2, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadMediaFileToSupabase, updateProfileData } from '../lib/supabase';
import { Language, ProfileInfo } from '../types';

interface AvatarSectionProps {
  profile: ProfileInfo;
  language: Language;
  onAvatarUpdated: (newUrl: string) => void;
}

export const AvatarSection: React.FC<AvatarSectionProps> = ({
  profile,
  language,
  onAvatarUpdated,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [urlInput, setUrlInput] = useState(profile?.avatar_url || '');
  const [avatarUploadFeedback, setAvatarUploadFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (profile?.avatar_url) {
      setUrlInput(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(language === 'hi' ? 'कृपया केवल छवि फ़ाइल चुनें!' : 'Please select an image file only!');
      return;
    }

    setIsUploadingAvatar(true);
    setUploadProgress(0);
    setAvatarUploadFeedback(null);

    try {
      // Create a local object URL for instantaneous, latency-free preview
      const localPreviewUrl = URL.createObjectURL(file);

      // Upload directly to the 'portfolio-media' bucket in Supabase, tracking progress
      const uploadResult = await uploadMediaFileToSupabase(file, 'profile', (progress) => {
        setUploadProgress(progress);
        if (progress === 100) {
          // Immediately update parent avatar state once upload hits 100% to eliminate database update latency
          onAvatarUpdated(localPreviewUrl);
          setUrlInput(localPreviewUrl);
        }
      });
      
      if (!uploadResult.success || !uploadResult.publicUrl) {
        setIsUploadingAvatar(false);
        setAvatarUploadFeedback({
          type: 'error',
          text: uploadResult.error || (language === 'hi' ? 'अपलोड विफल रहा।' : 'Failed to upload image.')
        });
        return;
      }

      // Calls the 'updateProfileData' function to set the new 'avatar_url'
      const updateResult = await updateProfileData({
        id: profile.id,
        avatar_url: uploadResult.publicUrl
      });

      setIsUploadingAvatar(false);

      if (updateResult.success) {
        // Set the permanent Supabase public URL
        onAvatarUpdated(uploadResult.publicUrl);
        setUrlInput(uploadResult.publicUrl);
        setAvatarUploadFeedback({
          type: 'success',
          text: language === 'hi' ? 'प्रोफ़ाइल चित्र सफलतापूर्वक अपडेट किया गया!' : 'Profile picture updated successfully!'
        });
        setTimeout(() => setAvatarUploadFeedback(null), 4000);
      } else {
        setAvatarUploadFeedback({
          type: 'error',
          text: updateResult.error || (language === 'hi' ? 'डेटाबेस अपडेट विफल।' : 'Database update failed.')
        });
      }
    } catch (err: unknown) {
      setIsUploadingAvatar(false);
      setAvatarUploadFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unexpected upload error'
      });
    }
  };

  const handleUrlUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsUploadingAvatar(true);
    setAvatarUploadFeedback(null);

    try {
      const updateResult = await updateProfileData({
        id: profile.id,
        avatar_url: urlInput.trim()
      });

      setIsUploadingAvatar(false);

      if (updateResult.success) {
        onAvatarUpdated(urlInput.trim());
        setAvatarUploadFeedback({
          type: 'success',
          text: language === 'hi' ? 'प्रोफ़ाइल चित्र यूआरएल सफलतापूर्वक अपडेट किया गया!' : 'Profile picture URL updated successfully!'
        });
        setTimeout(() => setAvatarUploadFeedback(null), 4000);
      } else {
        setAvatarUploadFeedback({
          type: 'error',
          text: updateResult.error || (language === 'hi' ? 'डेटाबेस अपडेट विफल।' : 'Database update failed.')
        });
      }
    } catch (err: unknown) {
      setIsUploadingAvatar(false);
      setAvatarUploadFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unexpected error'
      });
    }
  };

  const triggerFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-5">
      <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-2">
        <Upload className="w-4 h-4 text-blue-400" />
        <span>{language === 'hi' ? 'प्रोफ़ाइल चित्र सेटिंग्स (Profile Photo)' : 'Profile Picture & Avatar Settings'}</span>
      </h4>

      {avatarUploadFeedback && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
          avatarUploadFeedback.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
        }`}>
          {avatarUploadFeedback.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 shrink-0" />}
          <span>{avatarUploadFeedback.text}</span>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        
        {/* Interactive Click-to-Upload Photo Circle/Square */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div 
            onClick={triggerFileSelector}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-dashed border-blue-500/40 hover:border-blue-400/85 p-1 bg-gray-900 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all group flex items-center justify-center relative"
            title={language === 'hi' ? 'नया प्रोफ़ाइल चित्र चुनने के लिए क्लिक करें' : 'Click to select new profile picture'}
          >
            {profile?.avatar_url ? (
              <>
                <img
                  src={profile.avatar_url}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover rounded-xl group-hover:opacity-40 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
                  <FileUp className="w-6 h-6 animate-bounce" />
                  <span className="text-[9px] font-bold text-white mt-1">
                    {language === 'hi' ? 'बदलें' : 'CHANGE'}
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center gap-1.5 text-white">
                <FileUp className="w-6 h-6 text-blue-300" />
                <span className="text-[10px] font-bold tracking-wide">VR</span>
              </div>
            )}
          </div>
          <button 
            type="button" 
            onClick={triggerFileSelector}
            className="text-[10px] text-blue-400 hover:text-blue-300 font-bold tracking-wide"
          >
            {language === 'hi' ? 'फोटो अपलोड करें ⚡' : 'Upload Photo ⚡'}
          </button>
        </div>

        {/* Input & Form Configurations */}
        <div className="flex-1 space-y-4 w-full">
          
          {/* File input (Hidden, triggered programmatically) */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleAvatarFileChange}
            className="hidden"
          />

          <div className="space-y-1.5">
            <p className="text-xs text-gray-300 font-medium">
              {language === 'hi'
                ? '१. डिवाइस से फोटो अपलोड:'
                : '1. Instant Upload from Device:'}
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {language === 'hi'
                ? 'ऊपर दिए गए बॉक्स पर क्लिक करके सीधे अपने फ़ोन या लैपटॉप से तस्वीर चुनें। यह तुरंत अपलोड होकर ऑटोमैटिकली सेट हो जाएगी।'
                : 'Click the square photo block above to browse or select an image directly. It uploads and updates instantly.'}
            </p>
          </div>

          <div className="border-t border-gray-900 pt-3 space-y-2">
            <p className="text-xs text-gray-300 font-medium">
              {language === 'hi'
                ? '२. या इंटरनेट फोटो यूआरएल पेस्ट करें:'
                : '2. Or Paste direct Image URL:'}
            </p>
            
            <form onSubmit={handleUrlUpdateSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <LinkIcon className="w-3.5 h-3.5" />
                </div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={isUploadingAvatar || !urlInput.trim() || urlInput === profile?.avatar_url}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-750 disabled:opacity-40 border border-gray-700 hover:border-gray-600 text-white rounded-xl text-xs font-semibold transition shrink-0"
              >
                {language === 'hi' ? 'सहेजें' : 'Save URL'}
              </button>
            </form>
          </div>

          {/* Visual Progress Bar */}
          {isUploadingAvatar && (
            <div className="w-full space-y-1.5 pt-1 max-w-md animate-fade-in">
              <div className="flex items-center justify-between text-[10px] font-bold text-blue-400">
                <span>{language === 'hi' ? 'अपलोड की जा रही है...' : 'Uploading status...'}</span>
                <span className="font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

        </div>
        
      </div>
    </div>
  );
};
