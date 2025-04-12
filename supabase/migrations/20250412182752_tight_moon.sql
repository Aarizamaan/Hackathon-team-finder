/*
  # Initial Schema for Hackathon Teammate Finder

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `bio` (text)
      - `location` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `skills`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `category` (text)
    
    - `user_skills`
      - `profile_id` (uuid, references profiles)
      - `skill_id` (uuid, references skills)
      - Primary key (profile_id, skill_id)
    
    - `hackathons`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `is_online` (boolean)
      - `created_at` (timestamp)
    
    - `hackathon_interests`
      - `profile_id` (uuid, references profiles)
      - `hackathon_id` (uuid, references hackathons)
      - Primary key (profile_id, hackathon_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create skills table
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL
);

-- Create user_skills table
CREATE TABLE user_skills (
  profile_id uuid REFERENCES profiles ON DELETE CASCADE,
  skill_id uuid REFERENCES skills ON DELETE CASCADE,
  PRIMARY KEY (profile_id, skill_id)
);

-- Create hackathons table
CREATE TABLE hackathons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_online boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create hackathon_interests table
CREATE TABLE hackathon_interests (
  profile_id uuid REFERENCES profiles ON DELETE CASCADE,
  hackathon_id uuid REFERENCES hackathons ON DELETE CASCADE,
  PRIMARY KEY (profile_id, hackathon_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_interests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  USING (true);

CREATE POLICY "User skills are viewable by everyone"
  ON user_skills FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own skills"
  ON user_skills FOR ALL
  USING (auth.uid() = profile_id);

CREATE POLICY "Hackathons are viewable by everyone"
  ON hackathons FOR SELECT
  USING (true);

CREATE POLICY "Hackathon interests are viewable by everyone"
  ON hackathon_interests FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own hackathon interests"
  ON hackathon_interests FOR ALL
  USING (auth.uid() = profile_id);

-- Insert some initial skills
INSERT INTO skills (name, category) VALUES
  ('React', 'Frontend'),
  ('TypeScript', 'Frontend'),
  ('Node.js', 'Backend'),
  ('Python', 'Backend'),
  ('UI/UX Design', 'Design'),
  ('Figma', 'Design'),
  ('AWS', 'DevOps'),
  ('Docker', 'DevOps'),
  ('PostgreSQL', 'Database'),
  ('MongoDB', 'Database');