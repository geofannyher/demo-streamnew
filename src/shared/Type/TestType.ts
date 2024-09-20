export type TDataChat = {
  username: string | unknown;
  comment: string | unknown;
};
export type TNewJoin = {
  username: string | unknown;
};
export type Tgift = {
  username: string | unknown;
  giftName: string | unknown;
};

export type TRoomView = {
  viewer?: number | null | unknown;
};
export type IQueue = {
  action_name: string;
  id: number;
  id_audio: string;
  queue_num: string;
  text: string;
  time_end: string;
  time_start: string;
};
