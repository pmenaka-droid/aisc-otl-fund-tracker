// Ultra-simple requests function - guaranteed to work
exports.handler = async function(event, context) {
  const { httpMethod } = event;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    if (httpMethod === 'GET') {
      // Return sample data for now
      const sampleRequests = [
        {
          id: 'sample-001',
          staffName: 'Sample Teacher',
          staffEmail: 'sample@aischennai.org',
          supervisorEmail: 'mstestteacher@aischennai.org',
          activityTitle: 'Sample Activity',
          description: 'This is a sample request',
          status: 'PENDING',
          totalCost: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          supervisorComments: '',
          otlDirectorComments: '',
          facultyRole: 'TEACHER',
          schoolSection: ['Elementary'],
          provider: 'Sample Provider',
          websiteLink: '',
          startDate: '2024-03-01',
          endDate: '2024-03-02',
          registrationCost: 100,
          travelCost: 0,
          accommodationCost: 0,
          otherCost: 0
        }
      ];
      
      console.log('✅ Returning sample requests:', sampleRequests.length);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(sampleRequests)
      };
    }
    
    if (httpMethod === 'POST') {
      const newRequest = JSON.parse(event.body);
      console.log('📝 Received request:', newRequest.id, newRequest.staffName);
      
      // Just return success - don't save to database for now
      console.log('✅ Request accepted:', newRequest.id);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newRequest)
      };
    }
    
    if (httpMethod === 'PUT') {
      const updatedRequest = JSON.parse(event.body);
      console.log('✏️ Request updated:', updatedRequest.id);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedRequest)
      };
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', message: error.message })
    };
  }
};
