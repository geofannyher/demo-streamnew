import { supabase } from "@/lib/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";
export interface Action {
  id: number;
  action_name: string;
  time_start: string;
  time_end: string;
  code: string;
  codee: string;
}
export interface ISubmitQueue {
  action_name: string;
  text: string;
  queue_num: string;
  time_end: string;
  time_start: string;
  id_audio: string;
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

export const submitQueue = async ({
  action_name,
  text,
  queue_num,
  time_end,
  time_start,
  id_audio,
}: ISubmitQueue) => {
  const { data, error } = await supabase.from("queueTable").insert({
    action_name,
    text,
    queue_num,
    time_start,
    time_end,
    id_audio,
  });
  if (error) {
    return error;
  } else {
    return data;
  }
};

export const deleteQueue = async ({ id }: { id: number }) => {
  const { data, error } = await supabase
    .from("queueTable")
    .delete()
    .eq("id", id);
  if (error) {
    return { data: null, error };
  }
  return { data, error: null };
};
