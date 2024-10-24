"use client";
import { supabase } from "@/lib/supabase";
import { EditOutlined, LoadingOutlined } from "@ant-design/icons";
import { Form, message, Modal, Select } from "antd";
import React, { useRef, useState } from "react";
import { useListModel } from "../hook/useListModel";
import { useQueueData } from "../hook/useQueueData";
import { useFormHandler } from "../hook/useSubmitAction";

const SubmitMessage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState("");
  const [editName, setEditName] = useState();
  const [editStart, setEditStart] = useState();
  const [editEnd, setEditEnd] = useState();
  const [dataTab, setDataTab] = useState<any>();
  const [status, setStatus] = useState("");
  const [modelCreate, setModelCreate] = useState("");

  const formRef: any = useRef<HTMLFormElement>(null);
  const { Item } = Form;

  const { data } = useListModel();

  const {
    fetchData,
    dataQueue,
    loading: dataLoading,
  } = useQueueData({
    model_name: model,
  });

  const { uploadFileToCloudinary, handleSubmit } = useFormHandler();

  // submit form create model
  const handleSend = async (e: any) => {
    console.log(e);
    e?.preventDefault();
    if (!modelCreate.trim()) {
      message.error("model Name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const res = await supabase.from("model").insert({
        model_name: e?.target[0]?.value,
        video_url: e?.target[1]?.value,
        url_background: e?.target[1]?.value,
      });
      if (!res) {
        message.error("Error submit ");
      }
      message.success("Model successfully created and processed");
    } catch (error: any) {
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // create action
  const handleCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!model) {
      return message.error("Pilih model terlebih dahulu");
    }

    const res = await handleSubmit({
      e,
      model_name: model,
    });

    if (res == "ok") {
      message.success("Berhasil membuat action");
      await fetchData({ model_name: model });
      formRef.current.reset();
    }
    return null;
  };
  const handleChange = (value: string) => {
    setModel(value);
  };

  const formattedData = data.map((item) => ({
    value: item.model_name,
    label: item.model_name,
  }));

  const handleOk = async () => {
    if (dataTab) {
      const { model_name, id, action_name } = dataTab;
      if (action_name === "idle") {
        await supabase
          .from("model")
          .update({
            action_name: editName == null ? dataTab.action_name : editName,
            time_start: editStart,
            time_end: editEnd,
          })
          .eq("model_name", model_name)
          .eq("action_name", "idle");
      }
      await supabase
        .from("action")
        .update({
          action_name: editName == null ? dataTab.action_name : editName,
          time_start: editStart,
          time_end: editEnd,
        })
        .eq("model_name", model_name)
        .eq("id", id);

      setOpen(false);
      setDataTab(null);
      location.reload();
    }
  };
  return (
    <>
      <div className="grid mx-auto container grid-cols-3 mt-20 p-10 gap-2">
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Create new Model</h1>
            <form onSubmit={handleSend}>
              <div className="mb-4">
                <label htmlFor="name">Model</label>
                <input
                  type="text"
                  disabled={loading}
                  className="w-full p-2 border rounded"
                  placeholder="Model Name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="name">Url video</label>
                <input
                  type="text"
                  disabled={loading}
                  className="w-full p-2 border rounded"
                  placeholder="Url Video"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="name">Url Background</label>
                <input
                  type="text"
                  disabled={loading}
                  className="w-full p-2 border rounded"
                  placeholder="Url Background"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-500 hover:bg-violet-900 transition duration-300 text-white p-2 rounded"
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
            </form>
          </div>
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Create Action</h1>
            <form
              ref={formRef}
              onSubmit={(e) => handleCheck(e)}
              className="bg-white p-6 "
            >
              <div className="mb-4">
                <label htmlFor="name">Action Name</label>
                <input
                  type="text"
                  name="action"
                  className="w-full p-2 border rounded"
                  placeholder="action name..."
                />
              </div>
              <div className="mb-4">
                <label htmlFor="name">Time Start</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded no-spinner"
                  placeholder="time start..."
                />
              </div>
              <div className="mb-4">
                <label htmlFor="name">Time End</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded no-spinner"
                  placeholder="time end..."
                />
              </div>
              <button
                className={`w-full hover:bg-violet-900 transition duration-300 text-white p-2 rounded bg-violet-500`}
              >
                Create Action
              </button>
            </form>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2  lg:col-span-2">
          <div className="overflow-x-auto">
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
            <table className="w-full  text-sm text-left rtl:text-right border text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Time Start
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Time End
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Option
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
                      colSpan={5}
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
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                      >
                        {item.time_start ? item.time_start : "belum di set"}
                      </th>
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                      >
                        {item.time_end ? item.time_end : "belum di set"}
                      </th>
                      <th className="px-6 py-4 font-medium text-gray-900">
                        {item.code}
                      </th>
                      <th className="px-6 py-4">
                        <div className="flex  font-medium text-gray-900 items-center">
                          <button
                            className="hover:text-blue-300 rounded-full"
                            onClick={() => {
                              setOpen(true), setDataTab(item);
                            }}
                          >
                            <EditOutlined />
                          </button>
                        </div>
                      </th>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {open && (
        <Modal
          footer={false}
          title={`Edit Action ${dataTab?.action_name}`}
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <div className="bg-white p-6 ">
            <div className="mb-4">
              <label htmlFor="name">Action Name</label>
              <input
                type="text"
                name="action"
                onChange={(e: any) => setEditName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="action name..."
              />
            </div>
            <div className="mb-4">
              <label htmlFor="name">Time Start</label>
              <input
                type="number"
                onChange={(e: any) => setEditStart(e.target.value)}
                className="w-full p-2 border rounded no-spinner"
                placeholder="time start..."
              />
            </div>
            <div className="mb-4">
              <label htmlFor="name">Time End</label>
              <input
                type="number"
                onChange={(e: any) => setEditEnd(e.target.value)}
                className="w-full p-2 border rounded no-spinner"
                placeholder="time end..."
              />
            </div>
            <button
              onClick={handleOk}
              className={`w-full hover:bg-violet-900 transition duration-300 text-white p-2 rounded bg-violet-500`}
            >
              Edit
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default SubmitMessage;
