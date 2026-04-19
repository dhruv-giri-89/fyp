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
);// 🔹 Handle 401 Unauthorized globally
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem("token");
            localStorage.removeItem("adminToken");
            
            // Redirect based on whether it was an admin route or user route
            if (window.location.pathname.startsWith("/admin")) {
                window.location.href = "/admin/login";
            } else {
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default API;