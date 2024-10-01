import { create } from "zustand";

interface DataStore {
  dataToSubmit: any;
  lastAction: any[];
  setDataToSubmit: (data: any) => void;
  resetLastAction: () => void;
  addLastAction: (action: any) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  dataToSubmit: null,
  lastAction: [],
  setDataToSubmit: (data) =>
    set((state) => ({
      dataToSubmit: data,
    })),
  resetLastAction: () =>
    set((state) => ({
      lastAction: [],
    })),
  addLastAction: (action) =>
    set((state) => ({
      lastAction: [...state.lastAction, action],
    })),
}));
