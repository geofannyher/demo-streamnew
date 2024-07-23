import { useState } from "react";
import { submitAction } from "../services/action/action.service";
import axios from "axios";

interface ISubmitHookProps {
  e: React.FormEvent<HTMLFormElement>;
  model_name: string;
  video_url?: string | null;
}
export const useFormHandler = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const handleSubmit = async ({
    e,
    model_name,
    video_url,
  }: ISubmitHookProps) => {
    setLoading(true);
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const action = target.elements[0] as HTMLInputElement;
    const timeStart = target.elements[1] as HTMLInputElement;
    const timeEnd = target.elements[2] as HTMLInputElement;
    const res = await submitAction({
      action_name: action?.value,
      time_end: timeEnd?.value,
      time_start: timeStart?.value,
      video_url: video_url ? video_url : null,
      model_name,
    });
    if (res !== "ok") {
      setLoading(false);
      setPopupMessage(res?.message);
    }
    setLoading(false);
    return "ok";
  };

  const uploadFileToCloudinary = async (file: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file?.originFileObj);
    formData.append("upload_preset", "rfc3rxgd");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dp8ita8x5/upload",
        formData
      );
      return response?.data?.secure_url;
    } catch (error: any) {
      console.log(
        "Cloudinary upload failed:",
        error?.response?.data?.error?.message
      );
    }
  };

  return {
    handleSubmit,
    loading,
    popupMessage,
    uploadFileToCloudinary,
  };
};
