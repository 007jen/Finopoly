/*
  # Accounting Learning Platform Schema

  ## Overview
  Complete database schema for XP-based accounting learning platform with users, cases, simulations, quizzes, and leaderboard.

  ## Tables Created

  ### 1. profiles
  User profiles linked to auth.users
  - id (uuid, FK to auth.users)
  - email, name, avatar
  - role (Student/Partner)
  - level (Beginner/Intermediate/Pro)
  - preferred_areas (text array)
  - xp, current_level, daily_streak
  - accuracy metrics for audit, tax, caselaw
  - timestamps

  ### 2. badges
  Achievement badges
  - id, name, description, icon
  - xp_requirement

  ### 3. user_badges
  User-earned badges junction table

  ### 4. audit_cases
  Audit simulation cases with difficulty, XP rewards, time limits

  ### 5. audit_case_documents
  Documents for audit cases

  ### 6. audit_case_tasks
  Tasks/questions within audit cases

  ### 7. case_laws
  Case law learning content

  ### 8. tax_simulations
  Tax return simulations

  ### 9. user_activity
  Tracks all completed activities for XP and progress

  ## Security
  - RLS enabled on all tables
  - Users can view/update own data
  - Admins (Partners) can manage content
  - Public read for active cases/simulations
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar text DEFAULT '',
  role text DEFAULT 'Student' CHECK (role IN ('Student', 'Partner')),
  level text DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Pro')),
  preferred_areas text[] DEFAULT '{}',
  xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  daily_streak integer DEFAULT 0,
  last_activity_date date,
  completed_simulations integer DEFAULT 0,
  audit_accuracy numeric(5,2) DEFAULT 0,
  tax_accuracy numeric(5,2) DEFAULT 0,
  caselaw_accuracy numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  xp_requirement integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User badges junction
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Audit cases
CREATE TABLE IF NOT EXISTS audit_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Pro')),
  description text NOT NULL,
  xp_reward integer DEFAULT 0,
  time_limit integer,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit case documents
CREATE TABLE IF NOT EXISTS audit_case_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES audit_cases(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  preview text,
  created_at timestamptz DEFAULT now()
);

-- Audit case tasks
CREATE TABLE IF NOT EXISTS audit_case_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES audit_cases(id) ON DELETE CASCADE NOT NULL,
  task_order integer NOT NULL,
  type text NOT NULL CHECK (type IN ('mcq', 'descriptive', 'checkbox', 'upload')),
  question text NOT NULL,
  options jsonb,
  correct_answer jsonb,
  hint text,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Case laws
CREATE TABLE IF NOT EXISTS case_laws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  facts text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  explanation text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Pro')),
  xp_reward integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tax simulations
CREATE TABLE IF NOT EXISTS tax_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Pro')),
  scenario text NOT NULL,
  client_data jsonb NOT NULL,
  questions jsonb NOT NULL,
  xp_reward integer DEFAULT 0,
  time_limit integer,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User activity tracking
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('audit', 'tax', 'caselaw', 'quiz')),
  activity_id uuid NOT NULL,
  xp_earned integer DEFAULT 0,
  score numeric(5,2) DEFAULT 0,
  time_taken integer,
  answers jsonb,
  completed_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_completed_at ON user_activity(completed_at DESC);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_case_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_laws ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Badges policies
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- User badges policies
CREATE POLICY "Anyone can view user badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Audit cases policies
CREATE POLICY "Anyone can view active cases"
  ON audit_cases FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Partners can insert cases"
  ON audit_cases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Partner'
    )
  );

CREATE POLICY "Partners can update cases"
  ON audit_cases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Partner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Partner'
    )
  );

-- Case documents policies
CREATE POLICY "Anyone can view case documents"
  ON audit_case_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audit_cases
      WHERE audit_cases.id = case_id AND audit_cases.is_active = true
    )
  );

CREATE POLICY "Partners can insert documents"
  ON audit_case_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Partner'
    )
  );

-- Case tasks policies
CREATE POLICY "Anyone can view case tasks"
  ON audit_case_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audit_cases
      WHERE audit_cases.id = case_id AND audit_cases.is_active = true
    )
  );

CREATE POLICY "Partners can insert tasks"
  ON audit_case_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Partner'
    )
  );

-- Case laws policies
CREATE POLICY "Anyone can view active case laws"
  ON case_laws FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Partners can insert case laws"
  ON case_laws FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Partner'
    )
  );

CREATE POLICY "Partners can update case laws"
  ON case_laws FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Partner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Partner'
    )
  );

-- Tax simulations policies
CREATE POLICY "Anyone can view active tax sims"
  ON tax_simulations FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Partners can insert tax sims"
  ON tax_simulations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Partner'
    )
  );

CREATE POLICY "Partners can update tax sims"
  ON tax_simulations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Partner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Partner'
    )
  );

-- User activity policies
CREATE POLICY "Users can view own activity"
  ON user_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON user_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER audit_cases_updated_at
  BEFORE UPDATE ON audit_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER case_laws_updated_at
  BEFORE UPDATE ON case_laws
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tax_simulations_updated_at
  BEFORE UPDATE ON tax_simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Badge award function
CREATE OR REPLACE FUNCTION award_badges()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_badges (user_id, badge_id)
  SELECT NEW.id, badges.id
  FROM badges
  WHERE badges.xp_requirement <= NEW.xp
  AND NOT EXISTS (
    SELECT 1 FROM user_badges
    WHERE user_badges.user_id = NEW.id AND user_badges.badge_id = badges.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_badges
  AFTER UPDATE OF xp ON profiles
  FOR EACH ROW
  WHEN (NEW.xp > OLD.xp)
  EXECUTE FUNCTION award_badges();

-- Insert default badges
INSERT INTO badges (name, description, icon, xp_requirement) VALUES
  ('First Steps', 'Complete your first activity', 'Trophy', 50),
  ('Rising Star', 'Earn 500 XP', 'Star', 500),
  ('Accounting Ace', 'Earn 1000 XP', 'Award', 1000),
  ('Expert Auditor', 'Earn 2500 XP', 'Medal', 2500),
  ('Tax Master', 'Earn 5000 XP', 'Crown', 5000),
  ('Legal Eagle', 'Earn 10000 XP', 'Sparkles', 10000)
ON CONFLICT DO NOTHING;