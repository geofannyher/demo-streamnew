import { useState } from "react";

export const useChangeTime = () => {
  const [time, setTime] = useState(20);

  const handleChangeTime = ({ time }: { time: string }) => {
    setTime(Number(time));
  };

  const handleSave = () => {
    localStorage.setItem("timeScrape", String(time));
  };
  return { handleChangeTime, time, handleSave };
};
