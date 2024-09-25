"use client";
import { ConfigProvider } from "antd";
import React from "react";

export const ProviderAntd = ({ children }: any) => {
  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#6D28D9",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </>
  );
};
