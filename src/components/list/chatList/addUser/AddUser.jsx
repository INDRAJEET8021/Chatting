import React, { useState } from "react";
import "./addUser.css";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../login/Login";
import { useUserStore } from "../../../../lib/userStore";
import { toast } from "react-toastify"; // Ensure you've installed react-toastify

const AddUser = () => {
  const { currentUser } = useUserStore();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    setError(null); // Clear errors

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      } else {
        setUser(null);
        setError("User not found.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while searching for the user.");
    }
  };

  // Add user
  const handleAdd = async () => {
  if (!user || !currentUser) return;

  const chatId = [currentUser.id, user.id].sort().join("_"); // Unique chat ID
  const chatRef = doc(db, "chats", chatId);
  const userChatsRef = doc(db, "userchats", currentUser.id);
  const receiverChatsRef = doc(db, "userchats", user.id);

  try {
    // Create `chats` document if it doesn't exist
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
    }

    // Ensure `userchats` document exists for the current user
    const userChatsSnap = await getDoc(userChatsRef);
    if (!userChatsSnap.exists()) {
      await setDoc(userChatsRef, { chats: [] });
    }

    // Ensure `userchats` document exists for the receiver
    const receiverChatsSnap = await getDoc(receiverChatsRef);
    if (!receiverChatsSnap.exists()) {
      await setDoc(receiverChatsRef, { chats: [] });
    }

    // Add chat to current user's `userchats`
    await updateDoc(userChatsRef, {
      chats: arrayUnion({
        chatId,
        lastMessage: "",
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar || "./avatar.png",
        },
        updatedAt: Date.now(),
      }),
    });

    // Add chat to receiver's `userchats`
    await updateDoc(receiverChatsRef, {
      chats: arrayUnion({
        chatId,
        lastMessage: "",
        user: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar || "./avatar.png",
        },
        updatedAt: Date.now(),
      }),
    });

    console.log("Chat added successfully!");
  } catch (err) {
    console.error("Error adding chat:", err);
  }
};

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="UserName" name="username" required />
        <button>Search</button>
      </form>
      {error && <p className="error">{error}</p>}
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="User Avatar" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
