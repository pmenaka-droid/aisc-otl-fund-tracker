const { Pool } = require('pg');

// Use Netlify environment variable for Neon connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Google Sheets integration for balances
const https = require('https');
const GOOGLE_SHEETS_API_KEY = 'AIzaSyAgcRMy-GyqbGrtLF4vYPzMhWiWqKCcsqc';
const SPREADSHEET_ID = '1tRmKPFJUwZtxJKlO86W31FKuzvbYArVQwm3wRr-AWW4';

// Name to email mapping
const nameToEmailMap = {
  'Menaka P': 'pmenaka@aischennai.org',
  'Felina Heart': 'hfelina@aischennai.org',
  'MS Test Teacher': 'mstestteacher@aischennai.org'
};

const generateEmailFromName = (name) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const firstName = parts[0].toLowerCase();
    const lastName = parts[parts.length - 1].toLowerCase();
    return `${lastName[0]}${firstName}@aischennai.org`;
  }
  return `${name.toLowerCase().replace(/\s+/g, '')}@aischennai.org`;
};

exports.handler = async function(event, context) {
  try {
    console.log('🔄 Fetching balances from Google Sheets and Neon...');
    
    // First try to get from Google Sheets
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;
    
    const response = await new Promise((resolve, reject) => {
      https.get(csvUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ ok: res.statusCode === 200, data }));
      }).on('error', reject);
    });
    
    let balances = [];
    
    if (response.ok) {
      const csvData = response.data;
      const lines = csvData.split('\n').filter(line => line.trim());
      
      if (lines.length > 1) {
        balances = lines.slice(1).map((line) => {
          const row = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
          const name = row[0] || '';
          const email = nameToEmailMap[name] || generateEmailFromName(name);
          
          let balance = 0;
          for (let i = 2; i <= 4; i++) {
            const potentialBalance = parseFloat(row[i]) || 0;
            if (potentialBalance > 0) {
              balance = potentialBalance;
              break;
            }
          }
          
          return {
            email: email,
            name: name,
            department: row[1] || '',
            remaining_balance: balance
          };
        }).filter(b => b.name);
      }
    }
    
    // Update Neon with latest balances
    if (balances.length > 0) {
      for (const balance of balances) {
        await pool.query(`
          INSERT INTO staff_balances (email, name, department, remaining_balance, updated_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            department = EXCLUDED.department,
            remaining_balance = EXCLUDED.remaining_balance,
            updated_at = EXCLUDED.updated_at
        `, [
          balance.email, balance.name, balance.department, 
          balance.remaining_balance, new Date().toISOString()
        ]);
      }
    }
    
    // Get final balances from Neon
    const result = await pool.query('SELECT * FROM staff_balances ORDER BY name');
    
    // Transform data to match frontend format
    const formattedData = result.rows.map(item => ({
      email: item.email,
      name: item.name,
      department: item.department,
      remainingBalance: item.remaining_balance
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedData)
    };
    
  } catch (error) {
    console.error('❌ Error fetching balances:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to fetch balances', message: error.message })
    };
  }
};
