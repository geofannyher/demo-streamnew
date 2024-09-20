import { supabase } from "@/lib/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import axios from "axios";

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
  const { error } = await supabase
    .from("action")
    .insert({ action_name, time_start, time_end, video_url, model_name });
  if (error) {
    return error;
  }
  return "ok";
};

export const submitToApi = async (formattedData: any) => {
  try {
    const res = await axios.post("https://chatx-api.hadiwijaya.co/chat", {
      chat_limit: 1,
      id: "duwi",
      is_rag: "false",
      message: JSON.stringify(formattedData),
      model: "gpt-4o",
      star: "stream_director2",
      temperature: 0,
    });

    if (res?.data?.message === "Success") {
      return res?.data?.data;
    }
  } catch (error) {
    return "error";
  }
};

export const getDataAction = async ({
  code,
  model,
}: {
  code: string;
  model: string;
}) => {
  const res: PostgrestSingleResponse<any> = await supabase
    .from("action")
    .select("*")
    .eq("code", code.toLowerCase())
    .eq("model_name", model);
  return res;
};
