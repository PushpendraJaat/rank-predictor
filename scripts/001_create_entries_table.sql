-- Create the entries table for MP ITI Training Officer rank predictor
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_number TEXT UNIQUE NOT NULL,
  candidate_name TEXT NOT NULL,
  raw_marks DECIMAL(5,2) NOT NULL,
  proportionate_marks DECIMAL(5,2) NOT NULL,
  cancelled_questions INTEGER DEFAULT 0,
  shift_id TEXT NOT NULL CHECK (shift_id IN ('day1_morning', 'day1_evening', 'day2_morning', 'day2_evening')),
  category TEXT NOT NULL CHECK (category IN ('UR', 'OBC', 'SC', 'ST', 'EWS')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_entries_shift ON entries(shift_id);
CREATE INDEX IF NOT EXISTS idx_entries_category ON entries(category);
CREATE INDEX IF NOT EXISTS idx_entries_proportionate ON entries(proportionate_marks DESC);
CREATE INDEX IF NOT EXISTS idx_entries_roll ON entries(roll_number);

-- Enable Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read and insert (crowdsourced data collection)
DROP POLICY IF EXISTS "Anyone can read entries" ON entries;
CREATE POLICY "Anyone can read entries" ON entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert entries" ON entries;
CREATE POLICY "Anyone can insert entries" ON entries FOR INSERT WITH CHECK (true);
