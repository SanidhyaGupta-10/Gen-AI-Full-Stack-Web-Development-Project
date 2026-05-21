import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true,
})

api.interceptors.response.use(
    (response) => response,
    (error: any) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        throw error;
    }
);
