-- Add trial management fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brain_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'paused', 'cancelled'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_export_date TIMESTAMP WITH TIME ZONE;

-- Create exports table for tracking user data exports
CREATE TABLE IF NOT EXISTS exports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('raw_text', 'organized_clusters', 'social_content', 'json', 'csv')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- Policies for exports
CREATE POLICY "Users can view their own exports" ON exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exports" ON exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_end_date ON profiles(trial_end_date);
CREATE INDEX IF NOT EXISTS idx_exports_user_id ON exports(user_id);