
-- Submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  challenge_id TEXT NOT NULL,
  challenge_name TEXT NOT NULL,
  phase_number INT NOT NULL,
  minutes_studied INT NOT NULL DEFAULT 0,
  proof_type TEXT NOT NULL,
  proof_url TEXT,
  proof_notes TEXT,
  leetcode_problems INT DEFAULT 0,
  difficulty TEXT,
  verified BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX submissions_user_date_idx ON public.submissions(user_id, date);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own submissions select" ON public.submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own submissions insert" ON public.submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own submissions update" ON public.submissions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own submissions delete" ON public.submissions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Roadmap progress
CREATE TABLE public.roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, phase_id, topic_id)
);
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress select" ON public.roadmap_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own progress insert" ON public.roadmap_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own progress delete" ON public.roadmap_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Reflections
CREATE TABLE public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_iso TEXT NOT NULL,
  content TEXT NOT NULL,
  score INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_iso)
);
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reflections select" ON public.reflections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own reflections insert" ON public.reflections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own reflections update" ON public.reflections FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Widget tokens (public read by id, owner manages)
CREATE TABLE public.widget_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  public_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.widget_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read token row" ON public.widget_tokens FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner inserts token" ON public.widget_tokens FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner deletes token" ON public.widget_tokens FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER submissions_updated BEFORE UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER reflections_updated BEFORE UPDATE ON public.reflections
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
