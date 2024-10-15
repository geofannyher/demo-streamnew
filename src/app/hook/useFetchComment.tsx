"use client";
import { TDataChat, Tgift, TNewJoin, TRoomView } from "@/shared/Type/TestType";
import { ApifyClient } from "apify-client";
import { useEffect, useRef, useState } from "react";
import { getDataAction, submitToApi } from "../services/action/action.service";
import { getDataService } from "../services/data/data.services";
import { getQueueTable, submitQueue } from "../services/queue/queue.service";
import { useDataStore } from "../store/useSaveData";
import { removeEmoji } from "@/utils/removeEmoji";
interface Isettings {
  key: string;
  switch: boolean;
}
export const useFetchDataComment = (user: string) => {
  const [isScraping, setIsScraping] = useState(false);
  const [settings, setSettings] = useState({} as Isettings);
  const [status, setstatus] = useState({
    load: false,
    msg: "",
  });
  const [dataAction, setdataAction] = useState<any[]>([]);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const hasFetched = useRef(false);
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
  const api = settings?.key;
  const client = new ApifyClient({ token: api });

  const lastActionRef = useRef<any[]>([]);
  // Temporary storage for processed items
  const tempItems: any[] = [];

  //scrape data comment
  const getDataComment = async ({ model }: { model: string }) => {
    if (!isScraping || hasFetched.current) return;
    hasFetched.current = true;
    const time = localStorage.getItem("timeScrape");
    try {
      setstatus({ msg: "Sedang Scrape data...", load: true });
      const run = await client.actor("iBGygcuAxeHUkYsq9").call(input, {
        timeout: time ? parseInt(time) : 20,
        memory: 512,
        build: "latest",
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      // const relevantItems = items.slice(1);
      const relevantItems = items;
      console.log("hasil scrape", items);
      setstatus({ load: true, msg: "Proses data..." });
      const formattedData = processRelevantItems({ items: relevantItems });

      setDataToSubmit({
        ...formattedData,
        lastAction: lastActionRef.current || [],
      });

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

      await handleApiResponse(res, setstatus, model);

      const responseJson = JSON.parse(res);

      lastActionRef.current = [
        ...(Array.isArray(lastActionRef.current) ? lastActionRef.current : []),
        ...responseJson,
      ];

      setdataAction((prevDataAction) => [
        ...prevDataAction,
        <>
          {JSON.stringify(useDataStore.getState().dataToSubmit)}
          <br />
          <>----------------response baru----------------</>
          <br />
          {res}
          <br />
          {relevantItems.length > 1 ? (
            <h1 className="font-bold">"Data dengan ada comments"</h1>
          ) : (
            <h1 className="font-bold">"No comments"</h1>
          )}
          <br />
        </>,
      ]);
    } catch (error) {
      console.error(error, "error");
    } finally {
      hasFetched.current = false;
    }
  };

  // process data comment
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

  // submit to queueu
  const handleApiResponse = async (
    res: string,
    setstatus: any,
    model: string
  ) => {
    if (!isScraping) return;
    if (res === "error") {
      setstatus({ load: false, msg: "Ada problem di API" });
      return;
    }
    // clear string json
    const arrayData = JSON.parse(res);

    for (const item of arrayData) {
      // Hentikan proses jika isScraping false
      if (!isScraping) break;

      // clear teks dari emoji
      const codeOnly = !item?.content ? "ready" : removeEmoji(item?.content);

      const res = await getDataAction({ code: item?.code, model });
      const checkAll = await getQueueTable();

      let newVariable;
      if (checkAll?.data) {
        // Mengurutkan berdasarkan kolom position (dari yang tertinggi ke terendah)
        const sortedData = checkAll?.data.sort(
          (a: any, b: any) => b.position - a.position
        );

        // Mengambil item dengan posisi tertinggi
        const lastItem: any = sortedData[0];

        if (lastItem?.position == null) {
          newVariable = 1;
        } else {
          // Menyimpan lastItem ke dalam variabel baru
          newVariable = lastItem?.position;
        }
      }
      try {
        setstatus({ load: true, msg: "Send to Queue..." });
        await submitQueue({
          action_name: res?.data[0]?.action_name,
          text: codeOnly,
          queue_num: res?.data[0]?.code,
          time_start: res?.data[0]?.time_start,
          time_end: res?.data[0]?.time_end,
          id_audio: res?.data[0]?.id_audio,
          position: newVariable + 1,
        });
      } catch (error) {
        console.error(`Failed to submit item with code ${item.code}:`, error);
      }
    }
    setstatus({ msg: "", load: false });
  };

  const fetchData = async () => {
    const res = await getDataService();
    setSettings(res);
  };

  useEffect(() => {
    const modelIdle = localStorage.getItem("modelstream");
    const time = localStorage.getItem("timeScrape");

    if (isScraping && modelIdle) {
      // Jalankan getDataComment langsung untuk pertama kali
      getDataComment({ model: modelIdle });
      intervalId.current = setInterval(
        () => {
          getDataComment({ model: modelIdle });
        },
        Number(time) ? Number(time) + 5 : 25
      );
    } else if (intervalId.current) {
      setstatus({ load: false, msg: "" });
      clearInterval(intervalId.current);
      intervalId.current = null;
    }

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [isScraping]);

  useEffect(() => {
    fetchData();
  }, []);

  return { status, setIsScraping, getDataComment, isScraping, dataAction };
};
