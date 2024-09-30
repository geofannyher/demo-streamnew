"use client";

import { io } from "socket.io-client";
// local
export const socket = io("http://localhost:5000", {
  // render host
  // export const socket = io("https://stream-socket-k5in.onrender.com", {
  // avatara host
  // export const socket = io("https://stream-socket.hadiwijaya.co", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd",
  },
});
