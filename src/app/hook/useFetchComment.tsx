"use client";
import { useEffect, useRef, useState } from "react";
import { ApifyClient } from "apify-client";
import { TDataChat, Tgift, TNewJoin, TRoomView } from "@/shared/Type/TestType";
import { submitToApi } from "../services/action/action.service";

export const useFetchDataComment = () => {
  const [dataAction, setdataAction] = useState("");
  const [status, setstatus] = useState({
    load: false,
    msg: "",
  });
  const input = {
    usernames: ["MAJU GAMING"],
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
    event_status: true,
    event_linkMicBattle: false,
    event_linkMicArmies: false,
    end_allStreamsEnds: true,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"],
    },
  };
  const hasFetched = useRef(false);
  const api = "apify_api_zEDY3xQFyKeJcT8vG5lhg8TQHUjvA64t7O5H";
  const client = new ApifyClient({ token: api });

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

      if (relevantItems.length > 2) {
        const chatData: TDataChat[] = [];
        const newJoinData: TNewJoin[] = [];
        const giftData: Tgift[] = [];
        let roomUserData: TRoomView = {};

        relevantItems.forEach((item: any) => {
          if (item.eventType === "chat" && chatData.length < 10) {
            if (item.nickname && item.comment) {
              chatData.push({
                username: item.nickname,
                comment: item.comment,
              });
            }
          } else if (item.eventType === "gift" && giftData.length < 10) {
            if (item.nickname && item.giftName) {
              giftData.push({
                username: item.nickname,
                giftName: item.giftName,
              });
            }
          } else if (item.eventType === "member" && newJoinData.length < 10) {
            if (item.nickname) {
              newJoinData.push({
                username: item.nickname,
              });
            }
          } else if (item.eventType === "roomUser") {
            roomUserData = {
              viewer: item.viewerCount || roomUserData.viewer,
            };
          }
        });

        const formattedData = {
          chat: chatData,
          gift: giftData,
          newMember: newJoinData,
          roomUser: roomUserData,
        };
        setstatus({ ...status, msg: "AI generate data..." });
        const res = await submitToApi(JSON.stringify(formattedData));

        if (res === "error") {
          setstatus({ load: false, msg: "ada problem di api" });
        }
        setdataAction(res);
        // const formatRes = JSON.parse(res);
        // console.log(formatRes);
      }
    } catch (error) {
      console.error(error, "error");
    } finally {
      hasFetched.current = false;
    }
  };
  useEffect(() => {
    const intervalId = setInterval(() => {
      getDataComment();
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  return { dataAction, status };
};
