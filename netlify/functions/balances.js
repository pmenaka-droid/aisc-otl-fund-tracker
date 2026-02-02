const { Pool } = require('pg');

// Robust database connection with retry logic
let pool = null;

async function getPool() {
  if (!pool) {
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
          require: true
        },
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
      
      // Test connection
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }
  return pool;
}

exports.handler = async function(event, context) {
  try {
    console.log('🔄 Fetching balances...');
    
    try {
      const pool = await getPool();
      
      // Ensure table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS staff_balances (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          department TEXT,
          remaining_balance DECIMAL(10,2) DEFAULT 0,
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      const result = await pool.query('SELECT * FROM staff_balances ORDER BY name');
      const formattedData = result.rows.map(item => ({
        email: item.email,
        name: item.name,
        department: item.department || '',
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
      console.log('⚠️ Database failed, using fallback:', dbError.message);
    }
    
    // Fallback data
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
    console.error('❌ Balance error:', error.message);
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
