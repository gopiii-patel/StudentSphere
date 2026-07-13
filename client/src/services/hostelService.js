import api from "../utils/api";

const getCategoryPosts = async (category) => {
  const res = await api.get("/hostel", {
    params: {
      category,
    },
  });

  return res.data;
};

const createPost = async (data) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {

    if (key === "facilities") {
      formData.append(
        "facilities",
        JSON.stringify(data.facilities || [])
      );
    }

    else if (key === "image") {
      if (data.image) {
        formData.append("image", data.image);
      }
    }

    else {
      if (
        data[key] !== "" &&
        data[key] !== null &&
        data[key] !== undefined
      ) {
        formData.append(key, data[key]);
      }
    }

  });

  for (let pair of formData.entries()) {
  console.log(pair[0], pair[1]);
  }

  const res = await api.post(
    "/hostel",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};
const updatePost = async (id, data) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    // Facilities
    if (key === "facilities") {
      formData.append(
        "facilities",
        JSON.stringify(data.facilities || [])
      );
      return;
    }

    // Image (sirf jab new image select ho)
    if (key === "image") {
      if (
        data.image &&
        data.image instanceof File &&
        data.image.type.startsWith("image/")
      ) {
        formData.append("image", data.image);
      }
      return;
    }

    // Baaki fields
    if (
      data[key] !== "" &&
      data[key] !== null &&
      data[key] !== undefined
    ) {
      formData.append(key, data[key]);
    }
  });

  console.log("===== UPDATE REQUEST =====");
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  const res = await api.put(
    `/hostel/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

const deletePost = async (id) => {
  const res = await api.delete(`/hostel/${id}`);
  return res.data;
};

export default {
  getCategoryPosts,
  createPost,
  updatePost,
  deletePost,
};