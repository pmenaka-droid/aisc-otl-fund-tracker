const { Pool } = require('pg');

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
      try {
        const result = await pool.query(
          'SELECT * FROM pl_requests ORDER BY created_at DESC'
        );
        
        const formattedData = result.rows.map(row => ({
          id: row.id,
          staffName: row.staff_name,
          staffEmail: row.staff_email,
          supervisorEmail: row.supervisor_email,
          activityTitle: row.activity_title,
          description: row.activity_description,
          status: row.status,
          totalCost: parseFloat(row.total_cost) || 0,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          supervisorComments: row.supervisor_comments,
          otlDirectorComments: row.otl_director_comments,
          facultyRole: row.faculty_role,
          schoolSection: row.school_section ? row.school_section.split(',').filter(s => s.trim()) : [],
          provider: row.provider,
          websiteLink: row.website_link,
          startDate: row.start_date,
          endDate: row.end_date,
          registrationCost: parseFloat(row.registration_cost) || 0,
          travelCost: parseFloat(row.travel_cost) || 0,
          accommodationCost: parseFloat(row.accommodation_cost) || 0,
          otherCost: parseFloat(row.other_cost) || 0
        }));
        
        console.log('✅ Returning requests:', formattedData.length);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(formattedData)
        };
      } catch (dbError) {
        console.log('❌ Database error:', dbError.message);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
      }
    }
    
    if (httpMethod === 'POST') {
      try {
        const newRequest = JSON.parse(event.body);
        console.log('📝 Creating request:', newRequest.id);
        
        // Convert array to string for database
        const schoolSectionStr = newRequest.schoolSection ? newRequest.schoolSection.join(',') : '';
        
        const result = await pool.query(`
          INSERT INTO pl_requests (
            id, staff_name, staff_email, supervisor_email, activity_title, 
            activity_description, status, total_cost, created_at, updated_at,
            supervisor_comments, otl_director_comments, faculty_role, 
            school_section, provider, website_link, start_date, end_date,
            registration_cost, travel_cost, accommodation_cost, other_cost
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
          )
        `, [
          newRequest.id, newRequest.staffName, newRequest.staffEmail, newRequest.supervisorEmail,
          newRequest.activityTitle, newRequest.description, newRequest.status, newRequest.totalCost,
          new Date().toISOString(), new Date().toISOString(), newRequest.supervisorComments,
          newRequest.otlDirectorComments, newRequest.facultyRole, schoolSectionStr,
          newRequest.provider, newRequest.websiteLink, newRequest.startDate, newRequest.endDate,
          newRequest.registrationCost, newRequest.travelCost, newRequest.accommodationCost, newRequest.otherCost
        ]);
        
        console.log('✅ Request saved:', newRequest.id);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newRequest)
        };
      } catch (dbError) {
        console.log('❌ Insert error:', dbError.message);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to save request', message: dbError.message })
        };
      }
    }
    
    if (httpMethod === 'PUT') {
      try {
        const updatedRequest = JSON.parse(event.body);
        console.log('✏️ Updating request:', updatedRequest.id);
        
        // Convert array to string for database
        const schoolSectionStr = updatedRequest.schoolSection ? updatedRequest.schoolSection.join(',') : '';
        
        const result = await pool.query(`
          UPDATE pl_requests SET 
            staff_name = $2, staff_email = $3, supervisor_email = $4, activity_title = $5,
            activity_description = $6, status = $7, total_cost = $8, updated_at = $9,
            supervisor_comments = $10, otl_director_comments = $11, faculty_role = $12,
            school_section = $13, provider = $14, website_link = $15, start_date = $16,
            end_date = $17, registration_cost = $18, travel_cost = $19, accommodation_cost = $20, other_cost = $21
          WHERE id = $1
        `, [
          updatedRequest.id, updatedRequest.staffName, updatedRequest.staffEmail, updatedRequest.supervisorEmail,
          updatedRequest.activityTitle, updatedRequest.description, updatedRequest.status, updatedRequest.totalCost,
          new Date().toISOString(), updatedRequest.supervisorComments, updatedRequest.otlDirectorComments,
          updatedRequest.facultyRole, schoolSectionStr, updatedRequest.provider, updatedRequest.websiteLink,
          updatedRequest.startDate, updatedRequest.endDate, updatedRequest.registrationCost, updatedRequest.travelCost,
          updatedRequest.accommodationCost, updatedRequest.otherCost
        ]);
        
        console.log('✅ Request updated:', updatedRequest.id);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedRequest)
        };
      } catch (dbError) {
        console.log('❌ Update error:', dbError.message);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to update request', message: dbError.message })
        };
      }
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('❌ Function error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', message: error.message })
    };
  }
};
