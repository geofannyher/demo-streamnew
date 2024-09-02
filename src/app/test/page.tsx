"use client";
import { ApifyClient } from "apify-client";
import axios from "axios";
import React, { useEffect, useRef } from "react";

const Page = () => {
  const hasFetched = useRef(false);
  const api = "apify_api_f9OdukfCNCgWuLfPJbBP9QqcLztmAf2dRjPC";
  const client = new ApifyClient({
    token: api,
  });

  const input = {
    usernames: ["im.rahmay"],
    event_chat: true,
    event_gift: false,
    event_member: false,
    event_follow: false,
    event_share: false,
    event_like: false,
    event_subscribe: false,
    event_roomUser: false,
    event_emote: false,
    event_envelope: false,
    event_questionNew: false,
    event_liveIntro: false,
    event_status: true,
    event_linkMicBattle: false,
    event_linkMicArmies: false,
    end_allStreamsEnds: true,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"],
    },
  };

  // const submitToApi = async () => {
  //   try {
  //     const res = await axios.post("https://chatx-api.hadiwijaya.co/chat", {
  //       comments: dataComment,
  //     });
  //     console.log("Response from API:", res.data);
  //   } catch (error) {
  //     console.error("Error submitting data to API:", error);
  //   }
  // };

  const getDataComment = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      console.log("Starting actor...");
      const run = await client.actor("iBGygcuAxeHUkYsq9").call(input, {
        timeout: 20,
        memory: 128,
        build: "latest",
      });

      console.log("Fetching results from dataset...");
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      const relevantItems = items.slice(1);
      if (relevantItems.length > 2) {
        const dataComment = relevantItems.map((item) => ({
          username: item.nickname,
          comment: item.comment,
        }));

        // Kirim data yang sudah diformat ke API lain
        // await submitToApi();

        console.log(dataComment);
      }
    } catch (error) {
      console.log(error, "error");
    } finally {
      hasFetched.current = false;
    }
  };
  const getDataJoin = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      console.log("Starting actor...");
      const run = await client.actor("iBGygcuAxeHUkYsq9").call(input, {
        timeout: 20,
        memory: 128,
        build: "latest",
      });

      console.log("Fetching results from dataset...");
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      const relevantItems = items.slice(1);
      if (relevantItems.length > 2) {
        const dataComment = relevantItems.map((item) => ({
          username: item.nickname,
          comment: item.comment,
        }));

        // Kirim data yang sudah diformat ke API lain
        // await submitToApi();

        console.log(dataComment);
      }
    } catch (error) {
      console.log(error, "error");
    } finally {
      hasFetched.current = false;
    }
  };
  useEffect(() => {
    getDataComment();
  }, []);

  return (
    <div className="container mx-auto">
      <div className="p-10">
        <h1>Ini Hasil </h1>
        <button
          onClick={getDataComment}
          className="px-4 py-2 hover:cursor-pointer rounded-md bg-violet-500 text-white font-semibold text-sm"
        >
          Fetch
        </button>
      </div>
    </div>
  );
};

export default Page;
