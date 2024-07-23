"use client";

import { io } from "socket.io-client";

export const socket = io("https://stream-socket-k5in.onrender.com/", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd",
  },
});
