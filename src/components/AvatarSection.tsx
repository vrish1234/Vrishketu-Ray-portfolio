import React, { useState } from 'react';
import { Upload, FileUp, Loader2 } from 'lucide-react';
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarUploadFeedback, setAvatarUploadFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert(language === 'hi' ? 'कृपया केवल छवि फ़ाइल चुनें!' : 'Please select an image file only!');
        return;
      }
      setAvatarFile(file);
      setUploadProgress(0);
      setAvatarUploadFeedback(null);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setIsUploadingAvatar(true);
    setUploadProgress(0);
    setAvatarUploadFeedback(null);

    try {
      // Upload directly to the 'portfolio-media' bucket in Supabase, tracking real progress
      const uploadResult = await uploadMediaFileToSupabase(avatarFile, 'profile', (progress) => {
        setUploadProgress(progress);
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
      setAvatarFile(null);

      if (updateResult.success) {
        onAvatarUpdated(uploadResult.publicUrl);
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

  return (
    <div className="p-5 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-4">
      <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-2">
        <Upload className="w-4 h-4 text-blue-400" />
        <span>{language === 'hi' ? 'प्रोफ़ाइल चित्र सेटिंग्स (Avatar Settings)' : 'Profile Picture & Avatar Upload'}</span>
      </h4>
      
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Current Avatar Preview */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-blue-500/30 p-1 bg-gray-850 shadow-lg flex items-center justify-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar Preview"
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-bold text-white rounded-xl">
                VR
              </div>
            )}
          </div>
        </div>

        {/* Upload Input & Actions */}
        <div className="flex-1 space-y-2 text-center sm:text-left w-full">
          <p className="text-xs text-gray-400 leading-relaxed">
            {language === 'hi'
              ? 'यहाँ से नया प्रोफ़ाइल चित्र अपलोड करें। यह सीधे "portfolio-media" बकेट में सुरक्षित रूप से सेव होकर तुरंत अपडेट हो जाएगा।'
              : 'Choose an image from your device to upload directly to the "portfolio-media" Supabase Storage bucket and update instantly.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2.5">
            <label className="w-full sm:w-auto px-4 py-2 bg-gray-800 hover:bg-gray-750 text-gray-200 hover:text-white rounded-xl text-xs font-semibold cursor-pointer border border-gray-700 transition flex items-center justify-center gap-2">
              <FileUp className="w-3.5 h-3.5 text-blue-400" />
              <span>{avatarFile ? avatarFile.name : (language === 'hi' ? 'तस्वीर चुनें' : 'Select Avatar Image')}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </label>

            {avatarFile && (
              <button
                type="button"
                onClick={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/10 active:scale-95"
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'hi' ? `अपलोड हो रहा है (${uploadProgress}%)` : `Uploading (${uploadProgress}%)`}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'स्टोरेज में अपलोड करें' : 'Upload & Set Profile Photo'}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Visual Progress Bar */}
          {isUploadingAvatar && (
            <div className="w-full space-y-1.5 pt-1.5 max-w-md mx-auto sm:mx-0 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                <span>{language === 'hi' ? 'अपलोड प्रगति:' : 'Uploading File:'}</span>
                <span className="font-mono bg-blue-500/10 px-1.5 py-0.5 rounded text-[10px]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {avatarUploadFeedback && (
            <p className={`text-xs mt-1 font-semibold ${
              avatarUploadFeedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {avatarUploadFeedback.type === 'success' ? '✓ ' : '⚠️ '}{avatarUploadFeedback.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
