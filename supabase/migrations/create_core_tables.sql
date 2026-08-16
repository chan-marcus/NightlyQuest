-- Create parents table
CREATE TABLE IF NOT EXISTS parents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pronouns TEXT,
  reading_level TEXT,
  interests TEXT,
  adventure_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sagas table
CREATE TABLE IF NOT EXISTS sagas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  saga_id UUID REFERENCES sagas(id) ON DELETE CASCADE,
  chapter_number INTEGER,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create choices table
CREATE TABLE IF NOT EXISTS choices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  choice_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_sagas_child_id ON sagas(child_id);
CREATE INDEX IF NOT EXISTS idx_chapters_saga_id ON chapters(saga_id);
CREATE INDEX IF NOT EXISTS idx_choices_chapter_id ON choices(chapter_id);
CREATE INDEX IF NOT EXISTS idx_choices_child_id ON choices(child_id);

-- Enable Row Level Security
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE sagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public reads (for analytics)
CREATE POLICY "Allow public reads" ON parents
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public reads" ON children
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public reads" ON sagas
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public reads" ON chapters
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public reads" ON choices
  FOR SELECT
  TO anon
  USING (true);

-- Create policies to allow authenticated users to manage their data
CREATE POLICY "Allow authenticated inserts" ON parents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated inserts" ON children
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated inserts" ON sagas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated inserts" ON chapters
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated inserts" ON choices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
