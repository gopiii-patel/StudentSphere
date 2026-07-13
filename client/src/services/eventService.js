import api from "../utils/api";

const eventService = {
  // Get all events
  getEvents: async () => {
    const res = await api.get("/events");
    return res.data.events || [];
  },

  // Get single event
  getEvent: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data.event;
  },

  // Create event
  createEvent: async (eventData) => {
    const res = await api.post("/events", eventData);
    return res.data;
  },

  // Update event
  updateEvent: async (id, eventData) => {
    const res = await api.put(`/events/${id}`, eventData);
    return res.data;
  },

  // Delete event
  deleteEvent: async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },

  // Register for Event
  registerEvent: async (id) => {
    const res = await api.post(`/events/register/${id}`);
    return res.data;
  },
};

export default eventService;