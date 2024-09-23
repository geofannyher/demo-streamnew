import axios from "axios";

export const getReset = async ({ id, star }: { id: string; star: string }) => {
  try {
    const res = await axios.post("https://chatx-api.hadiwijaya.co/reset", {
      id,
      star,
    });
    return res;
  } catch (error) {
    return error;
  }
};
