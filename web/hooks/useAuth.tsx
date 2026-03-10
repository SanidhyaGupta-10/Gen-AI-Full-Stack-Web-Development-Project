"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe, logout as apiLogout, login as apiLogin, register as apiRegister } from "@/hooks/useAuth.hook";
import { useRouter } from "next/navigation";

interface User {
    _id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    login: typeof apiLogin;
    register: typeof apiRegister;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const data = await getMe();
            // Assuming response structure is { user: { ... } } or just the user object
            setUser(data.user ?? data);
        } catch (err) {
            console.error("Failed to fetch user:", err);
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const logout = async () => {
        try {
            await apiLogout();
            setUser(null);
            router.push("/login");
        } catch (err) {
            console.error("Logout failed:", err);
            localStorage.removeItem("token");
            setUser(null);
            router.push("/login");
        }
    };

    const login: typeof apiLogin = async (params) => {
        const res = await apiLogin(params);
        if (res.token) {
            localStorage.setItem("token", res.token);
            await refreshUser();
        }
        return res;
    };

    const register: typeof apiRegister = async (params) => {
        const res = await apiRegister(params);
        if (res.token) {
            localStorage.setItem("token", res.token);
            await refreshUser();
        }
        return res;
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, refreshUser, login, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
