import {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import api from "../utils/api";

import socket from "../socket";

import {
  AuthContext,
} from "../context/AuthContext";

function Messages() {
  const { user } =
    useContext(AuthContext);

  const [searchParams] =
    useSearchParams();

  const conversationId =
    searchParams.get(
      "conversation"
    );

  const [messages, setMessages] =
    useState([]);

  const [text, setText] =
    useState("");

  const fetchMessages =
    async () => {
      if (!conversationId)
        return;

      try {
        const res =
          await api.get(
            `/messages/${conversationId}`
          );

        setMessages(
          res.data
        );
      } catch (error) {
        console.log(error);
      }
    };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {

    socket.on(
      "chat:newMessage",
      (message) => {
        if (
          message.conversationId ===
          conversationId
        ) {
          setMessages(
            (prev) => [
              ...prev,
              message,
            ]
          );
        }
      }
    );

    return () => {
      socket.off(
        "chat:newMessage"
      );
    };
  }, [conversationId]);

  const sendMessage =
    async () => {
      if (!text.trim())
        return;

      try {

        const receiverId =
          messages.length > 0
            ? (
                messages[0]
                  .sender
                  ._id ===
                user._id
                  ? messages[0]
                      .receiver
                      ._id
                  : messages[0]
                      .sender
                      ._id
              )
            : null;

        if (!receiverId)
          return;

        const res =
          await api.post(
            "/messages",
            {
              conversationId,
              receiverId,
              text,
            }
          );

        setMessages(
          (prev) => [
            ...prev,
            res.data,
          ]
        );

        setText("");

      } catch (error) {
        console.log(error);
      }
    };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-6">

        <h1 className="text-3xl font-bold text-white mb-6">
          Messages
        </h1>

        {!conversationId ? (
          <div className="bg-slate-900 rounded-3xl p-8 text-center text-slate-400">
            Open a chat from
            Marketplace
          </div>
        ) : (
          <div className="bg-slate-900 rounded-3xl p-5">

            <div className="h-[500px] overflow-y-auto space-y-3 mb-5">

              {messages.map(
                (message) => (
                  <div
                    key={
                      message._id
                    }
                    className={`p-3 rounded-2xl max-w-[70%] ${
                      message
                        .sender
                        ?._id ===
                      user?._id
                        ? "bg-indigo-600 ml-auto"
                        : "bg-slate-800"
                    }`}
                  >
                    {
                      message.text
                    }
                  </div>
                )
              )}
            </div>

            <div className="flex gap-3">

              <input
                value={text}
                onChange={(e) =>
                  setText(
                    e.target.value
                  )
                }
                placeholder="Type a message..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
              />

              <button
                onClick={
                  sendMessage
                }
                className="bg-indigo-600 hover:bg-indigo-500 px-6 rounded-xl"
              >
                Send
              </button>

            </div>

          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default Messages;