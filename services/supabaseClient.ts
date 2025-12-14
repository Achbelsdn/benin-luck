import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oknlgcbksdoegncejjfp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rbmxnY2Jrc2RvZWduY2VqamZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1OTQ2NTAsImV4cCI6MjA4MTE3MDY1MH0.S-t-isvTm5KLhKRRpyICBAxDYYJhVUD8g6wuIPFU-kg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
