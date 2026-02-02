# 🔧 Debugging Guide for Balance, Email & Supervisor Issues

## 🚀 Step 1: Test API Endpoints Directly

### Test Requests API:
```bash
# Test GET requests (should return empty array or existing requests)
curl https://your-site.netlify.app/api/requests

# Test POST request (create a test request)
curl -X POST https://your-site.netlify.app/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-debug-001",
    "staffName": "Debug Teacher",
    "staffEmail": "debug@aischennai.org",
    "supervisorEmail": "mstestteacher@aischennai.org",
    "activityTitle": "Debug Test Activity",
    "description": "This is a debug test request",
    "status": "PENDING",
    "totalCost": 100,
    "facultyRole": "TEACHER",
    "schoolSection": ["Elementary"],
    "provider": "Debug Provider",
    "startDate": "2024-03-01",
    "endDate": "2024-03-02",
    "registrationCost": 100,
    "travelCost": 0,
    "accommodationCost": 0,
    "otherCost": 0
  }'
```

### Test Balances API:
```bash
# Test GET balances (should return balance data)
curl https://your-site.netlify.app/api/balances
```

## 🚀 Step 2: Check Netlify Function Logs

### In Netlify Dashboard:
1. Go to your site
2. Click "Functions" tab
3. Look for recent function calls
4. Check for errors in:
   - `requests` function logs
   - `balances` function logs

### What to Look For:
- ✅ "✅ Returning requests from database: X"
- ✅ "✅ Request saved to database: test-debug-001"
- ✅ "✅ Returning balances from Google Sheets: X"
- ❌ Any error messages

## 🚀 Step 3: Test Database Directly

### In Neon SQL Editor:
```sql
-- Check if requests exist
SELECT * FROM pl_requests;

-- Check if balances exist
SELECT * FROM staff_balances;

-- Insert test request manually
INSERT INTO pl_requests (
  id, staff_name, staff_email, supervisor_email, activity_title, 
  activity_description, status, total_cost, faculty_role, 
  school_section, provider, start_date, end_date,
  registration_cost, travel_cost, accommodation_cost, other_cost
) VALUES (
  'test-manual-001', 
  'Manual Test Teacher', 
  'manual@aischennai.org', 
  'mstestteacher@aischennai.org', 
  'Manual Test Activity', 
  'This is a manual test request', 
  'PENDING', 
  150.00,
  'TEACHER',
  ARRAY['Elementary'],
  'Manual Provider',
  '2024-03-01',
  '2024-03-02',
  150.00,
  0.00,
  0.00,
  0.00
);

-- Verify it was inserted
SELECT * FROM pl_requests WHERE id = 'test-manual-001';
```

## 🚀 Step 4: Test Frontend Debugging

### In Browser Console (F12):
1. Open your app
2. Submit a new request
3. Look for console logs:
   - "✅ Requests from API: X"
   - "👤 Current user: {...}"
   - "📋 All requests loaded: X"
   - "🔍 Checking request: {...}"

## 🚀 Step 5: Common Issues & Solutions

### Issue 1: Balance Sync Error
**Symptom:** "Failed to fetch balances"
**Solution:** Check Google Sheets accessibility and API key

### Issue 2: Email Not Triggered
**Symptom:** No email sent after request submission
**Solution:** Check Gmail API setup and access token

### Issue 3: Supervisor Dashboard Empty
**Symptom:** Supervisor sees no requests
**Solution:** Check data mapping and supervisor email matching

### Issue 4: Request Not Saving
**Symptom:** Request disappears after submission
**Solution:** Check database connection and table structure

## 🚀 Step 6: Environment Variables Check

### In Netlify Site Settings → Environment Variables:
Make sure you have:
```
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

## 🎯 Quick Test Sequence:

1. **Wait for deployment** (2-3 minutes)
2. **Test API endpoints** with curl commands
3. **Check Netlify function logs**
4. **Test database directly** with SQL
5. **Test frontend** with browser console
6. **Report specific errors** you see

## 📞 What to Report Back:

1. **API test results** (curl commands output)
2. **Function log errors** (if any)
3. **Database query results** (SQL output)
4. **Browser console logs** (frontend logs)
5. **Specific error messages** (exact text)

This will help me pinpoint the exact issue and fix it quickly!
