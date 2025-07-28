import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.BACKEND_SUPABASE_URL;
const supabaseServiceKey = process.env.BACKEND_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
