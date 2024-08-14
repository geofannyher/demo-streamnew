import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = "https://raudgqgetssjclogeaex.supabase.co";
const supabaseKey: string =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdWRncWdldHNzamNsb2dlYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMxMDIwOTAsImV4cCI6MjAzODY3ODA5MH0.32lHuM9Q_yuFK19HoqhfjX4Urr5xeXy5UVvTdbl8p9o";
if (!supabaseKey) {
  throw new Error("Supabase key is requirede");
}
export const supabase = createClient(supabaseUrl, supabaseKey);
