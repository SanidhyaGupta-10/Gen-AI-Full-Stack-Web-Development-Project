import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api/",
    withCredentials: true,
});

interface RegisterParams {
    name: string;
    email: string;
    password: string;
}

interface LoginParams {
    email: string;
    password: string;
}

export const register = async (params: RegisterParams) => {
    try {
        const response = await api.post("auth/register", params);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const login = async (params: LoginParams) => {
    try {
        const response = await api.post("auth/login", params);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await api.post("auth/logout", {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        localStorage.removeItem("token");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMe = async () => {
    try {
        const response = await api.get("auth/get-me", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}
