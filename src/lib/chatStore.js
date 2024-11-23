import { create } from "zustand";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,

  // Change active chat and handle blocked user logic
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    // Sanity check for valid user objects
    if (!currentUser || !user) {
      console.error("Invalid currentUser or user data");
      return set({
        chatId: null,
        user: null,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }

    // Check if the current user is blocked by the receiver
    if (user.blocked?.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }

    // Check if the receiver is blocked by the current user
    if (currentUser.blocked?.includes(user.id)) {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    }

    // Set chat state if no one is blocked
    return set({
      chatId,
      user,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },

  // Toggle the block status of the receiver
  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
}));
