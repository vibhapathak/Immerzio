import { create } from "zustand";
import { createChatSlice } from "./slices/chat-slice";
import { createAuthSlice } from "./slices/auth-slice";

export const useAppStore = create()((...a)=>({
    ...createAuthSlice(...a),
    ...createChatSlice(...a),

}));