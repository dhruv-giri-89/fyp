import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5001/api",
    withCredentials: true,
});

// 🔹 Add JWT token to every request
API.interceptors.request.use(
    (config) => {
        // Try admin token first for admin routes
        const adminToken = localStorage.getItem("adminToken");
        const userToken = localStorage.getItem("token");
        
        if (adminToken && (config.url?.includes('/admin') || config.url?.includes('/elections') || config.url?.includes('/parties') || config.url?.includes('/candidates'))) {
            config.headers.Authorization = `Bearer ${adminToken}`;
        } else if (userToken) {
            config.headers.Authorization = `Bearer ${userToken}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;