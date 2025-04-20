
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://brjhlpfrdvpywvhzjptq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyamhscGZyZHZweXd2aHpqcHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTk3MDUsImV4cCI6MjA2MDQ5NTcwNX0.BWa4Q7lENiUSY9IIO93vsnvhNcflpyi3XgpCr277Y0I";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  }
});
