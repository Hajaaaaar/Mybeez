import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

const signup = (firstName, lastName, email, password) => {
    const normalisedEmail = email.trim().toLowerCase();
    return axios.post(API_URL + "signup", { firstName, lastName, email: normalisedEmail, password });
};

const login = (email, password) => {
    const normalisedEmail = email.trim().toLowerCase();
    return axios.post(API_URL + "login", { email: normalisedEmail, password }).then((response) => {
        const data = response.data;
        if (data?.accessToken) {
            localStorage.setItem("user", JSON.stringify(data));
        }
        return data;
    });
};

const logout = () => {
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    try {
        const stored = JSON.parse(localStorage.getItem("user"));
        return stored || null;
    } catch {
        return null;
    }
};

const me = () => axios.get(API_URL + "me").then((r) => r.data);

const getToken = () => getCurrentUser()?.accessToken || null;
const isAdmin = () => (getCurrentUser()?.role === "ADMIN");
const isHost = () => (getCurrentUser()?.role === "HOST");

const AuthService = {
    signup,
    login,
    logout,
    getCurrentUser,
    getToken,
    me,
    isAdmin,
    isHost,
};

export default AuthService;