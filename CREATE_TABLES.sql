-- Create requests table
CREATE TABLE IF NOT EXISTS pl_requests (
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
CREATE TABLE IF NOT EXISTS staff_balances (
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
('mstestteacher@aischennai.org', 'MS Test Teacher', 'Testing', 1000)
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pl_requests_created_at ON pl_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pl_requests_status ON pl_requests(status);
CREATE INDEX IF NOT EXISTS idx_pl_requests_supervisor_email ON pl_requests(supervisor_email);
CREATE INDEX IF NOT EXISTS idx_staff_balances_email ON staff_balances(email);

-- Verify tables were created
SELECT 'pl_requests table created' as status, COUNT(*) as row_count FROM pl_requests
UNION ALL
SELECT 'staff_balances table created' as status, COUNT(*) as row_count FROM staff_balances;
