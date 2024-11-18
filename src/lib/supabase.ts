import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  throw new Error('VITE_SUPABASE_URL moet beginnen met https:// en geconfigureerd zijn in je .env bestand.');
}

if (!supabaseKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is niet geconfigureerd. Voeg deze toe aan je .env bestand.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);