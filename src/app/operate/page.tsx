"use client";

import React, { useState } from "react";
import { useQueueData } from "../hook/useQueueData";
import { useFormHandler } from "../hook/useSubmitAction";
import { Form, message, Select, Upload, UploadFile, UploadProps } from "antd";
import { InboxOutlined, LoadingOutlined } from "@ant-design/icons";
import { useListModel } from "../hook/useListModel";
import axios from "axios";
import { supabase } from "@/lib/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { socket } from "@/lib/socket";
const Page = () => {
  const {
    handleSubmit,
    loading: formLoading,
    uploadFileToCloudinary,
  } = useFormHandler();
  const { data } = useListModel();
  const [queueName, setqueueName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<UploadFile | null>(null);
  const [model, setModel] = useState<string>("");
  const { Dragger } = Upload;
  const { dataQueue, loading: dataLoading } = useQueueData({
    model_name: model,
  });

  const handleSendQueue = async () => {
    if (!model) {
      return message.error("pilih model terlebih dahulu");
    }
    setLoading(true);
    const codeExists = dataQueue?.some((item) => {
      const items = item?.code.toString();
      return queueName.includes(items);
    });

    if (codeExists) {
      const regex = /#(\d+)#/;
      const match: any = queueName.match(regex);
      const res: PostgrestSingleResponse<any> = await supabase
        .from("action")
        .select("code,model_name,video_url")
        .eq("code", match[1]);

      await handleSend({
        video_url: res?.data[0]?.video_url,
        text: queueName,
      });
    } else {
      setLoading(false);
      return message.error("masukkan kode");
    }
  };

  const handleCheck = async (
    e: React.FormEvent<HTMLFormElement>,
    fileUrl: UploadFile | null
  ) => {
    e.preventDefault();
    if (!model) {
      return message.error("pilih model terlebih dahulu");
    }

    if (!fileUrl) {
      return message.error("video tidak boleh kosong");
    }

    if (fileUrl) {
      const fileUrlString = await uploadFileToCloudinary(fileUrl);
      await handleSubmit({
        e,
        video_url: fileUrlString,
        model_name: model,
      });
    }
    return null;
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    onChange(info) {
      setFileUrl(info?.file);
    },
  };
  const { Item } = Form;

  const handleChange = (value: string) => {
    setModel(value);
  };

  const handleChangeStream = (value: string) => {
    localStorage.setItem("modelstream", value);
  };

  const formattedData = data.map((item) => ({
    value: item.model_name,
    label: item.model_name,
  }));

  const handleSend = async ({
    video_url,
    text,
  }: {
    video_url: string;
    text: string;
  }) => {
    if (!model) {
      return message.error("pilih model terlebih dahulu");
    }
    try {
      const newMessage = text.replace(/#\d+#/, "").trim();
      const result = await axios.post(
        "/api/audio",
        { text: newMessage },
        { responseType: "arraybuffer" }
      );

      if (result.status !== 200) {
        throw new Error("Failed to generate audio");
      }

      const mainAudioBlob = new Blob([result.data], {
        type: "audio/mpeg",
      });
      const formData = new FormData();
      formData.append("file", mainAudioBlob);
      formData.append("upload_preset", "rfc3rxgd");

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dp8ita8x5/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      socket.emit("send_message", {
        audio_url: res?.data?.secure_url,
        video_url,
      });
      setLoading(false);
      setqueueName("");
    } catch (error: any) {
      setLoading(false);

      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-zinc-50 p-5">
      <div className="container mx-auto ">
        {/* select section  */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <h1 className="py-2">Pilih Model untuk tambah action</h1>
            <Item name="model" className="w-full  px-2">
              {data && (
                <Select
                  size="large"
                  placeholder="Select Model"
                  onChange={handleChange}
                  options={formattedData}
                />
              )}
            </Item>
          </div>
          <div className="col-span-6">
            <h1 className="py-2">Pilih Model Streaming</h1>
            <Item name="model" className="w-full  px-2">
              {data && (
                <Select
                  size="large"
                  placeholder="Select Model"
                  onChange={handleChangeStream}
                  options={formattedData}
                />
              )}
            </Item>
          </div>
        </div>

        {/* form section  */}
        <div className="grid grid-cols-1 space-y-16  md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
            </Dragger>
          </div>
          <div className="md:col-span-1">
            <form
              onSubmit={(e) => handleCheck(e, fileUrl)}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="mb-4">
                <label htmlFor="name">Action Name</label>
                <input
                  disabled={formLoading}
                  type="text"
                  name="action"
                  className="w-full p-2 border rounded"
                  placeholder="action name..."
                />
              </div>
              <div className="mb-4">
                <label htmlFor="name">Time Start</label>
                <input
                  disabled={formLoading}
                  type="number"
                  className="w-full p-2 border rounded no-spinner"
                  placeholder="time start..."
                />
              </div>
              <div className="mb-4">
                <label htmlFor="name">Time End</label>
                <input
                  disabled={formLoading}
                  type="number"
                  className="w-full p-2 border rounded no-spinner"
                  placeholder="time end..."
                />
              </div>
              <button
                disabled={formLoading}
                className={`w-full hover:bg-violet-900 transition duration-300 text-white p-2 rounded ${
                  formLoading ? "bg-gray-400" : "bg-violet-500"
                }`}
              >
                {formLoading ? <LoadingOutlined /> : "Create"}
              </button>
            </form>
          </div>
          <div className="md:col-span-1">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right border text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Code
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataLoading ? (
                    <tr className="bg-white">
                      <th
                        colSpan={2}
                        scope="row"
                        className="text-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                      >
                        Loading
                      </th>
                    </tr>
                  ) : dataQueue.length === 0 ? (
                    <tr className="bg-white">
                      <th
                        colSpan={2}
                        scope="row"
                        className="px-6 py-4 font-medium text-center text-violet-500 whitespace-nowrap"
                      >
                        Tidak ada data
                      </th>
                    </tr>
                  ) : (
                    dataQueue.map((item, index) => (
                      <tr key={index} className="bg-white">
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          {item.action_name}
                        </th>
                        <td className="px-6 py-4">{item.code}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="md:col-span-1">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <input
                  type="text"
                  disabled={loading}
                  onChange={(e) => setqueueName(e?.target?.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Please Input..."
                />
              </div>
              <button
                disabled={loading}
                onClick={handleSendQueue}
                className={`${
                  loading
                    ? "bg-gray-800 cursor-not-allowed"
                    : "bg-violet-500 hover:bg-violet-900"
                } w-full  transition duration-300 text-white p-2 rounded`}
              >
                {loading ? <LoadingOutlined /> : "Send to Queue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
