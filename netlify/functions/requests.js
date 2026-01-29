let requests = [];

exports.handler = async function(event, context) {
  const { httpMethod } = event;
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    if (httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(requests)
      };
    }
    
    if (httpMethod === 'POST') {
      const newRequest = JSON.parse(event.body);
      requests.unshift(newRequest);
      
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
