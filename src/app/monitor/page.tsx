"use client";
import { Button, Form, Input, message } from "antd";
import { useFetchDataComment } from "../hook/useFetchComment";
import { getReset } from "../services/reset/reset.service";
import { useState } from "react";

const MonitorPage = () => {
  const { Item } = Form;

  const [username, setUsername] = useState<string>("");
  const [submituser, setSubmituser] = useState<string>("");
  const { dataAction } = useFetchDataComment(submituser);
  const handleSubmitUser = () => {
    setSubmituser(username);
  };
  return (
    <div className="mx-auto container p-5">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 lg:col-span-6 md:col-span-6">
          <h1 className="py-2 text-sm md:text-base lg:text-base">
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
          <div key={index}>
            <h1>{data}</h1>
            <br />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonitorPage;
