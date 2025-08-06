import { create } from 'zustand';

type CrossRampState = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
};

export const useCrossRampStore = create<CrossRampState>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
})); 