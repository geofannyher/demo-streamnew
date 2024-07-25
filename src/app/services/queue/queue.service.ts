import { supabase } from "@/lib/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";
export interface Action {
  id: number;
  action_name: string;
  time_start: string;
  time_end: string;
  code: string;
}
export const getQueueData = async ({
  model_name,
}: {
  model_name: string;
}): Promise<PostgrestResponse<Action>> => {
  const { data, error } = await supabase
    .from("action")
    .select("*")
    .eq("model_name", model_name);
  if (error) {
    return { data: null, error } as PostgrestResponse<Action>;
  } else {
    return { data, error: null } as PostgrestResponse<Action>;
  }
};
