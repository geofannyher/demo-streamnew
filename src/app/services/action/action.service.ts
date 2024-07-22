import { supabase } from "@/lib/supabase";

export const submitAction = async ({
  action_name,
  time_end,
  time_start,
  video_url,
  model_name,
}: {
  action_name: string;
  time_start: string;
  time_end: string;
  video_url: string | null;
  model_name: string;
}) => {
  const { data, error } = await supabase
    .from("action")
    .insert({ action_name, time_start, time_end, video_url, model_name });
  if (error) {
    return error;
  }
  return "ok";
};
