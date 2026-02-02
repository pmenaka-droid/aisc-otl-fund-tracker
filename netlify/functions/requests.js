// Use a simple in-memory storage with persistence
let requests = [];

// Try to load existing requests from environment variable or file
try {
  // In production, this would be a database
  // For now, we'll use a simple approach with environment variables
  const existingRequests = process.env.EXISTING_REQUESTS;
  if (existingRequests) {
    requests = JSON.parse(existingRequests);
  }
} catch (error) {
  console.log('Starting with empty requests array');
}

exports.handler = async function(event, context) {
  console.log('🔄 Requests function called, method:', event.httpMethod);
  
  const { httpMethod } = event;
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    if (httpMethod === 'GET') {
      console.log('📤 Returning requests:', requests.length);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(requests)
      };
    }
    
    if (httpMethod === 'POST') {
      const newRequest = JSON.parse(event.body);
      
      // Check if request already exists
      const existingIndex = requests.findIndex(req => req.id === newRequest.id);
      if (existingIndex !== -1) {
        requests[existingIndex] = newRequest;
        console.log('🔄 Updated existing request:', newRequest.id);
      } else {
        requests.unshift(newRequest);
        console.log('➕ Added new request:', newRequest.id);
      }
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newRequest)
      };
    }
    
    if (httpMethod === 'PUT') {
      const updatedRequest = JSON.parse(event.body);
      const index = requests.findIndex(req => req.id === updatedRequest.id);
      
      if (index !== -1) {
        requests[index] = updatedRequest;
        console.log('✏️ Updated request:', updatedRequest.id);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedRequest)
        };
      }
      
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Request not found' })
      };
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('❌ Error in requests function:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', message: error.message })
    };
  }
};
