// MySupabase.js
import { createClient } from "@supabase/supabase-js";
// const supabaseUrl = "https://rudhkdzmlueqmorjgjer.supabaseco";

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
