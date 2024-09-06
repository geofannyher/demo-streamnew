"use client";

import React, { useEffect, useState } from "react";
import { useQueueData } from "../hook/useQueueData";
import { Form, message, Select } from "antd";
import { useListModel } from "../hook/useListModel";
import { supabase } from "@/lib/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

const Page = () => {
  const { data } = useListModel();
  const [queueName, setqueueName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState<string>("");
  const [queueTable, setQueueTable] = useState([]);
  const { dataQueue, loading: dataLoading } = useQueueData({
    model_name: model,
  });
  const checkAction = async ({
    model,
    code,
  }: {
    model: string;
    code: string;
  }) => {
    const res: PostgrestSingleResponse<any> = await supabase
      .from("action")
      .select("*")
      .eq("code", code.toLowerCase())
      .eq("model_name", model);
    return res;
  };
  const handleSendQueue = async () => {
    if (!model) {
      return message.error("Pilih model terlebih dahulu");
    }
    setLoading(true);
    const codeExists = dataQueue?.some((item) => {
      const items = item?.code.toString();
      return queueName.includes(items);
    });

    const checkMessage = queueName.length;
    if (codeExists) {
      const regex = /^[^\s]+/;
      const match: any = queueName.match(regex);
      const res = await checkAction({ code: match[0], model });
      if (res?.data && res?.data.length !== 0) {
        if (checkMessage > 2) {
          try {
            const newMessage = queueName.replace(regex, "").trim();
            await supabase.from("queueTable").insert({
              action_name: res?.data[0]?.action_name,
              text: newMessage,
              queue_num: res?.data[0]?.code,
              time_start: res?.data[0]?.time_start,
              time_end: res?.data[0]?.time_end,
              id_audio: res?.data[0]?.id_audio,
            });
            setqueueName("");
            setLoading(false);
          } catch (error) {
            message.error("Terjadi kesalahan saat mengirim data");
          } finally {
            setLoading(false);
          }
        } else {
          const res = await checkAction({ code: match[0], model });
          await supabase.from("queueTable").insert({
            action_name: res?.data[0]?.action_name,
            text: "ready",
            queue_num: res?.data[0]?.code,
            time_start: res?.data[0]?.time_start,
            time_end: res?.data[0]?.time_end,
            id_audio: res?.data[0]?.id_audio,
          });
          setqueueName("");
          setLoading(false);
        }
      } else {
        setLoading(false);
        return message.error("kode tidak ada dalam database");
      }
      setLoading(false);
    } else {
      setLoading(false);
      return message.error("Masukkan kode yang valid");
    }
  };

  const { Item } = Form;

  const handleChange = (value: string) => {
    setModel(value);
  };

  const fetchData = async () => {
    const getQueueTable: any = await supabase.from("queueTable").select("*");
    setQueueTable(getQueueTable?.data);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queueTable",
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    // Clean up subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleChangeStream = (value: string) => {
    localStorage.setItem("modelstream", value);
  };

  const formattedData = data.map((item) => ({
    value: item.model_name,
    label: item.model_name,
  }));
  const sortedDataQueue = [...dataQueue].sort((a, b) => a.id - b.id);
  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-zinc-50 p-5">
      <div className="container mx-auto ">
        {/* select section  */}
        <div className="grid grid-cols-12  gap-4">
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
        <div className="grid grid-cols-1   md:grid-cols-12 lg:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <textarea
                  disabled={loading}
                  onChange={(e) => setqueueName(e?.target?.value)}
                  value={queueName}
                  className="w-full h-80 p-2 border rounded"
                  placeholder="Masukkan kode atau kode + pesan ... seperti 'a Halo' atau 'a' "
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendQueue();
                    }
                  }}
                />
              </div>
              <button
                disabled={loading}
                onClick={handleSendQueue}
                className={`bg-violet-500 hover:bg-violet-900
                } w-full  transition duration-300 text-white p-2 rounded`}
              >
                Send to Queue
              </button>
            </form>
          </div>
          <div className="md:col-span-4">
            <div className="overflow-x-auto overflow-y-auto h-96">
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
                    sortedDataQueue.map((item, index) => (
                      <tr key={index} className="bg-white">
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          {item.action_name}
                        </th>
                        <td className="px-6 py-4">
                          {item.code.toLocaleLowerCase()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:col-span-5">
            {/* queue table  */}
            <div className="overflow-y-auto h-full max-h-[50vh]">
              <table className="text-sm text-left border text-gray-500 w-full">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Queue
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Action Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {queueTable.map((item: any, index) => (
                    <tr className="bg-white" key={index}>
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                      >
                        {item?.action_name}
                      </th>
                      <td className="px-6 py-4">{item?.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
