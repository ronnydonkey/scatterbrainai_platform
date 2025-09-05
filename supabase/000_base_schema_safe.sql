-- Base schema for ScatterBrainAI Platform (Safe version - checks for existing objects)
-- This creates the core tables needed for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create thoughts table
CREATE TABLE IF NOT EXISTS thoughts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  source_type VARCHAR(50) NOT NULL DEFAULT 'text',
  source_data TEXT,
  analysis JSONB,
  research_data JSONB,
  generated_content JSONB,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  brain_name VARCHAR(255),
  writing_style TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  subscription_status VARCHAR(50) DEFAULT 'trial',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  thought_id_1 UUID REFERENCES thoughts(id) ON DELETE CASCADE NOT NULL,
  thought_id_2 UUID REFERENCES thoughts(id) ON DELETE CASCADE NOT NULL,
  connection_type VARCHAR(100),
  strength FLOAT DEFAULT 0.5,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_thoughts_user_id ON thoughts(user_id);
CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON thoughts(created_at);
CREATE INDEX IF NOT EXISTS idx_thoughts_tags ON thoughts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_thought_ids ON connections(thought_id_1, thought_id_2);

-- Enable Row Level Security (if not already enabled)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'thoughts' AND rowsecurity = true) THEN
    ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'connections' AND rowsecurity = true) THEN
    ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can create own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can update own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can delete own thoughts" ON thoughts;

-- RLS Policies for thoughts
CREATE POLICY "Users can view own thoughts" ON thoughts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own thoughts" ON thoughts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thoughts" ON thoughts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own thoughts" ON thoughts
  FOR DELETE USING (auth.uid() = user_id);

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own connections" ON connections;
DROP POLICY IF EXISTS "Users can create own connections" ON connections;
DROP POLICY IF EXISTS "Users can update own connections" ON connections;
DROP POLICY IF EXISTS "Users can delete own connections" ON connections;

-- RLS Policies for connections
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own connections" ON connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections" ON connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections" ON connections
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_thoughts_updated_at ON thoughts;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Add updated_at triggers
CREATE TRIGGER update_thoughts_updated_at BEFORE UPDATE ON thoughts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();