import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pbhvcfsfyrauqwqfiamm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiaHZjZnNmeXJhdXF3cWZpYW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxODcxNTksImV4cCI6MjEwMTc2MzE1OX0.zYUrCBrBoZvMAe1ItDV5pelkJM35JIT2892DgzV1g7g";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);