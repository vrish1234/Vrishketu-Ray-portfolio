import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { BarChart3, Heart, Layers, Flame } from 'lucide-react';
import { MediaPost, Language } from '../types';

interface AdminDashboardStatsProps {
  posts: MediaPost[];
  language: Language;
}

export const AdminDashboardStats: React.FC<AdminDashboardStatsProps> = ({ posts, language }) => {
  // Map posts to chart data
  const chartData = posts.map(post => ({
    name: post.title.length > 20 ? post.title.substring(0, 18) + '...' : post.title,
    fullName: post.title,
    likes: post.likes_count || 0,
    mediaType: post.media_type
  })).sort((a, b) => b.likes - a.likes); // Sort by likes descending to show a high-to-low engagement leaderboard

  // Calculate stats
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((acc, post) => acc + (post.likes_count || 0), 0);
  const mostLikedPost = posts.reduce((max, post) => 
    (post.likes_count || 0) > (max?.likes_count || 0) ? post : max
  , posts[0] || null);

  // Custom Tooltip component for a premium look matching the Dark Glassmorphism theme
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 border border-gray-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-xs font-bold text-white mb-1">{data.fullName}</p>
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
            <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-500 animate-pulse" />
            <span>
              {language === 'hi' ? `${data.likes} लाइक्स (Likes)` : `${data.likes} Likes`}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
            Type: {data.mediaType}
          </p>
        </div>
      );
    }
    return null;
  };

  // Modern gradient definitions and custom bar styling
  const colors = ['#3b82f6', '#4f46e5', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Projects Card */}
        <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 flex items-center gap-4 hover:border-gray-700/50 transition">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Layers className="w-5.5 h-5.5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">
              {language === 'hi' ? 'कुल प्रोजेक्ट्स (Total Projects)' : 'Total Projects / Posts'}
            </p>
            <p className="text-xl font-bold text-white mt-0.5">{totalPosts}</p>
          </div>
        </div>

        {/* Total Likes Card */}
        <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 flex items-center gap-4 hover:border-gray-700/50 transition">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
            <Heart className="w-5.5 h-5.5 text-rose-400 fill-rose-500/20" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">
              {language === 'hi' ? 'कुल लाइक्स (Total Likes)' : 'Total Engagement Likes'}
            </p>
            <p className="text-xl font-bold text-white mt-0.5">{totalLikes}</p>
          </div>
        </div>

        {/* Most Liked Project Card */}
        <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 flex items-center gap-4 hover:border-gray-700/50 transition">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Flame className="w-5.5 h-5.5 text-amber-400 fill-amber-500/10" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 font-medium truncate">
              {language === 'hi' ? 'सर्वाधिक लोकप्रिय (Most Liked)' : 'Most Liked Project'}
            </p>
            <p className="text-sm font-bold text-white mt-0.5 truncate">
              {mostLikedPost ? mostLikedPost.title : (language === 'hi' ? 'कोई नहीं' : 'N/A')}
            </p>
            {mostLikedPost && (
              <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                {mostLikedPost.likes_count || 0} Likes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Bar Chart Panel */}
      <div className="p-5 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-800 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>{language === 'hi' ? 'प्रोजेक्ट जुड़ाव विश्लेषण (Engagement Chart)' : 'Project Likes Engagement Analysis'}</span>
          </h4>
          <p className="text-[11px] text-gray-400">
            {language === 'hi' ? 'लाइक के आधार पर क्रमबद्ध प्रोजेक्ट' : 'Sorted from highest to lowest project engagement'}
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="h-[250px] flex flex-col items-center justify-center text-center space-y-1 bg-gray-900/10 rounded-xl border border-dashed border-gray-800/80">
            <BarChart3 className="w-8 h-8 text-gray-600 animate-pulse" />
            <p className="text-xs font-semibold text-gray-400">
              {language === 'hi' ? 'विश्लेषण प्रदर्शित करने के लिए कोई प्रोजेक्ट उपलब्ध नहीं है।' : 'No project data available to visualize.'}
            </p>
            <p className="text-[10px] text-gray-500">
              {language === 'hi' ? 'एक नया प्रोजेक्ट अपलोड करने के बाद यह ग्राफ खुद अपडेट हो जाएगा।' : 'Add projects to watch engagement metrics auto-populate here.'}
            </p>
          </div>
        ) : (
          <div className="w-full h-[280px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.3} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                <Bar 
                  dataKey="likes" 
                  radius={[5, 5, 0, 0]}
                  maxBarSize={38}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[index % colors.length]} 
                      className="transition-all duration-300 hover:opacity-85"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
