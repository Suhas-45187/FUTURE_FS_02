import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT token to protected API requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("novacrm_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Admin login
export const loginAdmin = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

// Lead operations
export const getLeads = async () => {
  const response = await api.get("/leads");
  return response.data;
};

export const createLead = async (leadData) => {
  const response = await api.post("/leads", leadData);
  return response.data;
};

export const updateLead = async (id, leadData) => {
  const response = await api.put(`/leads/${id}`, leadData);
  return response.data;
};

export const deleteLead = async (id) => {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
};

export default api;