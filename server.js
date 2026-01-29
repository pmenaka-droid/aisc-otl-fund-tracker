import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Google Sheets API integration
const GOOGLE_SHEETS_API_KEY = 'AIzaSyAgcRMy-GyqbGrtLF4vYPzMhWiWqKCcsqc'; // Using your existing Gemini API key for Sheets
const SPREADSHEET_ID = '1tRmKPFJUwZtxJKlO86W31FKuzvbYArVQwm3wRr-AWW4'; // Updated with your new sheet ID
const BALANCE_RANGE = 'Sheet1!A:D'; // Adjust based on your sheet structure

// Alternative: Use public CSV export (no API key needed)
const CSV_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;

// Fetch real-time balances from Google Sheets (using CSV export)
async function fetchBalancesFromGoogleSheets() {
  try {
    console.log('🔍 Attempting to fetch from Google Sheets (CSV export)...');
    
    // Try CSV export first (no API key required)
    const response = await fetch(CSV_EXPORT_URL, {
      redirect: 'follow' // Follow redirects
    });
    
    console.log('📊 Google Sheets CSV response status:', response.status);
    
    if (!response.ok) {
      console.log('⚠️ CSV export failed, trying API...');
      // Fallback to API method
      return await fetchBalancesFromGoogleSheetsAPI();
    }
    
    const csvText = await response.text();
    console.log('📋 Raw CSV data from Google Sheets:', csvText.substring(0, 200) + '...');
    
    // Parse CSV
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('📝 Number of rows found:', lines.length);
    
    if (lines.length <= 1) {
      console.warn('⚠️ No data found in Google Sheets');
      return null;
    }
    
    // Name to email mapping for AISC staff
    const nameToEmailMap = {
      'Menaka P': 'pmenaka@aischennai.org',
      'Menaka Periyasamy': 'pmenaka@aischennai.org',
      'Felina Heart': 'hfelina@aischennai.org',
      'Linda Gerberich': 'glinda@aischennai.org',
      'MS Test Teacher': 'mstestteacher@aischennai.org', 
      'John Doe': 'jdoe@aischennai.org',
      'Jane Smith': 'sjane@aischennai.org',
      'Alice Jones': 'jalice@aischennai.org',
      'Kalpana Dutt': 'dkalpana@aischennai.org',
      'Casey K': 'kcasey@aischennai.org',
      'Vidhya Venkatesh TA': 'vvidhya@aischennai.org'
    };
    
    // Function to generate email from name: firstinitial+lastname@aischennai.org
    const generateEmailFromName = (name) => {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        const firstName = parts[0].toLowerCase();
        const lastName = parts[parts.length - 1].toLowerCase();
        return `${lastName[0]}${firstName}@aischennai.org`;
      }
      return `${name.toLowerCase().replace(/\s+/g, '')}@aischennai.org`;
    };
    
    // Skip header row and process balances
    const balances = lines.slice(1).map((line, index) => {
      const row = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
      console.log(`👤 Processing row ${index + 2}:`, row);
      
      const name = row[0] || ''; // Name column (assuming name is first)
      const email = nameToEmailMap[name] || generateEmailFromName(name);
      
      // Try different column positions for balance (could be column 2, 3, or 4)
      let balance = 0;
      for (let i = 2; i <= 4; i++) {
        const potentialBalance = parseFloat(row[i]) || 0;
        if (potentialBalance > 0) {
          balance = potentialBalance;
          console.log(`💰 Found balance ${balance} in column ${i} for ${name}`);
          break;
        }
      }
      
      return {
        email: email, // Mapped or generated email
        name: name,  // Name column  
        department: row[1] || '', // Department column
        remainingBalance: balance // Balance column
      };
    }).filter(balance => {
      // Keep all entries with valid name data
      const isValid = balance.name;
      if (!isValid && balance.name) {
        console.log('⚠️ Filtered out invalid entry:', balance.name);
      }
      return isValid;
    });
    
    console.log('✅ Processed balances:', balances);
    return balances;
  } catch (error) {
    console.error('❌ Error fetching balances from Google Sheets:', error.message);
    return null;
  }
}

// Fallback to API method
async function fetchBalancesFromGoogleSheetsAPI() {
  try {
    console.log('🔍 Attempting API method...');
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${BALANCE_RANGE}?key=${GOOGLE_SHEETS_API_KEY}`
    );
    
    console.log('📊 Google Sheets API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Google Sheets API Error:', errorData);
      throw new Error(`Google Sheets API Error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('📋 Raw data from Google Sheets:', data);
    
    const rows = data.values || [];
    console.log('📝 Number of rows found:', rows.length);
    
    if (rows.length === 0) {
      console.warn('⚠️ No data found in Google Sheets');
      return null;
    }
    
    // Skip header row and process balances
    const balances = rows.slice(1).map((row, index) => {
      console.log(`👤 Processing row ${index + 2}:`, row);
      return {
        email: row[0] || '', // Email column
        name: row[1] || '',  // Name column  
        department: row[2] || '', // Department column
        remainingBalance: parseFloat(row[3]) || 0 // Balance column
      };
    }).filter(balance => {
      const isValid = balance.email && balance.email.includes('@aischennai.org');
      if (!isValid && balance.email) {
        console.log('⚠️ Filtered out non-AISC email:', balance.email);
      }
      return isValid;
    });
    
    console.log('✅ Processed balances:', balances);
    return balances;
  } catch (error) {
    console.error('❌ Error fetching balances from Google Sheets:', error.message);
    return null;
  }
}

// In-memory storage (for demo - in production use a database)
let requests = [];
let balances = [];

// Initialize with sample data
const INITIAL_REQUESTS = [
  {
    id: 'REQ-1001',
    staffEmail: 'jane.smith@aischennai.org',
    staffName: 'Jane Smith',
    facultyRole: 'Teacher',
    schoolSection: ['MS', 'HS'],
    activityTitle: 'International Science Conference 2024',
    description: 'A 3-day conference focused on modern laboratory safety and innovative teaching methods.',
    websiteLink: 'https://scienceconf2024.org',
    provider: 'Science Teachers Association',
    isOnline: 'No, in-person only',
    discussedWithSupervisor: true,
    startDate: '2024-05-10',
    endDate: '2024-05-13',
    totalDays: 4,
    location: 'Singapore',
    submissionDate: '2024-03-15',
    status: 'PENDING',
    supervisorEmail: 'mstestteacher@aischennai.org',
    registrationFee: 500,
    travelCost: 300,
    accommodationCost: 200,
    visaCost: 50,
    otherCost: 0,
    totalCost: 1050
  }
];

const INITIAL_BALANCES = [
  { email: 'pmenaka@aischennai.org', name: 'Menaka P', department: 'OTL', remainingBalance: 1500.00 },
  { email: 'mstestteacher@aischennai.org', name: 'MS Test Teacher', department: 'Middle School', remainingBalance: 1500.00 },
  { email: 'john.doe@aischennai.org', name: 'John Doe', department: 'Mathematics', remainingBalance: 1200.00 },
  { email: 'jane.smith@aischennai.org', name: 'Jane Smith', department: 'Science', remainingBalance: 850.50 },
  { email: 'alice.jones@aischennai.org', name: 'Alice Jones', department: 'English', remainingBalance: 400.00 },
];

// Initialize data if empty
if (requests.length === 0) requests = INITIAL_REQUESTS;
if (balances.length === 0) balances = INITIAL_BALANCES;

// API Routes
app.get('/api/requests', (req, res) => {
  res.json(requests);
});

app.post('/api/requests', async (req, res) => {
  const newRequest = req.body;
  
  // Update balance in Google Sheets when request is submitted
  try {
    const currentBalances = await fetchBalancesFromGoogleSheets();
    const userBalance = currentBalances?.find(b => b.email.toLowerCase() === newRequest.staffEmail.toLowerCase());
    
    if (userBalance) {
      const newBalance = userBalance.remainingBalance - newRequest.totalCost;
      console.log(`Updating ${newRequest.staffName} balance: ${userBalance.remainingBalance} → ${newBalance}`);
      
      // Here you could add code to update the Google Sheet
      // For now, we'll just log the balance change
    }
  } catch (error) {
    console.error('Error updating balance:', error);
  }
  
  requests.unshift(newRequest); // Add to beginning
  res.json(newRequest);
});

app.put('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const updatedRequest = req.body;
  const index = requests.findIndex(req => req.id === id);
  
  if (index !== -1) {
    requests[index] = updatedRequest;
    res.json(updatedRequest);
  } else {
    res.status(404).json({ error: 'Request not found' });
  }
});

app.get('/api/balances', async (req, res) => {
  try {
    // Try to fetch from Google Sheets first
    const googleSheetsBalances = await fetchBalancesFromGoogleSheets();
    
    if (googleSheetsBalances) {
      res.json(googleSheetsBalances);
    } else {
      // Fallback to in-memory balances
      res.json(balances);
    }
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.json(balances); // Fallback
  }
});

app.get('/api/balances/refresh', async (req, res) => {
  try {
    const freshBalances = await fetchBalancesFromGoogleSheets();
    if (freshBalances) {
      balances = freshBalances; // Update in-memory cache
      res.json({ success: true, balances: freshBalances });
    } else {
      res.status(500).json({ error: 'Failed to fetch from Google Sheets' });
    }
  } catch (error) {
    console.error('Error refreshing balances:', error);
    res.status(500).json({ error: 'Failed to refresh balances' });
  }
});

app.put('/api/balances/:email', (req, res) => {
  const { email } = req.params;
  const updatedBalance = req.body;
  const index = balances.findIndex(bal => bal.email === email);
  
  if (index !== -1) {
    balances[index] = updatedBalance;
    res.json(updatedBalance);
  } else {
    res.status(404).json({ error: 'Balance not found' });
  }
});

app.listen(port, () => {
  console.log(`OTL API Server running on port ${port}`);
});

// Export for Vercel
export default app;
