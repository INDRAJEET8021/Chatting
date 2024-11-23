import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../components/login/Login";

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,

  // Function to fetch user info by UID
  fetchUserInfo: async (uid) => {
    if (!uid) {
      // Clear the state if no UID is provided (user logged out)
      return set({ currentUser: null, isLoading: false });
    }
    try {
      const docRef = doc(db, "users", uid); // Firestore reference to user document
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        console.warn("User document does not exist in Firestore.");
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      set({ currentUser: null, isLoading: false });
    }
  },
}));
