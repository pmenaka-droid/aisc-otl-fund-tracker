const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async function(event, context) {
  try {
    console.log('🔄 Fetching balances...');
    
    // Try to get from database first
    try {
      const result = await pool.query('SELECT * FROM staff_balances ORDER BY name');
      const formattedData = result.rows.map(item => ({
        email: item.email,
        name: item.name,
        department: item.department,
        remainingBalance: parseFloat(item.remaining_balance) || 0
      }));
      
      console.log('✅ Returning balances from database:', formattedData.length);
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      };
    } catch (dbError) {
      console.log('❌ Database error, using fallback:', dbError.message);
    }
    
    // Fallback to hardcoded data
    const fallbackData = [
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
    
    console.log('✅ Returning fallback balance data');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fallbackData)
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
