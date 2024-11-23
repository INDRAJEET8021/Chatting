import { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login, { auth } from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserInfo(user.uid);
      } else {
        fetchUserInfo(null);
      }
    });

    return () => unSub();
  }, [fetchUserInfo]);
  console.log(currentUser);
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
