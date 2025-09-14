// src/services/api.js
import axios from "axios";
import AuthService from "./auth.service";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: { "Content-Type": "application/json" },
});

// Public endpoints (no Authorization header). Only GET /reviews.
const NO_AUTH_RULES = [
    { method: "GET", test: (path) => /^\/reviews(?:\/|$)/.test(path) },
];

function shouldSkipAuth(config) {
    const method = (config.method || "GET").toUpperCase();

    // Figure out the path relative to /api
    let path = "";
    try {
        const full = new URL(config.url, api.defaults.baseURL);
        path = full.pathname.replace(/^\/api/, ""); // e.g. "/reviews"
    } catch {
        path = (config.url || "").replace(/^\/api/, "");
    }

    return NO_AUTH_RULES.some((rule) => rule.method === method && rule.test(path));
}

api.interceptors.request.use(
    (config) => {
        if (!shouldSkipAuth(config)) {
            const user = AuthService.getCurrentUser?.();
            if (user?.accessToken) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${user.accessToken}`;
            } else if (config.headers?.Authorization) {
                delete config.headers.Authorization; // ensure no stale header
            }
        } else if (config.headers?.Authorization) {
            delete config.headers.Authorization;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            try {
                AuthService.logout?.();
            } catch {}
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
