import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://smsbarhdhiymmmmbsmxw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtc2JhcmhkaGl5bW1tbWJzbXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMDc0NzUsImV4cCI6MjEwMzg4MzQ3NX0.oq5Lk2_aKgLD-dCCfsFLZ4P8X7-FlLDFrw5taY3_nEo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
