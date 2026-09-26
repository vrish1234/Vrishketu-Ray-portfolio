import { ProfileInfo, MediaPost } from '../types';

export const DEFAULT_PROFILE: ProfileInfo = {
  id: 1,
  name: 'Vrishketu Ray',
  title: 'Full-Stack Developer & EdTech Entrepreneur',
  bio: 'Passionate full-stack developer and founder of Ugrasena Educum & AI-Edura. Dedicated to building innovative digital solutions, high-performance web applications, and intelligent educational ecosystems.',
  skills: [
    'Next.js',
    'React',
    'TypeScript',
    'Supabase',
    'Gemini API',
    'Node.js',
    'Tailwind CSS',
    'PostgreSQL',
    'EdTech Solutions'
  ],
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  email: 'vrishketuray000@gmail.com',
  telegram: 'https://t.me/thevrishbihari',
  instagram: 'https://instagram.com/thevrishbihari',
  linkedin: 'https://linkedin.com/in/vrishketu-ray',
  github: 'https://github.com',
  twitter: 'https://twitter.com',
  location: 'India'
};

export const DEFAULT_MESSAGES = [
  {
    id: 1,
    sender_name: 'Dr. Ramesh Sharma',
    sender_email: 'ramesh.sharma@edutech.in',
    message: 'Loved your AI-Edura platform demo! We would love to explore integrating your adaptive student mentoring architecture into our university curriculum in Delhi.',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    read: false
  },
  {
    id: 2,
    sender_name: 'Sophia Patel',
    sender_email: 'sophia@techventures.co',
    message: 'Great work on Ugrasena Educum. Would you be open for a consultation call this week regarding full-stack product scaling and Supabase infrastructure?',
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    read: true
  }
];

export const DEFAULT_POSTS: MediaPost[] = [
  {
    id: 1,
    title: 'AI-Edura: Next-Gen AI Learning Portal',
    description: 'An AI-powered adaptive learning assistant platform that leverages Gemini API and vector embeddings for personalized student mentoring and real-time assessments.',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    post_likes: [
      { id: 101, visitor_name: 'Aarav Sharma', created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
      { id: 102, visitor_name: 'Priya Verma', created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString() },
      { id: 103, visitor_name: 'Rohan Gupta', created_at: new Date(Date.now() - 3600000 * 12).toISOString() }
    ],
    post_comments: [
      {
        id: 201,
        visitor_name: 'Ananya Roy',
        comment_text: 'The AI tutoring interface is remarkably fluid and intuitive. Truly forward-thinking design!',
        created_at: new Date(Date.now() - 3600000 * 20).toISOString()
      },
      {
        id: 202,
        visitor_name: 'Kabir Singhania',
        comment_text: 'Great integration with the Gemini API. Looking forward to your next release.',
        created_at: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ]
  },
  {
    id: 2,
    title: 'Ugrasena Educum - Digital Classroom Architecture',
    description: 'Cloud infrastructure walkthrough showcasing our real-time classroom communication, student engagement tracking, and multi-tenant course distribution system.',
    media_type: 'video',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    post_likes: [
      { id: 104, visitor_name: 'Aditi Patel', created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
      { id: 105, visitor_name: 'Vikas Kumar', created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString() }
    ],
    post_comments: [
      {
        id: 203,
        visitor_name: 'Devendra Nair',
        comment_text: 'The multi-tenant distribution architecture is very clean. Great work Vrishketu!',
        created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
      }
    ]
  },
  {
    id: 3,
    title: 'Tech Talk & Podcast: Building Full-Stack Apps with Next.js & Supabase',
    description: 'Audio podcast recording discussing database design patterns, Row Level Security (RLS) in Supabase, and integrating generative AI workflows in modern EdTech products.',
    media_type: 'audio',
    media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    created_at: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    post_likes: [
      { id: 106, visitor_name: 'Karan Mehra', created_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString() }
    ],
    post_comments: [
      {
        id: 204,
        visitor_name: 'Meera Deshmukh',
        comment_text: 'Insightful breakdown on Row Level Security and schema design with Supabase.',
        created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
      }
    ]
  },
  {
    id: 4,
    title: 'Full-Stack Developer Portfolio & Dashboard Engine',
    description: 'Modern glassmorphism-free high contrast developer workspace with live likes counter, multimedia showcase, and synchronized admin controls.',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    created_at: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    post_likes: [
      { id: 107, visitor_name: 'Neha Singh', created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString() },
      { id: 108, visitor_name: 'Ankit Tiwari', created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString() },
      { id: 109, visitor_name: 'Sunita Roy', created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() },
      { id: 110, visitor_name: 'Deepak Jha', created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString() }
    ],
    post_comments: [
      {
        id: 205,
        visitor_name: 'Suresh Raina',
        comment_text: 'Sleek dark interface and snappy response times. Love the clean aesthetic!',
        created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
      }
    ]
  }
];

export const SUPABASE_SQL_SCHEMA = `-- Supabase Table Schema for Vrishketu Ray Portfolio & Admin Dashboard
-- Run this script in your Supabase SQL Editor:

-- 1. Create portfolio_info table
CREATE TABLE IF NOT EXISTS portfolio_info (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL DEFAULT 'Vrishketu Ray',
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  skills TEXT[] DEFAULT ARRAY['Next.js', 'Supabase', 'Gemini API'],
  avatar_url TEXT,
  email TEXT DEFAULT 'vrishketuray000@gmail.com',
  telegram TEXT DEFAULT 'https://t.me/thevrishbihari',
  instagram TEXT DEFAULT 'https://instagram.com/thevrishbihari',
  linkedin TEXT DEFAULT 'https://linkedin.com/in/vrishketu-ray',
  github TEXT,
  twitter TEXT,
  location TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create media_posts table
CREATE TABLE IF NOT EXISTS media_posts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'audio')),
  media_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  post_id BIGINT REFERENCES media_posts(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  post_id BIGINT REFERENCES media_posts(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Insert Initial Portfolio Profile
INSERT INTO portfolio_info (name, title, bio, skills, email, telegram, instagram, linkedin)
VALUES (
  'Vrishketu Ray',
  'Full-Stack Developer & EdTech Entrepreneur',
  'Passionate full-stack developer and founder of Ugrasena Educum & AI-Edura. Building innovative digital solutions, high-performance web applications, and intelligent educational ecosystems.',
  ARRAY['Next.js', 'Supabase', 'Gemini API', 'React', 'Node.js', 'Tailwind CSS', 'PostgreSQL'],
  'vrishketuray000@gmail.com',
  'https://t.me/thevrishbihari',
  'https://instagram.com/thevrishbihari',
  'https://linkedin.com/in/vrishketu-ray'
)
ON CONFLICT DO NOTHING;

-- 7. Enable Row Level Security (RLS)
ALTER TABLE portfolio_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 8. Access Policies
CREATE POLICY "Public Read Portfolio" ON portfolio_info FOR SELECT USING (true);
CREATE POLICY "Admin Update Portfolio" ON portfolio_info FOR UPDATE USING (true);

CREATE POLICY "Public Read Posts" ON media_posts FOR SELECT USING (true);
CREATE POLICY "Admin Insert Posts" ON media_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Delete Posts" ON media_posts FOR DELETE USING (true);

CREATE POLICY "Public Read Likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Public Insert Likes" ON post_likes FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Public Insert Comments" ON post_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Delete Comments" ON post_comments FOR DELETE USING (true);

CREATE POLICY "Public Insert Contact Messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Read Contact Messages" ON contact_messages FOR SELECT USING (true);
CREATE POLICY "Admin Delete Contact Messages" ON contact_messages FOR DELETE USING (true);

-- 9. Setup Supabase Storage Bucket 'portfolio-media'
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Read Portfolio Media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Admin Upload Portfolio Media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'portfolio-media');

CREATE POLICY "Admin Delete Portfolio Media" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'portfolio-media');
`;
