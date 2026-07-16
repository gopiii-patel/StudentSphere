import {
  useEffect,
  useState,
  useContext,
} from "react";

import { Link } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import api from "../utils/api";
import socket from "../socket";

import { AuthContext } from "../context/AuthContext";

function Notes() {
  const { user } =
    useContext(AuthContext);

  const [notes, setNotes] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const fetchNotes =
    async () => {
      try {
        const res =
          await api.get(
            "/notes"
          );

        console.log(
          "Fetched Notes:",
          res.data
        );

        setNotes(
          Array.isArray(
            res.data
          )
            ? res.data
            : []
        );
      } catch (error) {
        console.log(
          "Fetch Notes Error:",
          error
        );
      }
    };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    socket.off(
      "notes:new"
    );

    socket.off(
      "notes:update"
    );

    socket.off(
      "notes:delete"
    );

    socket.on(
      "notes:new",
      (newNote) => {
        setNotes((prev) => [
          newNote,
          ...prev,
        ]);
      }
    );

    socket.on(
      "notes:update",
      (updatedNote) => {
        setNotes((prev) =>
          prev.map((note) =>
            note._id ===
            updatedNote._id
              ? updatedNote
              : note
          )
        );
      }
    );

    socket.on(
      "notes:delete",
      (noteId) => {
        setNotes((prev) =>
          prev.filter(
            (note) =>
              note._id !== noteId
          )
        );
      }
    );

    return () => {
      socket.off(
        "notes:new"
      );

      socket.off(
        "notes:update"
      );

      socket.off(
        "notes:delete"
      );
    };
  }, []);

  const handleDownload =
    async (note) => {
      try {
        await api.put(
          `/notes/download/${note._id}`
        );

        const link =
          document.createElement(
            "a"
          );

        link.href =
        `${import.meta.env.VITE_API_URL.replace("/api","")}${note.fileUrl}`;

        link.download =
          note.title;

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );
      } catch (error) {
        console.log(error);
      }
    };

  const handleDelete =
    async (id) => {
      const confirmDelete =
        window.confirm(
          "Delete this note?"
        );

      if (!confirmDelete)
        return;

      try {
        await api.delete(
          `/notes/${id}`
        );

        setNotes((prev) =>
          prev.filter(
            (note) =>
              note._id !== id
          )
        );
      } catch (error) {
        console.log(error);
      }
    };

  const filteredNotes =
    notes.filter((note) => {
      const query =
        search.toLowerCase();

      return (
        note.title
          ?.toLowerCase()
          .includes(query) ||
        note.subject
          ?.toLowerCase()
          .includes(query)
      );
    });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10">

          <h1 className="text-4xl font-bold text-white">
            📚 Campus Notes Hub
          </h1>

          <p className="text-white/80 mt-3">
            Notes, Assignments,
            Books, Lab Manuals
            and Question Papers
          </p>

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search notes..."
            className="mt-6 w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white placeholder:text-white/60"
          />

          <Link
            to="/notes/upload"
            className="inline-block mt-6 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-2xl"
          >
            Upload Notes
          </Link>

        </div>

        <div className="grid md:grid-cols-3 gap-5">

          <div className="bg-slate-900 rounded-3xl p-6">
            <h3 className="text-slate-400">
              Total Notes
            </h3>

            <p className="text-3xl font-bold mt-2">
              {
                filteredNotes.length
              }
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6">
            <h3 className="text-slate-400">
              Downloads
            </h3>

            <p className="text-3xl font-bold mt-2">
              {filteredNotes.reduce(
                (
                  total,
                  note
                ) =>
                  total +
                  (note.downloads ||
                    0),
                0
              )}
            </p>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6">
            <h3 className="text-slate-400">
              Contributors
            </h3>

            <p className="text-3xl font-bold mt-2">
              {
                new Set(
                  filteredNotes.map(
                    (note) =>
                      note
                        .uploadedBy
                        ?._id
                  )
                ).size
              }
            </p>
          </div>

        </div>

        <div>

          <h2 className="text-2xl font-bold mb-5">
            Recent Uploads
          </h2>

          <div className="text-white mb-5">
            Notes Loaded:
            {" "}
            {
              filteredNotes.length
            }
          </div>

          {filteredNotes.length ===
          0 ? (
            <div className="bg-slate-900 rounded-3xl p-10 text-center">

              <h3 className="text-xl font-bold">
                No Notes Found
              </h3>

              <p className="text-slate-400 mt-2">
                Upload your first
                note.
              </p>

            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">

              {filteredNotes.map(
                (note) => (
                  <div
                    key={
                      note._id
                    }
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-5"
                  >

                    <div className="text-5xl">
                      📄
                    </div>

                    <h3 className="font-bold text-white mt-3">
                      {
                        note.title
                      }
                    </h3>

                    <p className="text-slate-400 mt-2">
                      {
                        note.subject
                      }
                    </p>

                    <p className="text-slate-500 text-sm">
                      Semester{" "}
                      {
                        note.semester
                      }
                    </p>

                    <p className="text-slate-500 text-sm mt-2">
                      By{" "}
                      {
                        note
                          .uploadedBy
                          ?.name
                      }
                    </p>

                    <p className="text-slate-500 text-sm mt-2">
                      ⬇️{" "}
                      {
                        note.downloads
                      }{" "}
                      downloads
                    </p>

                    <div className="flex gap-2 mt-5">

                      <a
                        href={`${import.meta.env.VITE_API_URL.replace("/api","")}${note.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-slate-800 text-center py-2 rounded-xl"
                      >
                        Preview
                      </a>

                      <button
                        onClick={() =>
                          handleDownload(
                            note
                          )
                        }
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-2 rounded-xl"
                      >
                        Download
                      </button>

                    </div>

                    {note
                      .uploadedBy
                      ?._id ===
                      user?._id && (
                      <button
                        onClick={() =>
                          handleDelete(
                            note._id
                          )
                        }
                        className="w-full mt-3 bg-red-600 hover:bg-red-500 py-2 rounded-xl"
                      >
                        Delete Note
                      </button>
                    )}

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>
    </MainLayout>
  );
}

export default Notes;