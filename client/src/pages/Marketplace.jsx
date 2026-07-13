import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  IndianRupee,
  Tag,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  MessageCircle,
  ImageIcon,
} from "lucide-react";

import api from "../utils/api";
import MainLayout from "../layouts/MainLayout";
import { AuthContext } from "../context/AuthContext";
import socket from "../socket";

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600";

function Marketplace() {
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Textbooks & Notes",
    condition: "Good",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filters.search) {
        params.append("search", filters.search);
      }

      if (filters.category) {
        params.append("category", filters.category);
      }

      if (filters.sort) {
        params.append("sort", filters.sort);
      }

      const res = await api.get(
        `/products?${params.toString()}`
      );

      setProducts(res.data);
    } catch (error) {
      console.log("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // SOCKETS
  useEffect(() => {
    socket.on("marketplace:new", (newProduct) => {
      setProducts((prev) => {
        const exists = prev.some(
          (p) => p._id === newProduct._id
        );

        if (exists) return prev;

        return [newProduct, ...prev];
      });
    });

    socket.on(
      "marketplace:update",
      (updatedProduct) => {
        setProducts((prev) =>
          prev.map((product) =>
            product._id === updatedProduct._id
              ? updatedProduct
              : product
          )
        );
      }
    );

    socket.on("marketplace:delete", (productId) => {
      setProducts((prev) =>
        prev.filter(
          (product) => product._id !== productId
        )
      );
    });

    return () => {
      socket.off("marketplace:new");
      socket.off("marketplace:update");
      socket.off("marketplace:delete");
    };
  }, []);

  // FILE CHANGE
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);

    const imageUrl = URL.createObjectURL(file);

    setPreviewImage(imageUrl);
  };

  // CREATE PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return alert("Title required");
    }

    if (!formData.description.trim()) {
      return alert("Description required");
    }

    if (
      !formData.price ||
      Number(formData.price) <= 0
    ) {
      return alert("Enter valid price");
    }

    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append(
        "description",
        formData.description
      );
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append(
        "condition",
        formData.condition
      );

      if (selectedFile) {
        data.append("image", selectedFile);
      }

      await api.post("/products", data, {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      });

      alert("Product Added Successfully");

      setFormData({
        title: "",
        description: "",
        price: "",
        category: "Textbooks & Notes",
        condition: "Good",
      });

      setSelectedFile(null);
      setPreviewImage("");

      fetchProducts();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to create product"
      );
    }
  };

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm("Delete this product?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      console.log(error);
    }
  };

  // MARK SOLD
  const handleMarkSold = async (id) => {
    try {
      await api.put(`/products/${id}/status`, {
        status: "Sold",
      });
    } catch (error) {
      console.log(error);
    }
  };

  // CONTACT SELLER
const handleContactSeller = async (
  sellerId
) => {
  try {
    const res = await api.post(
      "/messages/conversation",
      {
        userId: sellerId,
      }
    );

    navigate(
      `/messages?conversation=${res.data._id}`
    );
  } catch (error) {
    console.log(error);

    alert("Failed to open chat");
  }
};
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Campus Marketplace
          </h1>

          <p className="text-slate-400 mt-2">
            Buy & Sell Products With Students
          </p>
        </div>

        {/* SELL FORM */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-5">
            Sell Something
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              placeholder="Product title"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
            />

            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: e.target.value,
                })
              }
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
            />

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value,
                })
              }
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
            >
              <option>
                Textbooks & Notes
              </option>

              <option>
                Electronics & Gadgets
              </option>

              <option>
                Lab Gear & Instruments
              </option>

              <option>
                Cycles & Vehicles
              </option>

              <option>
                Hostel Essentials
              </option>
            </select>

            <select
              value={formData.condition}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  condition: e.target.value,
                })
              }
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
            >
              <option>New</option>
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
            </select>

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none min-h-[120px]"
            />

            {/* IMAGE */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-slate-300 mb-2">
                <ImageIcon size={18} />
                Product Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-slate-300"
              />

              {previewImage && (
                <img
                  src={previewImage}
                  alt="preview"
                  className="mt-4 w-40 h-40 object-cover rounded-2xl border border-slate-700"
                />
              )}
            </div>

            <button
              type="submit"
              className="md:col-span-2 bg-indigo-600 hover:bg-indigo-500 transition-all rounded-xl py-3 text-white font-semibold"
            >
              Add Product
            </button>
          </form>
        </div>

        {/* FILTERS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-8 grid md:grid-cols-3 gap-4">

          <div className="relative">
            <Search
              className="absolute left-3 top-3.5 text-slate-500"
              size={18}
            />

            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white outline-none"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({
                ...filters,
                category: e.target.value,
              })
            }
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
          >
            <option value="">
              All Categories
            </option>

            <option>
              Textbooks & Notes
            </option>

            <option>
              Electronics & Gadgets
            </option>

            <option>
              Lab Gear & Instruments
            </option>

            <option>
              Cycles & Vehicles
            </option>

            <option>
              Hostel Essentials
            </option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) =>
              setFilters({
                ...filters,
                sort: e.target.value,
              })
            }
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
          >
            <option value="">
              Newest First
            </option>

            <option value="price_asc">
              Price: Low to High
            </option>

            <option value="price_desc">
              Price: High to Low
            </option>
          </select>
        </div>

        {/* PRODUCTS */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            Loading Products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            No Products Found
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden"
              >
                <img
                  src={
                    product.images?.[0] ||
                    DEFAULT_FALLBACK_IMAGE
                  }
                  alt={product.title}
                  className="w-full h-52 object-cover"
                  onError={(e) => {
                    e.target.src =
                      DEFAULT_FALLBACK_IMAGE;
                  }}
                />

                <div className="p-5">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="text-white text-lg font-semibold">
                      {product.title}
                    </h3>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        product.status === "Sold"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm mt-3 line-clamp-3">
                    {product.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm">

                    <div className="flex items-center gap-2 text-indigo-400">
                      <IndianRupee size={16} />

                      <span className="font-semibold">
                        ₹ {product.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Tag size={15} />
                      {product.category}
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Package size={15} />
                      {product.condition}
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <ShoppingBag size={15} />
                      Seller:{" "}
                      {product.seller?.name}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-3 mt-5">

                    {user?._id !==
                      product.seller?._id && (
                      <button
                        onClick={() =>
                          handleContactSeller(
                            product.seller?._id
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all py-2 rounded-xl text-white text-sm font-semibold"
                      >
                        <MessageCircle size={16} />
                        Contact Seller
                      </button>
                    )}

                    {user?._id ===
                      product.seller?._id && (
                      <>
                        {product.status !==
                          "Sold" && (
                          <button
                            onClick={() =>
                              handleMarkSold(
                                product._id
                              )
                            }
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 transition-all py-2 rounded-xl text-white text-sm font-semibold"
                          >
                            <CheckCircle2 size={16} />
                            Mark Sold
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleDelete(
                              product._id
                            )
                          }
                          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 transition-all px-4 py-2 rounded-xl text-white text-sm font-semibold"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Marketplace;