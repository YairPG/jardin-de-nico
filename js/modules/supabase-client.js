// js/modules/supabase-client.js
const SUPABASE_URL = 'https://iuawmcybmjoxuczamvsk.supabase.co';
// Asegúrate de que esta sea la "anon public" key de Project Settings > API
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YXdtY3libWpveHVjemFtdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MzQwODIsImV4cCI6MjA4NzExMDA4Mn0.RwPSfEPFi0VBhPS3gzSBsFb5_iL6ldIIIdL-OhiIQps'; 

// Usamos window.supabase porque la librería se carga globalmente desde el CDN
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);