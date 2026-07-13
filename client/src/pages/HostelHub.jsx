import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import hostelService from "../services/hostelService";

const categories = [
  "Room Available",
  "Need Roommate",
  "Good Mess",
  "PG Near College",
];

function HostelHub() {
  const [posts, setPosts] =
    useState([]);

    const [formData, setFormData] = useState({
        category: "Room Available",

        title: "",
        description: "",
        contact: "",
        image: null,

        rent: "",
        budget: "",
        location: "",
        hostel: "",
        branch: "",
        year: "",
        genderPreference: "",

        messPrice: "",
        vegNonVeg: "",
        distance: "",
        rating: "",

        facilities: "",
        });

    const [showForm, setShowForm] = 
    useState(false);

    const [editingId, setEditingId] =
    useState(null);

    const [activeCategory,
    setActiveCategory] =
    useState("Room Available");

    const loadPosts =
        async () => {
        try {
            const data =
            await hostelService.getCategoryPosts(
                activeCategory
            );

            setPosts(data);
        } catch (err) {
          console.log("ERROR :", err);

          if (err.response) {
            console.log("SERVER RESPONSE :", err.response.data);
          }
        }
    };

  useEffect(() => {
    loadPosts();
  }, [activeCategory]);


  const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "image") {
    setFormData((prev) => ({
      ...prev,
      image: files[0],
    }));
    return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();


  try {
    const payload = {
  ...formData,

      facilities: formData.facilities
        ? formData.facilities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    };

    if (editingId) {
        await hostelService.updatePost(
            editingId,
            payload
    );

    setEditingId(null);
        } else {
            await hostelService.createPost(
                payload
            );
    }

    setFormData({
  category: "Room Available",
  title: "",
  description: "",
  contact: "",
  image: null,

  rent: "",
  budget: "",
  location: "",
  hostel: "",
  branch: "",
  year: "",
  genderPreference: "",

  messPrice: "",
  vegNonVeg: "",
  distance: "",
  rating: "",

  facilities: "",
});

    setShowForm(false);

    loadPosts();
  }catch (err) {
      console.log("ERROR :", err);

      if (err.response) {
        console.log("SERVER RESPONSE :", err.response.data);
      }
    }
};

const handleEdit = (post) => {
  setEditingId(post._id);

  setShowForm(true);

  setFormData({
    category: post.category || "Room Available",

    title: post.title || "",
    description: post.description || "",
    contact: post.contact || "",

    image: null,

    rent: post.rent || "",
    budget: post.budget || "",
    location: post.location || "",
    hostel: post.hostel || "",
    branch: post.branch || "",
    year: post.year || "",
    genderPreference: post.genderPreference || "",

    messPrice: post.messPrice || "",
    vegNonVeg: post.vegNonVeg || "",
    distance: post.distance || "",
    rating: post.rating || "",

    facilities: Array.isArray(post.facilities)
      ? post.facilities.join(", ")
      : "",
  });
};

const handleDelete = async (id) => {
  const ok = window.confirm(
    "Delete this post?"
  );

  if (!ok) return;

  try {
    await hostelService.deletePost(id);

    loadPosts();
  } catch (err) {
      console.log("ERROR :", err);

      if (err.response) {
        console.log("SERVER RESPONSE :", err.response.data);
      }
    }
};

return (
  <div className="min-h-screen bg-[#020617] text-white">
    <div className="max-w-7xl mx-auto px-6 py-24">

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">
          Hostel Hub
        </h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl"
        >
          <Plus size={18} />
          {showForm ? "Close" : "Create Post"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10 space-y-4"
        >

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-slate-950 rounded-lg p-3"
          >
            <option>Room Available</option>
            <option>Need Roommate</option>
            <option>Good Mess</option>
            <option>PG Near College</option>
          </select>

          <input
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-slate-950 rounded-lg p-3"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-slate-950 rounded-lg p-3"
          />

          <input
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            className="w-full bg-slate-950 rounded-lg p-3"
          />

          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleChange}
          />

          {/* ROOM AVAILABLE */}

          {formData.category === "Room Available" && (
            <>
              <input
                type="number"
                name="rent"
                placeholder="Monthly Rent"
                value={formData.rent}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />

              <input
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />
            </>
          )}

          {/* NEED ROOMMATE */}

          {formData.category === "Need Roommate" && (
            <>
              <input
                type="number"
                name="budget"
                placeholder="Budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />

              <input
                name="hostel"
                placeholder="Hostel Name"
                value={formData.hostel}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />

              <input
                name="branch"
                placeholder="Branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />

              <input
                type="number"
                name="year"
                placeholder="Year"
                value={formData.year}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />

              <input
                name="genderPreference"
                placeholder="Gender Preference"
                value={formData.genderPreference}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />
            </>
          )}

          {/* GOOD MESS */}

          {formData.category === "Good Mess" && (
            <>
              <input
                type="number"
                name="messPrice"
                placeholder="Monthly Price"
                value={formData.messPrice}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />

              <select
                name="vegNonVeg"
                value={formData.vegNonVeg}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              >
                <option value="">Food Type</option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Both">Both</option>
              </select>

              <input
                name="distance"
                placeholder="Distance from College"
                value={formData.distance}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />

              <input
                type="number"
                name="rating"
                placeholder="Rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />
            </>
          )}

          {/* PG */}

          {formData.category === "PG Near College" && (
            <>
              <input
                type="number"
                name="rent"
                placeholder="Monthly Rent"
                value={formData.rent}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />

              <input
                name="distance"
                placeholder="Distance"
                value={formData.distance}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />

              <input
                name="facilities"
                placeholder="WiFi, AC, Parking..."
                value={formData.facilities}
                onChange={handleChange}
                className="w-full bg-slate-950 rounded-lg p-3"
              />
            </>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-semibold"
          >
            {editingId
            ? "Update Post"
            : "Publish Post"}

          </button>

        </form>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2 rounded-xl border ${
              activeCategory === category
                ? "bg-indigo-600 border-indigo-600"
                : "bg-slate-900 border-slate-800"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

        {posts.map((post) => (

          <div
            key={post._id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500 transition"
          >

            {post.image && (
              <img
                src={post.image}
                alt=""
                className="w-full h-52 object-cover"
              />
            )}

            <div className="p-5">

              <div className="flex justify-between mb-3">

                <span className="bg-indigo-600 px-3 py-1 rounded-full text-xs">
                  {post.category}
                </span>

                <span className="text-xs text-slate-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>

              </div>

              <h2 className="text-xl font-bold">
                {post.title}
              </h2>

              <p className="text-slate-400 mt-3">
                {post.description}
              </p>

              {post.category === "Room Available" && (
                <>
                  <p className="mt-3">
                    🏠 ₹{post.rent}
                  </p>

                  <p>
                    📍 {post.location}
                  </p>
                </>
              )}

              {post.category === "Need Roommate" && (
                <>
                  <p className="mt-3">
                    Budget ₹{post.budget}
                  </p>

                  <p>{post.hostel}</p>

                  <p>{post.branch}</p>

                  <p>Year {post.year}</p>

                  <p>{post.genderPreference}</p>
                </>
              )}

              {post.category === "Good Mess" && (
                <>
                  <p className="mt-3">
                    ₹{post.messPrice}
                  </p>

                  <p>{post.vegNonVeg}</p>

                  <p>{post.distance}</p>

                  <p>⭐ {post.rating}</p>
                </>
              )}

              {post.category === "PG Near College" && (
                <>
                  <p className="mt-3">
                    ₹{post.rent}
                  </p>

                  <p>{post.distance}</p>

                  <p>{post.facilities}</p>
                </>
              )}

              <div className="border-t border-slate-800 mt-5 pt-4 flex justify-between items-center">

                <div className="flex justify-end gap-3 mb-4">

                <button
                onClick={() => handleEdit(post)}
                className="text-indigo-400 hover:text-indigo-300"
                >

                <Pencil size={18}/>

                </button>

                <button
                onClick={() => handleDelete(post._id)}
                className="text-red-500 hover:text-red-400"
                >

                <Trash2 size={18}/>

                </button>

                </div>

                <div>

                  <p className="font-medium">
                    {post.owner?.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {post.owner?.branch}
                  </p>

                </div>

                <span className="text-green-400 text-sm">
                  {post.contact}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

      {posts.length === 0 && (
        <div className="text-center mt-16 text-slate-500">
          No Posts Found
        </div>
      )}

    </div>
  </div>
);
}

export default HostelHub;