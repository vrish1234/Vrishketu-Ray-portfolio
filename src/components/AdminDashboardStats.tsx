import React, { useState } from 'react';
import { BarChart3, Heart, Layers, Flame } from 'lucide-react';
import { MediaPost, Language } from '../types';

interface AdminDashboardStatsProps {
  posts: MediaPost[];
  language: Language;
}

export const AdminDashboardStats: React.FC<AdminDashboardStatsProps> = ({ posts, language }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredPos, setHoveredPos] = useState({ x: 0, y: 0 });

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

  // Modern colors matching the glassmorphic styling
  const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500'];
  const fillColors = ['#3b82f6', '#4f46e5', '#8b5cf6', '#8b5cf6', '#d946ef', '#ec4899'];

  // SVG Chart Calculations
  const chartHeight = 200;
  const chartWidth = 500;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const maxLikes = Math.max(...chartData.map(d => d.likes), 1);

  // Y-axis grid divisions
  const gridDivisions = 4;
  const yAxisTicks = Array.from({ length: gridDivisions + 1 }, (_, i) => {
    return Math.round((maxLikes / gridDivisions) * i);
  });

  return (
    <div className="space-y-6">
      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
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
          <p className="text-[11px] text-gray-400 font-medium">
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
          <div className="relative w-full pt-2">
            {/* SVG Interactive Chart Box */}
            <div className="w-full overflow-x-auto">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-auto min-w-[450px]"
              >
                {/* Manual Grid Lines */}
                {yAxisTicks.map((tick, idx) => {
                  const yVal = paddingTop + graphHeight - (tick / maxLikes) * graphHeight;
                  return (
                    <g key={idx} className="opacity-45">
                      <line 
                        x1={paddingLeft} 
                        y1={yVal} 
                        x2={chartWidth - paddingRight} 
                        y2={yVal} 
                        stroke="#1f2937" 
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <text 
                        x={paddingLeft - 8} 
                        y={yVal + 3} 
                        fill="#6b7280" 
                        fontSize="9" 
                        textAnchor="end"
                        className="font-mono font-medium"
                      >
                        {tick}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis baseline */}
                <line 
                  x1={paddingLeft} 
                  y1={paddingTop + graphHeight} 
                  x2={chartWidth - paddingRight} 
                  y2={paddingTop + graphHeight} 
                  stroke="#374151" 
                  strokeWidth="1.5"
                />

                {/* Manual Interactive Columns Render */}
                {chartData.map((data, idx) => {
                  const barCount = chartData.length;
                  const spacing = graphWidth / barCount;
                  const barWidth = Math.min(30, spacing * 0.6);
                  
                  const xVal = paddingLeft + (idx * spacing) + (spacing - barWidth) / 2;
                  const barHeight = (data.likes / maxLikes) * graphHeight;
                  const yVal = paddingTop + graphHeight - barHeight;

                  const colorIndex = idx % fillColors.length;

                  return (
                    <g key={idx}>
                      {/* Interactive Bar Overlay */}
                      <rect 
                        x={xVal} 
                        y={yVal} 
                        width={barWidth} 
                        height={Math.max(barHeight, 2)} 
                        fill={fillColors[colorIndex]} 
                        rx="4"
                        ry="4"
                        className="cursor-pointer transition-all duration-300 hover:opacity-85"
                        onMouseEnter={(e) => {
                          setHoveredIndex(idx);
                          // Compute dynamic pos offset
                          setHoveredPos({ x: xVal + barWidth / 2, y: yVal - 10 });
                        }}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />

                      {/* X-axis labels */}
                      <text 
                        x={xVal + barWidth / 2} 
                        y={paddingTop + graphHeight + 16} 
                        fill="#9ca3af" 
                        fontSize="8.5" 
                        textAnchor="middle"
                        className="font-semibold select-none"
                      >
                        {data.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Custom Interactive Floating Glassmorphism Tooltip */}
            {hoveredIndex !== null && (
              <div 
                className="absolute z-30 bg-gray-950/95 border border-gray-800 p-3 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150 ease-out"
                style={{ 
                  left: `${(hoveredPos.x / chartWidth) * 100}%`, 
                  top: `${(hoveredPos.y / chartHeight) * 100}%` 
                }}
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white whitespace-nowrap">
                    {chartData[hoveredIndex].fullName}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-extrabold">
                    <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-500 animate-pulse" />
                    <span>
                      {chartData[hoveredIndex].likes} Likes
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">
                    Type: {chartData[hoveredIndex].mediaType}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
