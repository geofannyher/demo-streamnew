import { useState, useEffect } from "react";
import { Action, getQueueData } from "../services/queue/queue.service";

export const useQueueData = ({ model_name }: { model_name: string }) => {
  const [dataQueue, setDataQueue] = useState<Action[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async ({ model_name }: { model_name: string }) => {
    const result = await getQueueData({ model_name });
    if (result.error) {
      setError(result.error.message);
    } else {
      setDataQueue(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData({ model_name });
  }, [model_name]);

  return { dataQueue, loading, error };
};
