const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

exports.handler = async function(event, context) {
  const { httpMethod } = event;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    if (httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('pl_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data || [])
      };
    }
    
    if (httpMethod === 'POST') {
      const newRequest = JSON.parse(event.body);
      
      const { data, error } = await supabase
        .from('pl_requests')
        .insert([newRequest])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(data)
      };
    }
    
    if (httpMethod === 'PUT') {
      const updatedRequest = JSON.parse(event.body);
      const { id } = updatedRequest;
      
      const { data, error } = await supabase
        .from('pl_requests')
        .update({ ...updatedRequest, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
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
