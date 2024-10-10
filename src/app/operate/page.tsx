"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useQueueData } from "../hook/useQueueData";
import { Button, Form, Input, message, Select, Switch } from "antd";
import { useListModel } from "../hook/useListModel";
import { supabase } from "@/lib/supabase";
import { getDataAction } from "../services/action/action.service";
import { useFetchDataComment } from "../hook/useFetchComment";
import { useChangeTime } from "../hook/useChangeTime";
import { LoadingOutlined } from "@ant-design/icons";
import {
  deleteQueue,
  getQueueTable,
  submitQueue,
} from "../services/queue/queue.service";
import { LuTrash2 } from "react-icons/lu";
import { IQueue } from "@/shared/Type/TestType";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { MdDragIndicator } from "react-icons/md";
import { DropResult } from "react-beautiful-dnd";
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
  const { status, setIsScraping, isScraping } = useFetchDataComment(submituser);

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
      const match: RegExpMatchArray | null = queueName.match(regex);
      if (!match) return message.error("Regex error");
      const res = await getDataAction({ code: match[0], model });
      const checkAll = await getQueueTable();

      let newVariable;
      if (checkAll?.data) {
        // Mengurutkan berdasarkan kolom position (dari yang tertinggi ke terendah)
        const sortedData = checkAll?.data.sort(
          (a: any, b: any) => b.position - a.position
        );

        console.log(sortedData);
        // Mengambil item dengan posisi tertinggi
        const lastItem: any = sortedData[0];

        if (lastItem?.position == null) {
          newVariable = 1;
        } else {
          // Menyimpan lastItem ke dalam variabel baru
          newVariable = lastItem?.position;
        }
      }
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
              position: newVariable + 1,
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
            position: newVariable + 1,
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
  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    // Cek jika tidak ada destination
    if (!destination) return;

    // Cek jika item tidak berpindah posisi
    if (destination.index === source.index) return;

    // Buat salinan array queueTable
    const updatedQueue = Array.from(queueTable);

    // Hapus item dari posisi awal
    const [movedItem] = updatedQueue.splice(source.index, 1);

    // Masukkan item ke posisi baru
    updatedQueue.splice(destination.index, 0, movedItem);

    // Perbarui state lokal
    setQueueTable(updatedQueue);

    // Update posisi berdasarkan urutan baru
    try {
      const updates = updatedQueue.map((item, index) => ({
        id: item.id, // ID lama
        position: index + 1, // Tentukan posisi baru
      }));

      // Lakukan batch update ke Supabase
      const { error } = await supabase
        .from("queueTable")
        .upsert(updates, { onConflict: "id" }); // Pastikan menghindari duplikasi

      if (error) {
        console.error("Error updating position:", error);
      } else {
        console.log("Positions updated successfully");
      }
    } catch (err) {
      console.error("Error while updating positions:", err);
    }
  };

  return (
    <div className="bg-zinc-50 h-[100dvh] p-5">
      <div className="container mx-auto">
        {/* select section  */}
        <div className="grid grid-cols-12 gap-2">
          <div className="md:col-span-2 col-span-12 lg:col-span-2">
            <h1 className="py-2 text-sm md:text-base lg:text-base">
              Pilih model untuk tambah action{" "}
            </h1>
            <Form>
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
            </Form>
          </div>
          <div className="col-span-12 lg:col-span-3 md:col-span-3">
            <h1 className="py-2 text-sm md:text-base lg:text-base">
              Pilih model streaming{" "}
              <i className="text-xs text-red-500 md:text-xs xl:text-sm 2xl:text-sm">
                *
              </i>
            </h1>
            <Form>
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
            </Form>
          </div>
          <div className="col-span-12 items-center lg:col-span-4 md:col-span-4">
            <h1 className="py-2 text-xs md:text-xs xl:text-sm 2xl:text-sm">
              Custom Waktu Scrape{" "}
              <i className="text-xs md:text-xs xl:text-sm 2xl:text-sm">
                (Optional)
              </i>
            </h1>
            <div className="flex gap-5 md:gap-0 xl:gap-0 2xl:gap-0 w-full">
              <Form>
                <Item name="model" className="w-full px-2">
                  <Input
                    size="large"
                    placeholder="masukkan waktu 'ex 10' default 20s"
                    value={time}
                    type="number"
                    onChange={(e) => handleChangeTime({ time: e.target.value })}
                  />
                </Item>
              </Form>
              <Button size="large" type="primary" onClick={handleSave}>
                save
              </Button>
              <div className="pl-5 w-full">
                <h1 className="font-semibold text-xs md:text-xs xl:text-sm 2xl:text-sm">
                  Time Scrape {time} /second
                </h1>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-3 md:col-span-3">
            <h1 className="py-2 text-sm md:text-base lg:text-base">
              Masukkan id tiktok{" "}
              <i className="text-xs md:text-xs xl:text-sm 2xl:text-sm text-red-500">
                *
              </i>
            </h1>
            <div className="flex w-full py-2">
              <Form>
                <Item name="model" className=" px-2">
                  <Input
                    style={{
                      width: "100%",
                    }}
                    size="large"
                    disabled={submituser.length > 1}
                    placeholder="masukkan id tiktok"
                    type="text"
                    onChange={(e) => setUsername(e?.target?.value)}
                  />
                </Item>
              </Form>
              <Button
                size="large"
                onClick={() => {
                  setIsScraping(!isScraping), setSubmituser(username);
                }}
                type="primary"
              >
                {isScraping ? "Stop" : "Start"}
              </Button>
            </div>
          </div>
        </div>

        {/* status section  */}
        {status && status.msg && (
          <div className="grid py-2 grid-cols-1">
            <Button type="primary" className="cursor-not-allowed" size="large">
              {status?.msg}
              {status?.load && <LoadingOutlined />}
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
                        colSpan={3}
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
                      <th scope="col"></th>
                      <th scope="col" className="pr-6 py-3">
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
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="draggable-1">
                      {(provided) => (
                        <tbody
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {queueTable &&
                            queueTable.map((item, index) => {
                              return (
                                <Draggable
                                  draggableId={item?.id.toString()}
                                  index={index}
                                  key={item?.id}
                                >
                                  {(provided) => (
                                    <tr
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`${
                                        index % 2 == 0
                                          ? "bg-white"
                                          : "bg-gray-50"
                                      }`}
                                    >
                                      <td
                                        scope="row"
                                        className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap"
                                      >
                                        <MdDragIndicator />
                                      </td>
                                      <td
                                        scope="row"
                                        className="pr-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                      >
                                        {item?.action_name}
                                      </td>
                                      <td className="px-6 py-4">
                                        {item?.text}
                                      </td>
                                      <td className="px-6 py-4">
                                        <button
                                          onClick={() =>
                                            deleteQueue({ id: item?.id })
                                          }
                                          className=" duration-300 hover:bg-purple-800 shadow-lg rounded-md right-0 bg-purple-500 text-white px-4 py-2 "
                                        >
                                          <LuTrash2 />
                                        </button>
                                      </td>
                                    </tr>
                                  )}
                                </Draggable>
                              );
                            })}
                          {provided.placeholder}
                        </tbody>
                      )}
                    </Droppable>
                  </DragDropContext>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
