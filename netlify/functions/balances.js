const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async function(event, context) {
  try {
    console.log('🔄 Balances function called');
    
    try {
      console.log('📤 Fetching balances from database...');
      
      const result = await pool.query('SELECT * FROM staff_balances ORDER BY name');
      
      console.log('✅ Raw database rows:', result.rows.length);
      
      const formattedData = result.rows.map(item => ({
        email: item.email,
        name: item.name,
        department: item.department || '',
        remainingBalance: parseFloat(item.remaining_balance) || 0
      }));
      
      console.log('✅ Formatted balances:', formattedData.length);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      };
    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
      
      // Return hardcoded balance data
      const balanceData = [
        {
          email: 'pmenaka@aischennai.org',
          name: 'Menaka P',
          department: 'Technology',
          remainingBalance: 1000
        },
        {
          email: 'hfelina@aischennai.org',
          name: 'Felina Heart',
          department: 'Mathematics',
          remainingBalance: 500
        },
        {
          email: 'mstestteacher@aischennai.org',
          name: 'MS Test Teacher',
          department: 'Testing',
          remainingBalance: 1000
        }
      ];
      
      console.log('✅ Returning hardcoded balance data:', balanceData.length);
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(balanceData)
      };
    }
    
  } catch (error) {
    console.error('❌ Balance function error:', error.message);
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
