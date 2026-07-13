import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageSquare,
  Trash2,
  Edit3,
  Send,
  Clock,
  Check,
  X,
} from "lucide-react";

import {
  Bookmark,
} from "lucide-react";

import postService from "../services/postService";

import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

function PostCard({ post, fetchPosts }) {
  const { user } = useContext(AuthContext);

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSubmittingComment, setIsSubmittingComment] =
    useState(false);

  const isLiked = post.likes?.some(
    (id) => id.toString() === user?._id
  );

  const getInitials = (name) => {
    if (!name) return "CC";

    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // LIKE
  const handleLike = async () => {
    try {
      await api.put(`/posts/like/${post._id}`);
      fetchPosts();
    } catch (error) {
      console.error("Like failed:", error);
    }
  };

  // COMMENT
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    setIsSubmittingComment(true);

    try {
      await api.put(`/posts/comment/${post._id}`, {
        text: commentText,
      });

      setCommentText("");

      fetchPosts();
      
    } catch (error) {
      console.error("Comment failed:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!editContent.trim()) return;

    try {
      await api.put(`/posts/${post._id}`, {
        content: editContent,
      });

      setIsEditing(false);

      fetchPosts();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // DELETE
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Delete this post?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/posts/${post._id}`);

      fetchPosts();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // TIME FORMAT
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now - date;

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    return `${diffDays}d ago`;
  };
// SAVE post

  const savePost = async () => {
  try {
    await postService.toggleSave(
      post._id
    );
  } catch (err) {
    console.log(err);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-xl shadow-slate-950/20"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {post.author?.profilePicture ? (
            <img
              src={post.author.profilePicture}
              alt={post.author.name}
              className="h-10 w-10 rounded-xl object-cover border border-slate-800"
            />
          ) : (
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
              {getInitials(post.author?.name)}
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-white">
              {post.author?.name || "Student"}
            </h3>

            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
              <span>{post.author?.branch || "General"}</span>

              {post.author?.semester && (
                <>
                  <span>•</span>
                  <span>Sem {post.author.semester}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <Clock size={10} />
            <span>{formatTime(post.createdAt)}</span>
          </div>

          {user?._id === post.author?._id && (
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400"
              >
                <Edit3 size={14} />
              </button>

              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) =>
                setEditContent(e.target.value)
              }
              className="w-full min-h-[80px] rounded-2xl bg-slate-950/40 border border-slate-800 p-3 text-sm text-white outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-400 text-xs"
              >
                <X size={12} />
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-xs"
              >
                <Check size={12} />
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-300 whitespace-pre-wrap">
            {post.content}
          </p>
        )}
      </div>

      {/* ACTIONS */}
      <div className="mt-5 pt-3 border-t border-slate-800 flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
            isLiked
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "border-slate-800 bg-slate-950/20 text-slate-400"
          }`}
        >
          <Heart
            size={14}
            className={
              isLiked ? "fill-red-500 text-red-500" : ""
            }
          />

          <span>{post.likes?.length || 0}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            setShowComments(!showComments)
          }
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 bg-slate-950/20 text-slate-400"
        >
          <MessageSquare size={14} />

          <span>{post.comments?.length || 0}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={savePost}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 bg-slate-950/20 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition"
        >
          <Bookmark size={14} />
          <span>Save</span>
        </motion.button>
      </div>

      {/* COMMENTS */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-slate-800 space-y-4 overflow-hidden"
          >
            {/* LIST */}
            {post.comments?.length > 0 ? (
              <div className="space-y-3">
                {post.comments.map((c) => (
                  <div
                    key={c._id}
                    className="p-3 rounded-2xl bg-slate-950/30 border border-slate-800"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-200">
                        {c.user?.name || "Student"}
                      </span>

                      <span className="text-[9px] text-slate-500">
                        {formatTime(c.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No comments yet
              </p>
            )}

            {/* FORM */}
            <form
              onSubmit={handleAddComment}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) =>
                  setCommentText(e.target.value)
                }
                className="flex-1 rounded-xl bg-slate-950/40 border border-slate-800 p-2.5 text-xs text-white outline-none"
              />

              <button
                type="submit"
                disabled={
                  isSubmittingComment ||
                  !commentText.trim()
                }
                className="p-2.5 rounded-xl bg-indigo-500 text-white disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default PostCard;