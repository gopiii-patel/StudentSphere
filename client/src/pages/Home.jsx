import { useNotification } from "../context/NotificationContext";
import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import MainLayout from "../layouts/MainLayout";
import api from "../utils/api";
import socket from "../socket";

function Home() {
  const { user } = useContext(AuthContext);
  const { addNotification } = useNotification();

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ONLINE USERS
  const [onlineUsers, setOnlineUsers] = useState([]);

  // FETCH POSTS
  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  // CREATE POST
  const createPost = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsPosting(true);

    try {
      await api.post("/posts", { content });

      setContent("");

      addNotification("Post created successfully");
    } catch (error) {
      console.error(error);

      addNotification("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  // SOCKET REALTIME
  useEffect(() => {
    fetchPosts();

    socket.on("connect", () => {
      console.log("Socket Connected:", socket.id);
    });

    // USER ONLINE
    if (user?._id) {
      socket.emit("user:online", user._id);
    }

    // ONLINE USERS
    socket.on("users:online", (users) => {
      setOnlineUsers(users);
    });

    // POST UPDATED
    socket.on("post:updated", (updatedPost) => {
      console.log("Realtime Update:", updatedPost);

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === updatedPost._id ? updatedPost : p
        )
      );
    });

    // NEW POST
    socket.on("post:new", (newPost) => {
      setPosts((prev) => [newPost, ...prev]);
    });

    // REALTIME NOTIFICATIONS
    socket.on("notification", (data) => {
      addNotification(data.message);
    });

    return () => {
      socket.off("post:updated");
      socket.off("post:new");
      socket.off("users:online");
      socket.off("notification");
    };
  }, [user]);

  const getInitials = (name) => {
    if (!name) return "CC";

    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">
            Campus Feed
          </h2>

          <div className="flex items-center gap-2 text-sm text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {onlineUsers.length} online
          </div>
        </div>

        {/* CREATE POST */}
        <motion.div
        id="create-post"
        className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                className="h-10 w-10 rounded-xl"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center">
                {getInitials(user?.name)}
              </div>
            )}

            <div>
              <p className="text-white font-semibold">
                {user?.name}
              </p>

              <p className="text-xs text-slate-500">
                StudentSphere
              </p>
            </div>
          </div>

          <form onSubmit={createPost}>
            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder="What's happening?"
              className="w-full p-4 rounded-xl bg-slate-950 text-white"
              rows={3}
            />

            <div className="flex justify-end mt-3">
              <button
                disabled={isPosting}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl"
              >
                {isPosting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* POSTS */}
        {isFetching ? (
          <p className="text-white">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-slate-400">
            No posts yet
          </p>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                fetchPosts={fetchPosts}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Home;