import {
  createContext,
  useContext,
  useState,
} from "react";

export const NotificationContext =
  createContext();

export const NotificationProvider = ({
  children,
}) => {
  const [notifications,
    setNotifications,
  ] = useState([]);

  // ADD NOTIFICATION
  const addNotification = (
    notification
  ) => {
    const id = Date.now();

    const newNotification = {
      id,
      title:
        notification.title ||
        "Notification",

      message:
        notification.message || "",

      ...notification,
    };

    setNotifications((prev) => [
      newNotification,
      ...prev,
    ]);

    // AUTO REMOVE
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  // REMOVE NOTIFICATION
  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter(
        (notification) =>
          notification.id !== id
      )
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// CUSTOM HOOK
export const useNotification = () => {
  return useContext(
    NotificationContext
  );
};