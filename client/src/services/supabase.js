// Supabase configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dgxbhrokyawvdcjejkns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRneGJocm9reWF3dmRjamVqa25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1Njk1MzYsImV4cCI6MjA3NzE0NTUzNn0.iEfjeyvBkcgCGP5ndNvHFHMd1MZAk2Ky50ABN0UneeQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
