import {
  useNotification,
} from "../context/NotificationContext";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Bell,
  X,
} from "lucide-react";

function Notifications() {
  const {
    notifications,
    removeNotification,
  } = useNotification();

  return (
    <div className="fixed top-5 right-5 z-[9999] space-y-3">

      <AnimatePresence>

        {notifications.map(
          (notification) => (
            <motion.div
              key={notification.id}
              initial={{
                opacity: 0,
                x: 100,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: 100,
              }}
              className="w-[320px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">

                <div className="flex gap-3">

                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Bell
                      size={18}
                      className="text-white"
                    />
                  </div>

                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {
                        notification.title
                      }
                    </h3>

                    <p className="text-slate-300 text-sm mt-1">
                      {
                        notification.message
                      }
                    </p>
                  </div>

                </div>

                <button
                  onClick={() =>
                    removeNotification(
                      notification.id
                    )
                  }
                  className="text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>

              </div>
            </motion.div>
          )
        )}

      </AnimatePresence>
    </div>
  );
}

export default Notifications;