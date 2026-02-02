# Supabase Integration for AISC OTL Fund Tracker

## Setup Instructions

### 1. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Get Project URL and anon key
4. Set environment variables in Netlify

### 3. Environment Variables
In Netlify dashboard → Site settings → Environment variables:
```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

### 4. Database Tables
Run this SQL in Supabase SQL Editor:

```sql
-- Create requests table
CREATE TABLE pl_requests (
  id TEXT PRIMARY KEY,
  staff_name TEXT NOT NULL,
  staff_email TEXT NOT NULL,
  supervisor_email TEXT NOT NULL,
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  status TEXT DEFAULT 'PENDING',
  total_cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  supervisor_comments TEXT,
  otl_director_comments TEXT,
  faculty_role TEXT,
  school_section TEXT[],
  provider TEXT,
  website_link TEXT,
  start_date TEXT,
  end_date TEXT,
  registration_cost DECIMAL(10,2),
  travel_cost DECIMAL(10,2),
  accommodation_cost DECIMAL(10,2),
  other_cost DECIMAL(10,2)
);

-- Create balances table
CREATE TABLE staff_balances (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT,
  remaining_balance DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial balances
INSERT INTO staff_balances (email, name, department, remaining_balance) VALUES
('pmenaka@aischennai.org', 'Menaka P', 'Technology', 1000),
('hfelina@aischennai.org', 'Felina Heart', 'Mathematics', 500),
('mstestteacher@aischennai.org', 'MS Test Teacher', 'Testing', 1000);

-- Enable Row Level Security
ALTER TABLE pl_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_balances ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view requests" ON pl_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert requests" ON pl_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update requests" ON pl_requests FOR UPDATE USING (true);
CREATE POLICY "Anyone can view balances" ON staff_balances FOR SELECT USING (true);
```

### 5. Update Netlify Functions
Replace the current functions with Supabase integration.

### 6. Benefits
- ✅ Persistent data storage
- ✅ Real-time updates
- ✅ Multi-user support
- ✅ Scalable and reliable
- ✅ Free tier available
