-- Voice System Database Schema for ScatterBrainAI
-- This creates a comprehensive voice discovery and learning system

-- 1. Voice Profiles Table
CREATE TABLE IF NOT EXISTS voice_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Voice Archetype Information
  archetype VARCHAR(50) NOT NULL DEFAULT 'explorer',
  archetype_confidence FLOAT DEFAULT 0.5,
  
  -- Voice Patterns and Preferences
  natural_phrases TEXT[], -- Phrases the user naturally uses
  avoided_phrases TEXT[], -- Phrases to avoid
  vocabulary_level VARCHAR(20) DEFAULT 'professional', -- casual, professional, academic
  sentence_complexity VARCHAR(20) DEFAULT 'moderate', -- simple, moderate, complex
  
  -- Expertise and Authority
  confirmed_expertise TEXT[], -- Areas where user has actual expertise
  learning_interests TEXT[], -- Areas where user is learning
  false_expertise_flags TEXT[], -- Topics to avoid claiming expertise in
  
  -- Communication Style
  preferred_perspective VARCHAR(20) DEFAULT 'first_person', -- first_person, third_person
  engagement_style VARCHAR(50) DEFAULT 'conversational', -- conversational, analytical, storytelling
  humor_level INTEGER DEFAULT 2, -- 0-5 scale
  formality_level INTEGER DEFAULT 3, -- 0-5 scale
  
  -- Content Preferences
  research_depth VARCHAR(20) DEFAULT 'moderate', -- surface, moderate, deep
  citation_preference BOOLEAN DEFAULT true,
  metaphor_usage VARCHAR(20) DEFAULT 'occasional', -- never, occasional, frequent
  
  -- Onboarding Responses (for analysis)
  onboarding_responses JSONB,
  
  -- Learning Progress
  feedback_count INTEGER DEFAULT 0,
  last_feedback_date TIMESTAMP WITH TIME ZONE,
  voice_maturity_score FLOAT DEFAULT 0.0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Content Feedback Table
CREATE TABLE IF NOT EXISTS content_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID, -- Reference to generated content
  
  -- Feedback Details
  feedback_type VARCHAR(50), -- voice_match, authenticity, tone, accuracy
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  specific_feedback TEXT,
  
  -- Voice Learning Data
  phrases_to_add TEXT[],
  phrases_to_remove TEXT[],
  tone_adjustment VARCHAR(50), -- more_formal, less_formal, more_expert, less_expert
  
  -- Platform Context
  platform VARCHAR(20), -- twitter, linkedin, reddit, youtube
  content_type VARCHAR(50), -- original, response, analysis
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Voice Archetypes Reference Table
CREATE TABLE IF NOT EXISTS voice_archetypes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Archetype Characteristics
  key_traits TEXT[],
  communication_patterns TEXT[],
  content_approach TEXT,
  
  -- Default Settings for Archetype
  default_vocabulary_level VARCHAR(20),
  default_sentence_complexity VARCHAR(20),
  default_engagement_style VARCHAR(50),
  default_research_depth VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Content Library with Voice Tracking
ALTER TABLE thoughts ADD COLUMN IF NOT EXISTS voice_profile_version UUID REFERENCES voice_profiles(id);
ALTER TABLE thoughts ADD COLUMN IF NOT EXISTS voice_archetype VARCHAR(50);
ALTER TABLE thoughts ADD COLUMN IF NOT EXISTS authenticity_score FLOAT;

-- 5. Voice Learning History
CREATE TABLE IF NOT EXISTS voice_learning_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Change Details
  change_type VARCHAR(50), -- archetype_change, pattern_update, expertise_update
  old_value JSONB,
  new_value JSONB,
  trigger_source VARCHAR(50), -- user_feedback, system_analysis, manual_update
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Archetypes
INSERT INTO voice_archetypes (id, name, description, key_traits, communication_patterns, content_approach, default_vocabulary_level, default_sentence_complexity, default_engagement_style, default_research_depth) VALUES
('explorer', 'The Curious Explorer', 'Always discovering and sharing new insights', 
 ARRAY['curious', 'enthusiastic', 'open-minded', 'questioning'],
 ARRAY['I just discovered...', 'What if we...', 'This makes me wonder...', 'Has anyone else noticed...'],
 'Presents findings as exciting discoveries, asks lots of questions, shares learning journey',
 'professional', 'moderate', 'conversational', 'moderate'),

('teacher', 'The Patient Teacher', 'Breaks down complex ideas for others', 
 ARRAY['clear', 'structured', 'helpful', 'encouraging'],
 ARRAY['Let me explain...', 'The key insight here is...', 'Think of it this way...', 'Here''s what this means...'],
 'Uses analogies and examples, builds understanding step by step, anticipates confusion',
 'professional', 'simple', 'educational', 'moderate'),

('synthesizer', 'The Pattern Synthesizer', 'Connects ideas across domains', 
 ARRAY['analytical', 'creative', 'systematic', 'insightful'],
 ARRAY['This connects to...', 'I see a pattern...', 'Combining these ideas...', 'The broader implications...'],
 'Draws unexpected connections, sees big picture, links disparate concepts',
 'academic', 'complex', 'analytical', 'deep'),

('implementer', 'The Practical Implementer', 'Focuses on real-world application', 
 ARRAY['pragmatic', 'action-oriented', 'specific', 'results-focused'],
 ARRAY['Here''s how to apply this...', 'The practical steps are...', 'In my experience...', 'This works because...'],
 'Emphasizes actionable insights, shares specific examples, focuses on outcomes',
 'professional', 'moderate', 'practical', 'surface')
ON CONFLICT (id) DO NOTHING;

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_voice_profiles_user_id ON voice_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_content_feedback_user_id ON content_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_content_feedback_created_at ON content_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_voice_learning_history_user_id ON voice_learning_history(user_id);

-- Enable Row Level Security
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_learning_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own voice profile" ON voice_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own voice profile" ON voice_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice profile" ON voice_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" ON content_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own feedback" ON content_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own learning history" ON voice_learning_history
  FOR SELECT USING (auth.uid() = user_id);