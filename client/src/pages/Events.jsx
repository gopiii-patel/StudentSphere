import { useEffect, useState, useContext } from "react";
import eventService from "../services/eventService";
import { AuthContext } from "../context/AuthContext";

function Events() {
  const { user } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const register = async (id) => {
    if (!user) {
      alert("Please login first.");
      return;
    }

    try {
      await eventService.registerEvent(id);

      alert("Registered Successfully");

      loadEvents();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Registration Failed"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Loading Events...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      <div className="max-w-6xl mx-auto py-24 px-6">

        <h1 className="text-4xl font-bold mb-10">
          Campus Events
        </h1>

        <div className="grid md:grid-cols-2 gap-6">

          {events.map((event) => {

            const registered =
              event.registeredStudents?.includes(
                user?._id
              );

            return (

              <div
                key={event._id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
              >

                <h2 className="text-2xl font-bold">
                  {event.title}
                </h2>

                <p className="text-slate-400 mt-3">
                  {event.description}
                </p>

                <div className="mt-5 space-y-2">

                  <p>📍 {event.venue}</p>

                  <p>
                    📅{" "}
                    {new Date(event.date).toLocaleDateString()}
                  </p>

                  <p>🕒 {event.time}</p>

                  <p>🎓 {event.organizer}</p>

                  <p>
                    👥{" "}
                    {event.registeredStudents?.length || 0}
                    {" "}Registered
                  </p>

                </div>

                <button
                  disabled={registered}
                  onClick={() =>
                    register(event._id)
                  }
                  className={`mt-6 px-5 py-3 rounded-xl ${
                    registered
                      ? "bg-green-600 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
                >
                  {registered
                    ? "Registered"
                    : "Register"}
                </button>

              </div>

            );
          })}

        </div>

        {events.length === 0 && (
          <div className="text-center mt-20 text-slate-500">
            No Events Available
          </div>
        )}

      </div>

    </div>
  );
}

export default Events;