const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    console.log('🔄 Fetching balances from Google Sheets and Supabase...');
    
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
    
    // Update Supabase with latest balances
    if (balances.length > 0) {
      for (const balance of balances) {
        await supabase
          .from('staff_balances')
          .upsert({
            email: balance.email,
            name: balance.name,
            department: balance.department,
            remaining_balance: balance.remaining_balance,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'email'
          });
      }
    }
    
    // Get final balances from Supabase
    const { data, error } = await supabase
      .from('staff_balances')
      .select('*');
    
    if (error) throw error;
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data || balances)
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
