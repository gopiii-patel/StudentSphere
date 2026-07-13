import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, GraduationCap, AlertCircle, ArrowRight } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      // 🔥 IMPORTANT FIX: extract real backend message
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex items-center justify-center px-4">
      
      <motion.div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">

        <div className="text-center mb-8">
          <GraduationCap size={40} className="text-indigo-400 mx-auto mb-3" />
          <h2 className="text-3xl font-bold">StudentSphere</h2>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-400">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 text-white"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 text-white"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <button
            disabled={isSubmitting}
            className="w-full p-3 bg-indigo-600 rounded-xl text-white"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="mt-4 flex justify-between items-center text-sm">

        <Link
          to="/forgot-password"
          className="text-indigo-400 hover:text-indigo-300 transition"
        >
          Forgot Password?
        </Link>

        <span className="text-slate-400">
          New user?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Register
          </Link>
        </span>

      </div>

      </motion.div>
    </div>
  );
}

export default Login;