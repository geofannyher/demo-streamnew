// "use client";
// import { TDataChat, Tgift, TNewJoin, TRoomView } from "@/shared/Type/TestType";
// import { ApifyClient } from "apify-client";
// import axios from "axios";
// import React, { useEffect, useRef, useState } from "react";

// // Number of viewers: ...
// // Last 10 comments:
// // {username, comment,..}
// // Last 10 new joiner:
// // {user, user, user}
// // Last 10 gifter
// // {user, giftvalue}
// // Last 10 buy
// // {...,...,...}
// // Last actions
// // {...}

// const Page = () => {
//   const hasFetched = useRef(false);
//   const [loading, setLoading] = useState(false);
//   const api = "apify_api_lohc7QCpnj6QMyyu7ohz5VqtoNQEAW3YxOue";
//   const client = new ApifyClient({
//     token: api,
//   });

//   const input = {
//     usernames: ["fikinaki"],
//     event_chat: true, //comment live
//     event_gift: true, //gift live
//     event_member: true, //member join live
//     event_follow: false,
//     event_share: false,
//     event_like: false,
//     event_subscribe: false,
//     event_roomUser: true, //total view live
//     event_emote: false,
//     event_envelope: false,
//     event_questionNew: false,
//     event_liveIntro: false,
//     event_status: true,
//     event_linkMicBattle: false,
//     event_linkMicArmies: false,
//     end_allStreamsEnds: true,
//     proxyConfiguration: {
//       useApifyProxy: true,
//       apifyProxyGroups: ["RESIDENTIAL"],
//     },
//   };

//   // const submitToApi = async () => {
//   //   try {
//   //     const res = await axios.post("https://chatx-api.hadiwijaya.co/chat", {
//   //       comments: dataComment,
//   //     });
//   //     console.log("Response from API:", res.data);
//   //   } catch (error) {
//   //     console.error("Error submitting data to API:", error);
//   //   }
//   // };

//   const getDataComment = async () => {
//     setLoading(true);
//     if (hasFetched.current) return;
//     hasFetched.current = true;

//     try {
//       console.log("Starting actor...");
//       const run = await client.actor("iBGygcuAxeHUkYsq9").call(input, {
//         timeout: 20,
//         memory: 128,
//         build: "latest",
//       });

//       console.log("Fetching results from dataset...");
//       const { items } = await client.dataset(run.defaultDatasetId).listItems();
//       if (items.length > 0) {
//         const relevantItems = items.slice(1);
//         if (relevantItems.length > 2) {
//           const chatData: TDataChat[] = [];
//           const newJoinData: TNewJoin[] = [];
//           const giftData: Tgift[] = [];
//           let roomUserData: TRoomView = {};

//           relevantItems.forEach((item) => {
//             if (
//               item.eventType === "chat" &&
//               item.comment !== undefined &&
//               chatData.length < 10
//             ) {
//               chatData.push({
//                 username: item.nickname,
//                 comment: item.comment,
//               });
//             } else if (item.eventType === "gift" && giftData.length < 10) {
//               giftData.push({
//                 username: item.nickname,
//                 giftName: item.giftName,
//               });
//             } else if (item.eventType === "member" && giftData.length < 10) {
//               newJoinData.push({
//                 username: item.nickname,
//               });
//             } else if (item.eventType === "roomUser") {
//               roomUserData = {
//                 viewer: item.viewerCount,
//               };
//             }
//           });

//           const formattedData = {
//             chat: chatData,
//             gift: giftData,
//             newMember: newJoinData,
//             roomUser: roomUserData,
//           };

//           setLoading(false);

//           console.log("Success fetch dataset...");
//           console.log(formattedData);
//         }
//       } else {
//         console.log("none data");
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log(error, "error");
//     } finally {
//       setLoading(false);
//       hasFetched.current = false;
//     }
//   };

//   useEffect(() => {
//     getDataComment();
//   }, []);

//   return (
//     <div className="container mx-auto">
//       <div className="p-10">
//         <h1>Ini Hasil </h1>
//         <button
//           disabled={loading}
//           onClick={getDataComment}
//           className={`${
//             loading ? "cursor-not-allowed" : "cursor-pointer"
//           }px-4 py-2 hover:cursor-pointer rounded-md bg-violet-500 text-white font-semibold text-sm`}
//         >
//           {loading ? "Loading..." : "fetch"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Page;
