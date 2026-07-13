import api from "../utils/api";

const toggleSave = async (id) => {
  const res = await api.put(
    `/posts/save/${id}`
  );

  return res.data;
};

const getSavedPosts = async () => {
  const res = await api.get(
    "/posts/saved/all"
  );

  return res.data;
};

export default {
  toggleSave,
  getSavedPosts,
};