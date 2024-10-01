import { create } from "zustand";

interface DataStore {
  dataToSubmit: any;
  setDataToSubmit: (data: any) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  dataToSubmit: null,
  setDataToSubmit: (data) =>
    set(() => ({
      dataToSubmit: data,
    })),
}));
