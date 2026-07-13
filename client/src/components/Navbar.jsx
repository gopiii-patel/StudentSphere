import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  GraduationCap,
  PlusCircle,
  LogOut,
  Shield,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "CC";

    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePost = () => {
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById("create-post");
        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 400);
      return;
    }

    const section = document.getElementById("create-post");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        {/* Logo */}

        <div className="flex items-center gap-3">

          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400">
              <GraduationCap size={20} />
            </div>

            <h1 className="text-xl font-bold text-white">
              Student{" "}
              <span className="text-indigo-400">
                Sphere
              </span>
            </h1>
          </Link>

        </div>

        {/* Search */}

        <div className="hidden md:block w-full max-w-md mx-8">

          <div className="relative">

            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-xl bg-slate-900 border border-slate-800 py-2 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
            />

          </div>

        </div>

        <div className="flex items-center gap-3">

          {/* Create Post */}

          <button
            onClick={handlePost}
            className="hidden md:flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
          >
            <PlusCircle size={18} />
            Post
          </button>

          {/* ADMIN PANEL */}

          {user?.role === "admin" && (

            <Link
              to="/admin/events"
              className="hidden md:flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500"
            >
              <Shield size={18} />
              Admin
            </Link>

          )}

          {/* Profile */}

          <Link to="/profile">

            {user?.profilePicture ? (

              <img
                src={user.profilePicture}
                alt=""
                className="h-10 w-10 rounded-xl object-cover border border-slate-700"
              />

            ) : (

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
                {getInitials(user?.name)}
              </div>

            )}

          </Link>

          <Link to="/events">
            Events
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-xl p-2 text-slate-400 hover:text-red-400"
          >
            <LogOut size={20} />
          </button>

        </div>

      </div>
    </header>
  );
}

export default Navbar;