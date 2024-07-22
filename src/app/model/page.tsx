"use client";
import React, { useState } from "react";
import { InboxOutlined, LoadingOutlined } from "@ant-design/icons";
import { message, notification, Upload, UploadFile, UploadProps } from "antd";
import { supabase } from "@/lib/supabase";
import axios from "axios";
import { useFormHandler } from "../hook/useSubmitAction";

const SubmitMessage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("");
  const [status, setStatus] = useState("");
  const [api, context] = notification.useNotification();
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [loadingAudioIndex, setLoadingAudioIndex] = useState<number | null>(
    null
  );
  const [fileUrl, setFileUrl] = useState<any>();

  const { uploadFileToCloudinary } = useFormHandler();
  const { Dragger } = Upload;

  const props: UploadProps = {
    name: "file",
    multiple: true,
    onChange(info) {
      setFileUrl(info?.file);
    },
  };

  const handleSend = async () => {
    if (!model.trim()) {
      setResponseMessage("Model Name cannot be empty");
      return;
    }

    if (!fileUrl) {
      setResponseMessage("video idle harus di upload");
      return;
    }

    try {
      setLoading(true);
      setStatus("Sending message...");

      setStatus("Processing file...");

      console.log(fileUrl);
      const formData = new FormData();
      formData.append("file", fileUrl);
      formData.append("upload_preset", "rfc3rxgd");

      const fileUrlString = await uploadFileToCloudinary(fileUrl);
      await supabase.from("action").insert({
        model_name: model,
        video_url: fileUrlString,
        action_name: "idle",
      });
      await supabase.from("model").insert({
        model_name: model,
        video_url: fileUrlString,
        action_name: "idle",
      });
      setResponseMessage("Model successfully created and processed");
      setModel("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      setResponseMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <>
      {context}
      <div className="h-[100dvh] flex flex-col lg:flex-row items-center justify-center text-black bg-gray-200 p-4 space-y-2">
        <div className="lg:w-[70%] w-auto text-center">
          <div>
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from
                uploading company data or other banned files.
              </p>
            </Dragger>
          </div>
          <h1 className="text-2xl font-bold mb-4">Create new Model</h1>
          <div className="flex justify-center items-center">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Model Name"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-violet-500 hover:bg-violet-900 transition duration-300 text-white p-2 rounded"
                onClick={handleSend}
              >
                {loading ? (
                  <span>
                    <LoadingOutlined style={{ marginRight: 8 }} />
                    {status}
                  </span>
                ) : (
                  "Create Model"
                )}
              </button>
              {responseMessage && (
                <p
                  className={`mt-4 text-center ${
                    responseMessage.startsWith("Error")
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {responseMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitMessage;
