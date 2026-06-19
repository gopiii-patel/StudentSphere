import {
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import { AuthContext } from "../context/AuthContext";

import {
  NotificationContext,
} from "../context/NotificationContext";

import socket from "../socket";

import api from "../utils/api";

function Chat() {
  const { user } =
    useContext(AuthContext);

  const { addNotification } =
    useContext(NotificationContext);

  const [searchParams] =
    useSearchParams();

  const sellerId =
    searchParams.get("user");

  const messagesEndRef =
    useRef(null);

  const [message, setMessage] =
    useState("");
  
  const [isTyping, setIsTyping] =
    useState(false);

  const [editingMessage,setEditingMessage,] = 
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState(null);

  const [lastSeen, setLastSeen] =
  useState(null);

  const [conversations,
    setConversations,
  ] = useState([]);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // SOCKET
useEffect(() => {
  if (user?._id) {
    socket.emit("user:online", {
      _id: user._id,
      name: user.name,
      profilePicture:
        user.profilePicture,
    });
  }

  // ONLINE USERS
  socket.on(
    "users:online",
    (users) => {
      setOnlineUsers(users);
    }
  );

  // NEW MESSAGE
  socket.on(
    "chat:newMessage",
    (newMessage) => {

      setMessages((prev) => {
        const exists = prev.find(
          (msg) =>
            msg._id ===
            newMessage._id
        );

        if (exists) return prev;

        return [
          ...prev,
          newMessage,
        ];
      });

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id ===
          newMessage.conversationId
            ? {
                ...conversation,
                lastMessage:
                  newMessage.text,
              }
            : conversation
        )
      );

      if (
        newMessage.sender?._id !==
        user._id
      ) {
        addNotification({
          type: "message",
          message: `${newMessage.sender?.name} sent you a message`,
        });
      }
    }
  );

  // MESSAGE EDITED
  socket.on(
    "chat:messageEdited",
    (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id ===
          updatedMessage._id
            ? updatedMessage
            : msg
        )
      );
    }
  );

  // MESSAGE DELETED
  socket.on(
    "chat:messageDeleted",
    (messageId) => {
      setMessages((prev) =>
        prev.filter(
          (msg) =>
            msg._id !==
            messageId
        )
      );
    }
  );

  // MESSAGE SEEN
  socket.on(
    "chat:messageSeen",
    ({ conversationId }) => {

      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          status:
            msg.conversationId ===
            conversationId
              ? "seen"
              : msg.status,
        }))
      );
    }
  );

  // TYPING START
  socket.on(
    "typing:start",
    () => {
      setIsTyping(true);
    }
  );

  // TYPING STOP
  socket.on(
    "typing:stop",
    () => {
      setIsTyping(false);
    }
  );

  // NOTIFICATION
  socket.on(
    "chat:notification",
    (notification) => {
      addNotification({
        type: "message",
        message:
          notification.text,
      });
    }
  );

  return () => {

    socket.off(
      "users:online"
    );

    socket.off(
      "chat:newMessage"
    );

    socket.off(
      "chat:messageEdited"
    );

    socket.off(
      "chat:messageDeleted"
    );

    socket.off(
      "chat:messageSeen"
    );

    socket.off(
      "typing:start"
    );

    socket.off(
      "typing:stop"
    );

    socket.off(
      "chat:notification"
    );
  };
  }, [user]);

  // LOAD CONVERSATIONS
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations =
    async () => {
      try {
        const res =
          await api.get("/chat");

        setConversations(res.data);

        // AUTO OPEN SELLER CHAT
        if (sellerId) {
          let existingConversation =
            res.data.find(
              (conversation) =>
                conversation.participants.some(
                  (participant) =>
                    participant._id ===
                    sellerId
                )
            );

          // CREATE NEW CHAT
          if (!existingConversation) {
            const newConversation =
              await api.post("/chat", {
                sellerId,
              });

            existingConversation =
              newConversation.data;

            setConversations((prev) => [
              newConversation.data,
              ...prev,
            ]);
          }

          const otherUser =
            existingConversation.participants.find(
              (participant) =>
                participant._id !==
                user._id
            );

          setSelectedUser(
            otherUser
          );

          setSelectedConversation(
            existingConversation
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

  // LOAD MESSAGES
 useEffect(() => {
  const fetchMessages =
    async () => {
      if (!selectedConversation)
        return;

      try {
        const res = await api.get(
          `/messages/${selectedConversation._id}`
        );

        setMessages(res.data);

        // MARK MESSAGES AS SEEN
        await api.put(
          `/messages/seen/${selectedConversation._id}`
        );

      } catch (error) {
        console.log(error);
      }
    };

  fetchMessages();
}, [selectedConversation]);

  // SEND MESSAGE
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    if (!selectedConversation)
      return;

    try {
      const res = await api.post(
        "/messages",
        {
          conversationId:
            selectedConversation._id,

          receiverId:
            selectedUser._id,

          text: message,
        }
      );

      setMessages((prev) => [
        ...prev,
        res.data,
      ]);

      // UPDATE LAST MESSAGE
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id ===
          selectedConversation._id
            ? {
                ...conversation,
                lastMessage:
                  message,
              }
            : conversation
        )
      );

      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditMessage = async (
    message
  ) => {
    const newText = prompt(
      "Edit message",
      message.text
    );

    if (
      !newText ||
      newText === message.text
    )
    return;

  try {
    const res = await api.put(
      `/messages/${message._id}`,
      {
        text: newText,
      }
    );

    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === message._id
          ? res.data
          : msg
      )
    );
  } catch (error) {
    console.log(error);
  }
};

const handleDeleteMessage =
  async (messageId) => {
    const confirmDelete =
      window.confirm(
        "Delete message?"
      );

    if (!confirmDelete)
      return;

    try {
      await api.delete(
        `/messages/${messageId}`
      );

      setMessages((prev) =>
        prev.filter(
          (msg) =>
            msg._id !== messageId
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  // ONLINE STATUS
  const isSelectedUserOnline =
    onlineUsers.some(
      (onlineUser) =>
        onlineUser._id ===
        selectedUser?._id
    );

  return (
    <MainLayout>
      <div className="h-[calc(100vh-80px)] flex rounded-3xl overflow-hidden border border-slate-800 bg-slate-950">

        {/* SIDEBAR */}
        <div className="w-[320px] border-r border-slate-800 bg-slate-900 overflow-y-auto">

          <div className="p-5 border-b border-slate-800">
            <h2 className="text-white font-bold text-xl">
              Chats
            </h2>
          </div>

          {conversations.length === 0 ? (
            <div className="p-5 text-slate-400">
              No conversations yet
            </div>
          ) : (
            conversations.map(
              (conversation) => {
                const otherUser =
                  conversation.participants.find(
                    (participant) =>
                      participant._id !==
                      user._id
                  );

                const isOnline =
                  onlineUsers.some(
                    (onlineUser) =>
                      onlineUser._id ===
                      otherUser?._id
                  );

                return (
                  <button
                    key={
                      conversation._id
                    }
                    onClick={() => {
                      setSelectedUser(
                        otherUser
                      );

                      setSelectedConversation(
                        conversation
                      );
                    }}
                    className={`w-full text-left p-4 border-b border-slate-800 hover:bg-slate-800 transition-all ${
                      selectedConversation?._id ===
                      conversation._id
                        ? "bg-slate-800"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">

                      <div className="relative">

                        <img
                          src={
                            otherUser?.profilePicture ||
                            "https://ui-avatars.com/api/?name=" +
                              otherUser?.name
                          }
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />

                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                            isOnline
                              ? "bg-green-500"
                              : "bg-slate-500"
                          }`}
                        />

                      </div>

                      <div className="flex-1 overflow-hidden">

                        <h3 className="text-white font-semibold truncate">
                          {
                            otherUser?.name
                          }
                        </h3>

                        <p className="text-xs text-slate-400 truncate">
                          {
                            conversation.lastMessage ||
                            "Start chatting"
                          }
                        </p>

                      </div>

                    </div>
                  </button>
                );
              }
            )
          )}

        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col">

          {/* HEADER */}
          <div className="h-[72px] border-b border-slate-800 flex items-center px-6 bg-slate-900">

            {selectedUser ? (
              <div className="flex items-center gap-3">

                <img
                  src={
                    selectedUser?.profilePicture ||
                    "https://ui-avatars.com/api/?name=" +
                      selectedUser?.name
                  }
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div>
                  <h2 className="text-white font-bold text-lg">
                    {
                      selectedUser.name
                    }
                  </h2>

                  <p
                    className={`text-xs ${
                      isSelectedUserOnline
                        ? "text-green-400"
                        : "text-slate-400"
                    }`}
                  >
                    {isSelectedUserOnline
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>

              </div>
            ) : (
              <p className="text-slate-400">
                Select a conversation
              </p>
            )}

          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950">

            {!selectedUser ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                Start chatting
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                No messages yet
              </div>
            ) : (
            
              messages.map((msg, index) => (
              <div
              key={index}
              className={`max-w-[75%] px-4 py-3 rounded-2xl relative group ${
                msg.sender?._id === user._id
                ? "ml-auto bg-indigo-600 text-white"
                : "bg-slate-800 text-white"
            }`}
            >
            <p className="text-sm break-words">
              {msg.text}
            </p>

            {msg.edited && (
              <p className="text-[10px] opacity-60 italic">
                edited
              </p>
            )}

              <div className="flex items-center justify-end gap-1 mt-2">

                <p className="text-[10px] opacity-70">
                  {new Date(
                    msg.createdAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {msg.sender?._id === user._id && (
                  <>
                    <span className="text-[12px]">
                      {msg.status === "sent" &&
                        "✓"}

                      {msg.status ===
                        "delivered" &&
                        "✓✓"}

                      {msg.status === "seen" && (
                        <span className="text-cyan-300">
                          ✓✓
                        </span>
                      )}
                    </span>

                    <button
                      onClick={() =>
                        handleEditMessage(msg)
                      }
                      className="text-[11px] opacity-70 hover:opacity-100"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteMessage(
                          msg._id
                        )
                      }
                      className="text-[11px] opacity-70 hover:opacity-100"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
))
            )}

           {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 px-4 py-2 rounded-2xl text-white text-sm animate-pulse">
                typing...
              </div>
            </div>
            )}

          <div ref={messagesEndRef} />

          </div>

          {/* INPUT */}
          {selectedUser && (
            <form
              onSubmit={sendMessage}
              className="p-4 border-t border-slate-800 flex gap-3 bg-slate-900"
            >
              <input
                type="text"
                placeholder={`Message ${selectedUser.name}`}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  
                  socket.emit(
                    "typing:start",
                    {
                      receiverId:
                        selectedUser?._id,
                      senderName:
                        user.name,
                    }
              );

              clearTimeout(
                window.typingTimeout
              );

              window.typingTimeout =
                setTimeout(() => {
                  socket.emit(
                    "typing:stop",
                    {
                      receiverId:
                        selectedUser?._id,
                    }
                  );
                }, 1000);
              }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none"
              />

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 transition-all text-white px-6 rounded-2xl font-medium"
              >
                Send
              </button>

            </form>
          )}

        </div>
      </div>
    </MainLayout>
  );
}

export default Chat;  
