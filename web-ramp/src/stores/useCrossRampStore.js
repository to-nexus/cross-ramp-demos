import { create } from 'zustand';
export var useCrossRampStore = create(function (set) { return ({
    isOpen: false,
    setOpen: function (open) { return set({ isOpen: open }); },
}); });
