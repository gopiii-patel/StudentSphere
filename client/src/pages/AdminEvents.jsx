import { useEffect, useState } from "react";
import api from "../utils/api";

function AdminEvents() {
  const [form, setForm] =useState({
    title: "",
    description: "",
    venue: "",
    date: "",
    time: "",
    organizer: "",
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data.events || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      venue: "",
      date: "",
      time: "",
      organizer: "",
    });

    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editingId) {
        await api.put(`/events/${editingId}`, form);
      } else {
        await api.post("/events", form);
      }

      resetForm();
      loadEvents();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Failed to save event."
      );
    } finally {
      setLoading(false);
    }
  };

  const editEvent = (event) => {
    setEditingId(event._id);

    setForm({
      title: event.title,
      description: event.description,
      venue: event.venue,
      date: event.date.split("T")[0],
      time: event.time,
      organizer: event.organizer,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await api.delete(`/events/${id}`);
      loadEvents();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Admin Event Management
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-10"
        >

          <div className="grid md:grid-cols-2 gap-4">

            <input
              className="bg-slate-800 rounded-xl p-3"
              placeholder="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <input
              className="bg-slate-800 rounded-xl p-3"
              placeholder="Venue"
              name="venue"
              value={form.venue}
              onChange={handleChange}
              required
            />

            <input
              className="bg-slate-800 rounded-xl p-3"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />

            <input
              className="bg-slate-800 rounded-xl p-3"
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />

            <input
              className="bg-slate-800 rounded-xl p-3 md:col-span-2"
              placeholder="Organizer"
              name="organizer"
              value={form.organizer}
              onChange={handleChange}
              required
            />

            <textarea
              rows={4}
              className="bg-slate-800 rounded-xl p-3 md:col-span-2"
              placeholder="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />

          </div>

          <div className="flex gap-3 mt-5">

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Event"
                : "Create Event"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl"
              >
                Cancel
              </button>
            )}

          </div>

        </form>

        <div className="grid gap-5">

          {events.map((event) => (

            <div
              key={event._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >

              <h2 className="text-2xl font-bold">
                {event.title}
              </h2>

              <p className="text-slate-400 mt-3">
                {event.description}
              </p>

              <div className="mt-4 space-y-2 text-sm">

                <p>📍 {event.venue}</p>

                <p>
                  📅{" "}
                  {new Date(event.date).toLocaleDateString()}
                </p>

                <p>🕒 {event.time}</p>

                <p>🎓 {event.organizer}</p>

                <p>
                  👥 Registered :
                  {" "}
                  {event.registeredStudents?.length || 0}
                </p>

              </div>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={() => editEvent(event)}
                  className="bg-yellow-600 hover:bg-yellow-500 px-5 py-2 rounded-lg"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteEvent(event._id)
                  }
                  className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-lg"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

          {events.length === 0 && (

            <div className="text-center text-slate-400 py-10">

              No Events Available

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default AdminEvents;