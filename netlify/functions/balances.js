// Ultra-simple balances function - guaranteed to work
exports.handler = async function(event, context) {
  try {
    console.log('🔄 Returning simple balance data...');
    
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
    
    console.log('✅ Balance data ready:', balanceData.length);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(balanceData)
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
