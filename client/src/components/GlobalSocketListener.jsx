import { useEffect, useContext } from "react";
import socket from "../socket";

import { AuthContext } from "../context/AuthContext";

import {
  useNotification,
} from "../context/NotificationContext";

function GlobalSocketListener() {
  const { user } = useContext(AuthContext);

  const { addNotification } =
    useNotification();

  useEffect(() => {
    if (!user?._id) return;

    socket.emit("user:online", {
      _id: user._id,
      name: user.name,
    });

    // CHAT
    socket.on(
      "chat:notification",
      (data) => {
        addNotification({
          title: "New Message",
          message: `${data.senderName}: ${data.text}`,
        });

        if (
          Notification.permission ===
          "granted"
        ) {
          new Notification(
            data.senderName,
            {
              body: data.text,
            }
          );
        }

        const audio = new Audio(
          "/message.mp3"
        );

        audio.play();
      }
    );

    // NOTES
    socket.on(
      "notes:new",
      () => {
        addNotification({
          title: "New Notes Uploaded",
          message:
            "A student uploaded new notes",
        });
      }
    );

    socket.on(
      "notes:update",
      () => {
        addNotification({
          title: "Notes Updated",
          message:
            "Download count updated",
        });
      }
    );

    return () => {
      socket.off(
        "chat:notification"
      );

      socket.off(
        "notes:new"
      );

      socket.off(
        "notes:update"
      );
    };
  }, [user]);

  return null;
}

export default GlobalSocketListener;