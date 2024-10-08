import { supabase } from "@/lib/supabase";

export const getDataService = async () => {
  try {
    const { data, error } = await supabase.from("data").select("*").single();
    if (error) {
      return error;
    }
    return data;
  } catch (error) {
    return error;
  }
};
