"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface IDataModel {
  model_name: string;
}
export const useListModel = () => {
  const [data, setData] = useState<IDataModel[]>([]);
  const getDataModel = async () => {
    const { data, error } = await supabase.from("action").select("model_name");

    console.log(data);
    if (error) {
      console.log(error);
    } else {
      const uniqueData = Array.from(
        new Set(data.map((item) => item.model_name))
      ).map((model_name) => ({ model_name }));
      setData(uniqueData);
    }
  };
  useEffect(() => {
    getDataModel();
  }, []);
  return { data };
};
