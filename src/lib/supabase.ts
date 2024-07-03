import { createClient } from "@supabase/supabase-js";

const supabaseUrl: any = process.env.NEXT_SUP_URL;
const supabaseKey: any = process.env.NEXT_SUP_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);
