-- Check and fix schema for ScatterBrainAI Platform
-- This safely checks what exists and only creates what's missing

-- First, let's check what columns exist in the thoughts table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'thoughts'
ORDER BY ordinal_position;

-- Check if the thoughts table exists and has all required columns
DO $$
BEGIN
    -- Add any missing columns to thoughts table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'thoughts' AND column_name = 'analysis') THEN
        ALTER TABLE thoughts ADD COLUMN analysis JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'thoughts' AND column_name = 'research_data') THEN
        ALTER TABLE thoughts ADD COLUMN research_data JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'thoughts' AND column_name = 'generated_content') THEN
        ALTER TABLE thoughts ADD COLUMN generated_content JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'thoughts' AND column_name = 'tags') THEN
        ALTER TABLE thoughts ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Check what RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('thoughts', 'profiles', 'connections')
ORDER BY tablename, policyname;

-- Safely create policies (only if they don't exist)
DO $$
BEGIN
    -- Check and create policies for thoughts table
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'thoughts' AND policyname = 'Users can view own thoughts') THEN
        CREATE POLICY "Users can view own thoughts" ON thoughts
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'thoughts' AND policyname = 'Users can create own thoughts') THEN
        CREATE POLICY "Users can create own thoughts" ON thoughts
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Note: Update and Delete policies already exist based on the error
END $$;

-- Add voice-related columns if they don't exist (from voice-system-schema.sql)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'thoughts' AND column_name = 'voice_profile_version') THEN
        ALTER TABLE thoughts ADD COLUMN voice_profile_version UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'thoughts' AND column_name = 'voice_archetype') THEN
        ALTER TABLE thoughts ADD COLUMN voice_archetype VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'thoughts' AND column_name = 'authenticity_score') THEN
        ALTER TABLE thoughts ADD COLUMN authenticity_score FLOAT;
    END IF;
END $$;

-- Let's also check the actual table structure to debug
SELECT 
    t.table_name,
    COUNT(c.column_name) as column_count,
    array_agg(c.column_name ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_name IN ('thoughts', 'profiles', 'connections')
    AND t.table_schema = 'public'
GROUP BY t.table_name;