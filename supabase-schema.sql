-- Supabase Database Schema for Class Track Application
-- This file contains the SQL commands to create the required tables

-- Table 1: Class Types
-- Stores the different types of classes with their names and colors
CREATE TABLE class_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#FF6B6B',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: Semester Ranges  
-- Stores the semester date ranges
CREATE TABLE semester_ranges (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  name VARCHAR(100) DEFAULT 'Current Semester',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: Class Entries
-- Stores individual class entries for each day with status and notes
CREATE TABLE class_entries (
  id SERIAL PRIMARY KEY,
  class_type_id INTEGER NOT NULL REFERENCES class_types(id) ON DELETE CASCADE,
  semester_range_id INTEGER NOT NULL REFERENCES semester_ranges(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  period INTEGER NOT NULL CHECK (period >= 1 AND period <= 7),
  status BOOLEAN DEFAULT FALSE, -- completed or not
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_type_id, date, period) -- Prevent duplicate entries for same class/date/period
);

-- Create indexes for better performance
CREATE INDEX idx_class_entries_date ON class_entries(date);
CREATE INDEX idx_class_entries_class_type ON class_entries(class_type_id);
CREATE INDEX idx_class_entries_semester ON class_entries(semester_range_id);
CREATE INDEX idx_class_entries_status ON class_entries(status);

-- Insert default class types
INSERT INTO class_types (name, color) VALUES
  ('Class 1', '#FF6B6B'),
  ('Class 2', '#4ECDC4'),
  ('Class 3', '#45B7D1'),
  ('Class 4', '#96CEB4'),
  ('Class 5', '#FFEAA7'),
  ('Class 6', '#DDA0DD'),
  ('Class 7', '#98D8C8'),
  ('Class 8', '#F7DC6F'),
  ('Class 9', '#BB8FCE'),
  ('Class 10', '#85C1E9'),
  ('동아리', '#F8C471');

-- Insert default semester range
INSERT INTO semester_ranges (start_date, end_date, name) VALUES
  ('2025-08-01', '2026-05-31', '2025-2026 Academic Year');

-- Enable Row Level Security (RLS) for better security
ALTER TABLE class_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE semester_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (since we're using anon key)
CREATE POLICY "Allow anonymous read access to class_types" ON class_types
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to semester_ranges" ON semester_ranges
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to class_entries" ON class_entries
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access to class_entries" ON class_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to class_entries" ON class_entries
  FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete access to class_entries" ON class_entries
  FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_class_types_updated_at BEFORE UPDATE ON class_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_semester_ranges_updated_at BEFORE UPDATE ON semester_ranges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_entries_updated_at BEFORE UPDATE ON class_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
