import { supabase } from "@/lib/supabase";

export const getDataService = async () => {
  try {
    const { data, error } = await supabase.from("data").select("key").single();
    if (error) {
      return error;
    }
    return data;
  } catch (error) {
    return error;
  }
};
