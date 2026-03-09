"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { motion } from "framer-motion";
import { LogOut, User, LayoutDashboard, BrainCircuit } from "lucide-react";

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  if (loading) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg px-6 py-3 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-linear-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <BrainCircuit size={20} />
            </div>
            <span className="text-xl font-black text-white tracking-tight">AI<span className="text-purple-400">Hire</span></span>
          </Link>

          {/* Nav Links & Auth */}
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link 
                  href="/" 
                  className="hidden md:flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>

                <div className="h-4 w-px bg-white/10 hidden md:block" />

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <User size={14} className="text-purple-400" />
                    <span className="text-sm font-semibold text-white/80">{user.name}</span>
                  </div>
                  
                  <button
                    onClick={logout}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-white/40 hover:text-rose-400 transition-all group"
                    title="Logout"
                  >
                    <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href="/login" 
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all text-center"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-all text-center shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}