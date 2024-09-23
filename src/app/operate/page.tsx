"use client";

import React, { useEffect, useState } from "react";
import { useQueueData } from "../hook/useQueueData";
import { Button, Form, Input, message, Select, Switch } from "antd";
import { useListModel } from "../hook/useListModel";
import { supabase } from "@/lib/supabase";
import { getDataAction } from "../services/action/action.service";
import { useFetchDataComment } from "../hook/useFetchComment";
import { useChangeTime } from "../hook/useChangeTime";
import { LoadingOutlined } from "@ant-design/icons";
import { deleteQueue, submitQueue } from "../services/queue/queue.service";
import { LuTrash2 } from "react-icons/lu";
import { IQueue } from "@/shared/Type/TestType";
import { getReset } from "../services/reset/reset.service";

const Page = () => {
  const { data } = useListModel();
  const [queueName, setqueueName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [submituser, setSubmituser] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState<string>("");
  const [queueTable, setQueueTable] = useState<IQueue[]>([]);
  const { dataQueue, loading: dataLoading } = useQueueData({
    model_name: model,
  });
  const { handleChangeTime, time, handleSave } = useChangeTime();
  const { status, dataAction, setIsScraping, isScraping } =
    useFetchDataComment(submituser);

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
      const res = await getDataAction({ code: match[0], model });
      if (res?.data && res?.data.length !== 0) {
        if (checkMessage > 2) {
          try {
            const newMessage = queueName.replace(regex, "").trim();
            await submitQueue({
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
          const res = await getDataAction({ code: match[0], model });
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

  const handleSubmitUser = () => {
    setSubmituser(username);
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
    <div className="bg-zinc-50 h-[100dvh] p-5">
      <div className="container mx-auto">
        {/* select section  */}
        <div className="grid grid-cols-12 gap-2">
          <div className="md:col-span-2 col-span-12 lg:col-span-2">
            <h1 className="py-2">
              Pilih Model untuk tambah action
              <i className="text-sm text-red-500">*</i>
            </h1>
            <Item name="model" className="w-full px-2">
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
          <div className="col-span-12 lg:col-span-2 md:col-span-2">
            <h1 className="py-2">
              Pilih Model Streaming <i className="text-sm text-red-500">*</i>
            </h1>
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
          <div className="col-span-12 items-center lg:col-span-5 md:col-span-5">
            <h1 className="py-2">
              Custom Waktu Scrape <i className="text-xs">(Optional)</i>
            </h1>
            <div className="flex w-full">
              <Item name="model" className="w-full px-2">
                <Input
                  size="large"
                  placeholder="masukkan waktu 'ex 10' default 20s"
                  value={time}
                  type="number"
                  onChange={(e) => handleChangeTime({ time: e.target.value })}
                />
              </Item>
              <Button size="large" type="primary" onClick={handleSave}>
                save
              </Button>
              <div className="pl-5 w-full">
                <h1 className="font-semibold text-sm">
                  Time Scrape {time} /second
                </h1>
                <Switch onChange={() => setIsScraping(!isScraping)} />
              </div>
            </div>
          </div>
          <div className="col-span-12  lg:col-span-2 md:col-span-2">
            <h1 className="py-2">
              Masukkan id tiktok <i className="text-sm text-red-500">*</i>
            </h1>
            <div className="flex py-2">
              <Item name="model" className="w-full px-2">
                <Input
                  size="large"
                  disabled={submituser.length > 1}
                  placeholder="masukkan id tiktok"
                  type="text"
                  onChange={(e) => setUsername(e?.target?.value)}
                />
              </Item>
              <Button
                size="large"
                onClick={handleSubmitUser}
                disabled={!username || submituser.length > 1}
                type="primary"
              >
                save
              </Button>
            </div>
          </div>
        </div>

        {/* status section  */}
        {status && status.msg && (
          <div className="grid py-2 grid-cols-1">
            <Button type="primary" className="cursor-not-allowed" size="large">
              {status?.msg}
              <LoadingOutlined />
            </Button>
          </div>
        )}

        {/* form section  */}
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-2">
          <div className="md:col-span-3">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <textarea
                  disabled={loading}
                  onChange={(e) => setqueueName(e?.target?.value)}
                  value={queueName}
                  className="w-full md:h-80 lg:h-80 h-full p-2 border rounded"
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
            <div className="overflow-x-auto overflow-y-auto md:h-96 lg:h-96 h-full">
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

          <div className="md:col-span-5 relative">
            {/* queue table  */}
            <div className="overflow-y-auto  lg:max-h-[50vh] h-full md:max-h-[50vh]">
              <div className="relative">
                <table className="text-sm text-left border text-gray-500 w-full">
                  <thead className="text-xs sticky top-0 text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Queue
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Action Name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Option
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueTable.map((item, index) => (
                      <tr className="bg-white" key={index}>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          {item?.action_name}
                        </th>
                        <td className="px-6 py-4">{item?.text}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => deleteQueue({ id: item?.id })}
                            className=" duration-300 hover:bg-purple-800 shadow-lg rounded-md right-0 bg-purple-500 text-white px-4 py-2 "
                          >
                            <LuTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 mt-10 md:grid-cols-1 lg:grid-cols-1 gap-2">
          <h1>Testing area</h1>
          <div className="max-w-sm">
            <button
              className="px-4 text-white  rounded-lg shadow-lg py-2 bg-violet-500 hover:bg-violet-900 duration-300  transition"
              onClick={() => {
                getReset({ id: "duwi", star: "stream_director2" }).then(
                  (res: any) => {
                    if (res?.status === 200) {
                      return message.success("success reset star");
                    } else {
                      return message.error("error reset star");
                    }
                  }
                );
              }}
            >
              Reset star stream_director2
            </button>
          </div>
        </div>
        {/* /test section  */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-2">
          {dataAction.map((data, index) => (
            <>
              <h1 key={index}>{JSON.stringify(data)}</h1>
              <br />
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
