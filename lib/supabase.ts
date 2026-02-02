import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database functions
export const db = {
  // Requests
  async getRequests() {
    const { data, error } = await supabase
      .from('pl_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createRequest(request) {
    const { data, error } = await supabase
      .from('pl_requests')
      .insert([request])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateRequest(id, updates) {
    const { data, error } = await supabase
      .from('pl_requests')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Balances
  async getBalances() {
    const { data, error } = await supabase
      .from('staff_balances')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async updateBalance(email, balance) {
    const { data, error } = await supabase
      .from('staff_balances')
      .update({ remaining_balance: balance, updated_at: new Date().toISOString() })
      .eq('email', email)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
