import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, AlertCircle, ArrowRight } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    !name ||
    !email ||
    !mobile ||
    !college ||
    !password
  ) {
    setError("Please fill in all fields.");
    return;
  }

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    setError("Please enter a valid email address.");
    return;
  }

  setIsSubmitting(true);
  setError("");

  try {
    await register({
      name,
      email,
      mobile,
      college,
      password,
      branch,
      semester,
      year,
    });

    navigate("/verify-otp", {
      state: {
        email,
      },
    });

  } catch (err) {
    setError(
      err?.message ||
      "Registration failed."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-slate-950/50 z-10"
      >
        {/* App Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20"
          >
            <GraduationCap size={40} />
          </motion.div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Join StudentSphere
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Create an account to connect with peers and trade
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm"
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
              Full Name
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <User size={18} />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl text-sm placeholder-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
              College Email
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl text-sm placeholder-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all text-white"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 ml-1">
              Preferably your university-issued email address.
            </p>
          </div>

          <div>
  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
    Mobile Number
  </label>

  <input
    type="text"
    placeholder="9876543210"
    value={mobile}
    onChange={(e) =>
      setMobile(e.target.value)
    }
    className="w-full px-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl text-white"
    required
  />
</div>

<div>
  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
    College Name
  </label>

  <input
    type="text"
    placeholder="Your College"
    value={college}
    onChange={(e) =>
      setCollege(e.target.value)
    }
    className="w-full px-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl text-white"
    required
  />
</div>

<div>
  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
    Branch
  </label>

  <input
    type="text"
    placeholder="CSE / DS / IT"
    value={branch}
    onChange={(e) =>
      setBranch(e.target.value)
    }
    className="w-full px-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl text-white"
  />
</div>

<div>
  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
    Semester
  </label>

  <input
    type="number"
    placeholder="3"
    value={semester}
    onChange={(e) =>
      setSemester(e.target.value)
    }
    className="w-full px-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl text-white"
  />
</div>

<div>
  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
    Year
  </label>

  <input
    type="number"
    placeholder="2"
    value={year}
    onChange={(e) =>
      setYear(e.target.value)
    }
    className="w-full px-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl text-white"
          />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
              Password
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl text-sm placeholder-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 border border-indigo-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-8 pt-6 border-t border-slate-800/60 text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors inline-flex items-center gap-0.5">
            Log in here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;