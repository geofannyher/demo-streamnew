"use client";
import { useEffect, useRef, useState } from "react";
import { ApifyClient } from "apify-client";
import { TDataChat, Tgift, TNewJoin, TRoomView } from "@/shared/Type/TestType";
import { getDataAction, submitToApi } from "../services/action/action.service";
import { submitQueue } from "../services/queue/queue.service";

export const useFetchDataComment = (user: string) => {
  const [isScraping, setIsScraping] = useState(false);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const [dataAction, setdataAction] = useState<any[]>([]);
  const [status, setstatus] = useState({
    load: false,
    msg: "",
  });

  const input = {
    usernames: [user],
    event_chat: true, //comment live
    event_gift: true, //gift live
    event_member: true, //member join live
    event_follow: false,
    event_share: false,
    event_like: false,
    event_subscribe: false,
    event_roomUser: true, //total view live
    event_emote: false,
    event_envelope: false,
    event_questionNew: false,
    event_liveIntro: false,
    event_status: false,
    event_linkMicBattle: false,
    event_linkMicArmies: false,
    end_allStreamsEnds: true,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"],
    },
  };
  const hasFetched = useRef(false);
  const api = "apify_api_D1r0fSK2rzkhKitimCUPb0weIsVKMH1B9ThQ";
  const client = new ApifyClient({ token: api });
  console.log(user);

  const getDataComment = async () => {
    const time = localStorage.getItem("timeScrape");
    if (hasFetched.current) return;
    hasFetched.current = true;
    try {
      setstatus({ msg: "Sedang Scrape data...", load: true });
      const run = await client.actor("iBGygcuAxeHUkYsq9").call(input, {
        timeout: time ? Number(time) : 20,
        memory: 128,
        build: "latest",
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      const relevantItems = items.slice(1);
      setstatus({ ...status, msg: "Sedang Proses data..." });
      console.log(items);
      if (relevantItems.length > 2 && relevantItems[2].eventType !== "status") {
        const formattedData = processRelevantItems(relevantItems);
        setstatus({ ...status, msg: "AI generate data..." });

        // const res = await submitToApi(JSON.stringify(formattedData));
        // await handleApiResponse(res, status, setstatus);
        const result = JSON.stringify(formattedData);
        setdataAction((prevDataAction) => [
          ...prevDataAction,
          result + "Data Comment Ada",
        ]);
      } else {
        const emptyData = { chat: [], gift: [], newMember: [], roomUser: {} };
        // const res = await submitToApi(JSON.stringify(emptyData));
        const result = JSON.stringify(emptyData);

        setdataAction((prevDataAction) => [
          ...prevDataAction,
          result + "ini data kalo gaada comment",
        ]);
        // await handleApiResponse(res, status, setstatus);
      }
    } catch (error) {
      console.error(error, "error");
    } finally {
      hasFetched.current = false;
    }
  };
  const handleApiResponse = async (
    res: string,
    status: any,
    setstatus: any
  ) => {
    if (res === "error") {
      setstatus({ load: false, msg: "Ada problem di API" });
      return;
    }

    const cleanResult = res.replace(/^```json\n/, "").replace(/\n```$/, "");
    const arrayData = JSON.parse(cleanResult);

    for (const item of arrayData) {
      const res = await getDataAction({ code: item?.code, model: "kokovin" });
      try {
        setstatus({ ...status, msg: "Send to Queue..." });
        await submitQueue({
          action_name: res?.data[0]?.action_name,
          text: item?.content,
          queue_num: res?.data[0]?.code,
          time_start: res?.data[0]?.time_start,
          time_end: res?.data[0]?.time_end,
          id_audio: res?.data[0]?.id_audio,
        });
      } catch (error) {
        console.error(`Failed to submit item with code ${item.code}:`, error);
      } finally {
        setstatus({ status: false, msg: "Done" });
      }
    }
  };

  const processRelevantItems = (items: any[]) => {
    const chatData: TDataChat[] = [];
    const newJoinData: TNewJoin[] = [];
    const giftData: Tgift[] = [];
    let roomUserData: TRoomView = {};

    items.forEach((item) => {
      switch (item.eventType) {
        case "chat":
          if (chatData.length < 10 && item.nickname && item.comment) {
            chatData.push({ username: item.nickname, comment: item.comment });
          }
          break;
        case "gift":
          if (giftData.length < 10 && item.nickname && item.giftName) {
            giftData.push({ username: item.nickname, giftName: item.giftName });
          }
          break;
        case "member":
          if (newJoinData.length < 10 && item.nickname) {
            newJoinData.push({ username: item.nickname });
          }
          break;
        case "roomUser":
          roomUserData = {
            viewer: item.viewerCount || roomUserData.viewer,
          };
          break;
      }
    });

    return {
      chat: chatData,
      gift: giftData,
      newMember: newJoinData,
      roomUser: roomUserData,
    };
  };
  useEffect(() => {
    if (isScraping) {
      intervalId.current = setInterval(() => {
        getDataComment();
      }, 25000);
    } else if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [isScraping]);

  return { dataAction, status, setIsScraping, isScraping };
};
