exports.handler = async function(event, context) {
  console.log('🔄 Balances function called');
  
  try {
    // Return sample data for testing
    const sampleBalances = [
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
      }
    ];
    
    console.log('✅ Returning sample balances:', sampleBalances.length);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sampleBalances)
    };
    
  } catch (error) {
    console.error('❌ Error in balances function:', error.message);
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
