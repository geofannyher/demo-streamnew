"use client";

import { io } from "socket.io-client";
// local
export const socket = io("http://localhost:3000", {
  // export const socket = io("https//demostream.mainavatara.com", {
  // export const socket = io("https://stream-socket.hadiwijaya.co", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd",
  },
});
