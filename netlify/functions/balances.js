import fetch from 'node-fetch';

const GOOGLE_SHEETS_API_KEY = 'AIzaSyAgcRMy-GyqbGrtLF4vYPzMhWiWqKCcsqc';
const SPREADSHEET_ID = '1tRmKPFJUwZtxJKlO86W31FKuzvbYArVQwm3wRr-AWW4';

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

export async function handler(event, context) {
  try {
    console.log('🔄 Fetching balances from Google Sheets...');
    
    // Try CSV export first (doesn't require API key)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;
    
    const response = await fetch(csvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvData = await response.text();
    const lines = csvData.split('\n').filter(line => line.trim());
    
    if (lines.length <= 1) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([])
      };
    }
    
    // Skip header row and process balances
    const balances = lines.slice(1).map((line, index) => {
      const row = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
      
      const name = row[0] || '';
      const email = nameToEmailMap[name] || generateEmailFromName(name);
      
      // Try different column positions for balance (could be column 2, 3, or 4)
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
        remainingBalance: balance
      };
    }).filter(balance => balance.name);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(balances)
    };
    
  } catch (error) {
    console.error('❌ Error fetching balances:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to fetch balances' })
    };
  }
}
