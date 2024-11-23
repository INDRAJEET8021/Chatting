import React, { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../login/Login";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();
  const [input, setInput] = useState("");

  useEffect(() => {
    const setupChats = async () => {
      if (!currentUser?.id) return;

      const userChatsRef = doc(db, "userchats", currentUser.id);
      const userChatsSnap = await getDoc(userChatsRef);

      // Ensure `userchats` document exists
      if (!userChatsSnap.exists()) {
        await setDoc(userChatsRef, { chats: [] });
      }

      // Real-time listener
      const unSub = onSnapshot(userChatsRef, (snapshot) => {
        const data = snapshot.data();
        if (data && data.chats) {
          const validChats = data.chats.filter(
            (chat) => chat.user && chat.user.id && chat.user.username
          );
          setChats(validChats.sort((a, b) => b.updatedAt - a.updatedAt));
        } else {
          setChats([]);
        }
      });

      return () => unSub();
    };

    setupChats();
  }, [currentUser?.id]);

  const handleSelect = async (chat) => {
    if (!chat || !currentUser?.id) return;

    try {
      const userChatsRef = doc(db, "userchats", currentUser.id);

      // Mark the selected chat as seen
      const updatedChats = chats.map((item) =>
        item.chatId === chat.chatId ? { ...item, isSeen: true } : item
      );

      // Update Firestore with the updated chat list
      await updateDoc(userChatsRef, {
        chats: updatedChats,
      });

      // Update local state for immediate UI feedback
      setChats(updatedChats);

      // Trigger chat change
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.error("Error updating user chats:", err);
    }
  };

  const filteredChat = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="Search Icon" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="Add User Icon"
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {/* Render chat items */}
      {filteredChat.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img src={chat.user?.avatar || "./avatar.png"} alt="User Avatar" />
          <div className="texts">
            <span>{chat.user?.username || "Unknown User"}</span>
            <p>{chat.lastMessage || "No messages yet"}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
