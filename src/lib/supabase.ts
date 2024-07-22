import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = "https://qdrrapmfxjaelbjhhhzx.supabase.co";
const supabaseKey: string =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcnJhcG1meGphZWxiamhoaHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE2MzA5MTIsImV4cCI6MjAzNzIwNjkxMn0.hi4ZfzeX96zJgTx7ah4WU6iD_9wTMEpY1e8LC3YGqXA";
if (!supabaseKey) {
  throw new Error("Supabase key is requirede");
}
export const supabase = createClient(supabaseUrl, supabaseKey);
