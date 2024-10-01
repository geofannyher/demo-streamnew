"use client";
import { TDataChat, Tgift, TNewJoin, TRoomView } from "@/shared/Type/TestType";
import { ApifyClient } from "apify-client";
import emojiRegex from "emoji-regex";
import { useEffect, useRef, useState } from "react";
import { getDataAction, submitToApi } from "../services/action/action.service";
import { submitQueue } from "../services/queue/queue.service";
import { useDataStore } from "../store/useSaveData";

export const useFetchDataComment = (user: string) => {
  const [isScraping, setIsScraping] = useState(false);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const [dataAction, setdataAction] = useState<any[]>([]);
  const [status, setstatus] = useState({
    load: false,
    msg: "",
  });
  const { setDataToSubmit } = useDataStore();

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
  const api = "apify_api_aNO2W9c1blPboc0CHkBHzqDSMFBZ124vRLxX";
  const client = new ApifyClient({ token: api });

  const lastActionRef = useRef<any[]>([]);

  const getDataComment = async ({ model }: { model: string }) => {
    const time = localStorage.getItem("timeScrape");

    if (!isScraping || hasFetched.current) return;
    hasFetched.current = true;

    try {
      setstatus({ msg: "Sedang Scrape data...", load: true });
      const run = await client.actor("iBGygcuAxeHUkYsq9").call(input, {
        timeout: time ? Number(time) : 20,
        memory: 128,
        build: "latest",
      });

      if (!isScraping) return;

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      // const relevantItems = items.slice(1);
      const relevantItems = items;
      console.log("hasil scrape", items);
      setstatus({ ...status, msg: "Proses data..." });

      if (!isScraping) return;

      // let dataToSubmit;

      // if (relevantItems.length >= 1) {
      //   const formattedData = processRelevantItems({ items: relevantItems });

      //   dataToSubmit = {
      //     ...formattedData,
      //     lastAction: lastActionRef.current || [],
      //   };
      // } else {
      //   dataToSubmit = {
      //     chat: [],
      //     gift: [],
      //     newMember: [],
      //     roomUser: {},
      //     lastAction: lastActionRef.current || [],
      //   };
      // }
      const formattedData = processRelevantItems({ items: relevantItems });
      setDataToSubmit({
        ...formattedData,
        lastAction: lastActionRef.current || [],
      });
      // dataToSubmit = {
      //   ...formattedData,
      //   lastAction: lastActionRef.current || [],
      // };
      // Jika lastActionRef.current mencapai 10 item, kosongkan
      if (
        Array.isArray(lastActionRef.current) &&
        lastActionRef.current.length >= 9
      ) {
        lastActionRef.current = []; // Kosongkan lastAction setelah mencapai 10 item
        console.log("lastActionRef has been reset to an empty array.");
      }
      // console.log("data yang akan di submit", dataToSubmit);
      console.log(
        "data yang akan di submit",
        useDataStore.getState().dataToSubmit
      );
      // const res = await submitToApi(dataToSubmit);
      const res = await submitToApi(useDataStore.getState().dataToSubmit);

      await handleApiResponse(res, status, setstatus, model);

      const responseJson = JSON.parse(res);

      lastActionRef.current = [
        ...(Array.isArray(lastActionRef.current) ? lastActionRef.current : []),
        ...responseJson,
      ];

      // setdataAction((prevDataAction) => [
      //   ...prevDataAction,
      //   <>
      //     {JSON.stringify(dataToSubmit)}
      //     <br />
      //     <>----------------response baru----------------</>
      //     <br />
      //     {res}
      //     <br />
      //     {relevantItems.length > 1 ? "Data with comments" : "No comments"}
      //   </>,
      // ]);
      setdataAction((prevDataAction) => [
        ...prevDataAction,
        <>
          {JSON.stringify(useDataStore.getState().dataToSubmit)}
          <br />
          <>----------------response baru----------------</>
          <br />
          {res}
          <br />
          {relevantItems.length > 1 ? "Data with comments" : "No comments"}
        </>,
      ]);
    } catch (error) {
      console.error(error, "error");
    } finally {
      hasFetched.current = false;
    }
  };

  // submit to queueu
  const handleApiResponse = async (
    res: string,
    status: any,
    setstatus: any,
    model: string
  ) => {
    if (!isScraping || res === "error") {
      setstatus({ load: false, msg: "Ada problem di API" });
      return;
    }
    // clear string json
    const arrayData = JSON.parse(res);

    for (const item of arrayData) {
      // Hentikan proses jika isScraping false
      if (!isScraping) return;

      // clear teks dari emoji
      const codeOnly = !item?.content ? "ready" : removeEmoji(item?.content);

      const res = await getDataAction({ code: item?.code, model: model });
      try {
        setstatus({ ...status, msg: "Send to Queue..." });
        await submitQueue({
          action_name: res?.data[0]?.action_name,
          text: codeOnly,
          queue_num: res?.data[0]?.code,
          time_start: res?.data[0]?.time_start,
          time_end: res?.data[0]?.time_end,
          id_audio: res?.data[0]?.id_audio,
        });
      } catch (error) {
        console.error(`Failed to submit item with code ${item.code}:`, error);
      }
    }
  };

  const tempItems: any[] = []; // Temporary storage for processed items

  const processRelevantItems = ({ items }: { items: any[] }) => {
    const chatData: TDataChat[] = [];
    const newJoinData: TNewJoin[] = [];
    const giftData: Tgift[] = [];

    let roomUserData: TRoomView = {};

    // Proses item berdasarkan eventType
    items.forEach((item: any) => {
      // Check if item already exists in tempItems (skip it if it does)
      const isDuplicate = tempItems.some(
        (tempItem) =>
          tempItem.eventType === item.eventType &&
          tempItem.nickname === item.nickname &&
          tempItem.comment === item.comment && // For chat event
          tempItem.giftName === item.giftName // For gift event
      );

      if (!isDuplicate) {
        switch (item.eventType) {
          case "chat":
            if (chatData.length < 10 && item.nickname && item.comment) {
              chatData.push({ username: item.nickname, comment: item.comment });
            }
            break;
          case "gift":
            if (giftData.length < 10 && item.nickname && item.giftName) {
              giftData.push({
                username: item.nickname,
                giftName: item.giftName,
              });
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

        // Add the current item to tempItems to track it for future scrapes
        tempItems.push(item);
      }
    });

    const formattedData = {
      chat: chatData,
      gift: giftData,
      newMember: newJoinData,
      roomUser: roomUserData,
    };

    return formattedData;
  };

  function removeEmoji(str: string) {
    const regex = emojiRegex();
    return str.replace(regex, "");
  }

  useEffect(() => {
    const modelIdle = localStorage.getItem("modelstream");
    const time = localStorage.getItem("timeScrape");

    if (isScraping && modelIdle) {
      // Jalankan getDataComment langsung untuk pertama kali
      getDataComment({ model: modelIdle });
      intervalId.current = setInterval(() => {
        getDataComment({ model: modelIdle });
      }, Number(time));
    } else if (intervalId.current) {
      setstatus({ load: false, msg: "" });
      clearInterval(intervalId.current);
      intervalId.current = null;
    }

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [isScraping]);

  return { dataAction, status, setIsScraping, isScraping };
};
