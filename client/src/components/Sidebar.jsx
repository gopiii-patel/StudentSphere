import { useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  MessageSquare,
  BookOpen,
  User,
  LogOut,
  Sparkles,
  Building2,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

const navItems = [
  {
    to: "/",
    label: "Campus Feed",
    description: "What's happening",
    icon: Home,
  },
  {
    to: "/marketplace",
    label: "Marketplace",
    description: "Buy & sell items",
    icon: ShoppingBag,
  },
  {
    to: "/messages",
    label: "Messages",
    description: "Student chat",
    icon: MessageSquare,
  },
  {
    to: "/notes",
    label: "Notes Bank",
    description: "Study material",
    icon: BookOpen,
  },
  {
    to: "/hostel",
    label: "Hostel Hub",
    description: "Rooms & PG",
    icon: Building2,
  },
  {
    to: "/profile",
    label: "My Profile",
    description: "Manage profile",
    icon: User,
  },
];

function Sidebar() {
  const { user, logout } =
    useContext(AuthContext);

  const getInitials = (name) => {
    if (!name) return "CC";

    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className="fixed inset-y-16 left-0 z-40 hidden w-72 overflow-y-auto border-r border-slate-800 bg-[#0f172a]/40 px-5 py-6 text-slate-200 backdrop-blur-sm lg:block">

      {user && (
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col items-center text-center">

          {user.profilePicture ? (
            <img
              src={
                user.profilePicture
              }
              alt=""
              className="h-16 w-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              {getInitials(
                user.name
              )}
            </div>
          )}

          <h2 className="mt-3 text-white font-semibold">
            {user.name}
          </h2>

          <p className="text-xs text-indigo-400">
            {user.branch}
          </p>

        </div>
      )}

      <nav className="space-y-2">

        {navItems.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:bg-slate-900"
                  }`
                }
              >
                <Icon size={18} />

                <div>

                  <div>
                    {item.label}
                  </div>

                  <div className="text-xs">
                    {
                      item.description
                    }
                  </div>

                </div>

              </NavLink>
            );
          }
        )}

      </nav>

      <div className="mt-8 rounded-2xl border border-slate-800 p-4">

        <Sparkles
          className="text-indigo-400 mb-3"
          size={24}
        />

        <p className="text-sm text-slate-300">
          StudentSphere Hostel
          Network
        </p>

      </div>

      <button
        onClick={logout}
        className="mt-6 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-400 hover:text-red-400"
      >
        <LogOut size={18} />
        Logout
      </button>

    </aside>
  );
}

export default Sidebar;