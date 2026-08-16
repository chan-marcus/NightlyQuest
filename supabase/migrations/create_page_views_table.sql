-- Create page_views table for visitor tracking
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on visitor_id for faster queries
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);

-- Create index on visited_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_page_views_visited_at ON page_views(visited_at DESC);

-- Create a function to get visitor stats (optional, for performance)
CREATE OR REPLACE FUNCTION get_visitor_stats()
RETURNS TABLE (
  visitor_id UUID,
  first_visit TIMESTAMPTZ,
  last_visit TIMESTAMPTZ,
  visit_count BIGINT,
  referrer TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.visitor_id,
    MIN(pv.visited_at) as first_visit,
    MAX(pv.visited_at) as last_visit,
    COUNT(*)::BIGINT as visit_count,
    (ARRAY_AGG(pv.referrer ORDER BY pv.visited_at DESC) FILTER (WHERE pv.referrer IS NOT NULL))[1] as referrer
  FROM page_views pv
  GROUP BY pv.visitor_id
  ORDER BY last_visit DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for tracking)
CREATE POLICY "Allow anonymous inserts" ON page_views
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated reads (for analytics)
CREATE POLICY "Allow authenticated reads" ON page_views
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow public (anon) reads for analytics dashboard
CREATE POLICY "Allow public reads" ON page_views
  FOR SELECT
  TO anon
  USING (true);
