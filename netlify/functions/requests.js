const { Pool } = require('pg');

// Use Netlify environment variable for Neon connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async function(event, context) {
  const { httpMethod } = event;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    if (httpMethod === 'GET') {
      const result = await pool.query(
        'SELECT * FROM pl_requests ORDER BY created_at DESC'
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows)
      };
    }
    
    if (httpMethod === 'POST') {
      const newRequest = JSON.parse(event.body);
      
      const result = await pool.query(`
        INSERT INTO pl_requests (
          id, staff_name, staff_email, supervisor_email, activity_title, 
          activity_description, status, total_cost, created_at, updated_at,
          supervisor_comments, otl_director_comments, faculty_role, 
          school_section, provider, website_link, start_date, end_date,
          registration_cost, travel_cost, accommodation_cost, other_cost
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) RETURNING *
      `, [
        newRequest.id, newRequest.staffName, newRequest.staffEmail, newRequest.supervisorEmail,
        newRequest.activityTitle, newRequest.description, newRequest.status, newRequest.totalCost,
        new Date().toISOString(), new Date().toISOString(), newRequest.supervisorComments,
        newRequest.otlDirectorComments, newRequest.facultyRole, newRequest.schoolSection,
        newRequest.provider, newRequest.websiteLink, newRequest.startDate, newRequest.endDate,
        newRequest.registrationCost, newRequest.travelCost, newRequest.accommodationCost, newRequest.otherCost
      ]);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result.rows[0])
      };
    }
    
    if (httpMethod === 'PUT') {
      const updatedRequest = JSON.parse(event.body);
      
      const result = await pool.query(`
        UPDATE pl_requests SET 
          staff_name = $2, staff_email = $3, supervisor_email = $4, activity_title = $5,
          activity_description = $6, status = $7, total_cost = $8, updated_at = $9,
          supervisor_comments = $10, otl_director_comments = $11, faculty_role = $12,
          school_section = $13, provider = $14, website_link = $15, start_date = $16,
          end_date = $17, registration_cost = $18, travel_cost = $19, accommodation_cost = $20, other_cost = $21
        WHERE id = $1 RETURNING *
      `, [
        updatedRequest.id, updatedRequest.staffName, updatedRequest.staffEmail, updatedRequest.supervisorEmail,
        updatedRequest.activityTitle, updatedRequest.description, updatedRequest.status, updatedRequest.totalCost,
        new Date().toISOString(), updatedRequest.supervisorComments, updatedRequest.otlDirectorComments,
        updatedRequest.facultyRole, updatedRequest.schoolSection, updatedRequest.provider, updatedRequest.websiteLink,
        updatedRequest.startDate, updatedRequest.endDate, updatedRequest.registrationCost, updatedRequest.travelCost,
        updatedRequest.accommodationCost, updatedRequest.otherCost
      ]);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows[0])
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
