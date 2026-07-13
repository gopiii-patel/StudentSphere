import { CalendarDays, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../utils/api";

function Rightbar() {

  const [events, setEvents] = useState([]);

  useEffect(() => {

    loadEvents();

  }, []);

  const loadEvents = async () => {

    try {

      const res = await api.get("/events");
      
      setEvents(res.data.events || []);

    } catch (err) {

      console.log(err);

    }

  };

  return (
    <aside className="fixed inset-y-16 right-0 hidden xl:block w-80 overflow-y-auto border-l border-slate-800 bg-[#0f172a]/50 backdrop-blur-sm px-5 py-6">

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

        <div className="flex items-center gap-2 mb-5">

          <CalendarDays
            size={20}
            className="text-indigo-400"
          />

          <h2 className="text-white font-bold">
            Upcoming Events
          </h2>

        </div>

        {

          Array.isArray(events) && events.length === 0 ?

          (

            <div className="rounded-xl bg-slate-950/60 p-5 text-center">

              <CalendarDays
                className="mx-auto text-slate-500 mb-3"
              />

              <p className="text-slate-400 text-sm">

                No Upcoming Events

              </p>

            </div>

          )

          :

          (

            <div className="space-y-4">

              {

                events.map((event)=>(

                  <div
                    key={event._id}
                    className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 hover:border-indigo-500 transition"
                  >

                    <h3 className="text-white font-semibold">

                      {event.title}

                    </h3>

                    <p className="text-slate-400 text-sm mt-2">

                      {event.description}

                    </p>

                    <div className="flex items-center gap-2 text-xs text-indigo-300 mt-3">

                      <CalendarDays size={14}/>

                      {

                        new Date(event.date)
                        .toLocaleDateString()

                      }

                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">

                      <MapPin size={14}/>

                      {event.venue}

                    </div>

                  </div>

                ))

              }

            </div>

          )

        }

      </div>

    </aside>
  );

}

export default Rightbar;