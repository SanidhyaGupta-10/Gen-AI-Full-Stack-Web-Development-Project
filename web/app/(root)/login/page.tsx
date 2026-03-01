"use client";

import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/hooks/useAuth.hook";
import LoadingSpinner from "@/app/components/Loader";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const isNotUser = () => {
    router.push("/register");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      
      const response = await login({ email, password });
      
      // The backend returns { user, token }.
      if (response && response.token) {
        localStorage.setItem("token", response.token);
        router.push("/");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Login failed";
      console.error("Login failed:", errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-950 via-purple-950 to-indigo-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Glow Layer */}
        <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-30"></div>

        <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8">
          <h2 className="text-3xl font-bold text-center mb-2 bg-linear-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
            Welcome Back
          </h2>
          <p className="text-center text-gray-400 text-sm mb-8">
            Login to continue 🚀
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded bg-white/10 border-white/20 text-purple-600 focus:ring-purple-500"
                />
                Remember me
              </label>

             
            </div>

            {/* Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full py-3 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:opacity-90 transition"
            >
              Login
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don’t have an account?{" "}
            <span 
            onClick={isNotUser
              
            }
            className="text-purple-400 hover:underline cursor-pointer">
              Register
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}