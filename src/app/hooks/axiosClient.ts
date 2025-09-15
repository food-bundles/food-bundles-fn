// Frontend Axios Client - Token-Based
import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";

// Utility functions for token management
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
};

const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
};

const createAxiosClient = (): AxiosInstance => {
  const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
    // Remove withCredentials as we don't use cookies anymore
    withCredentials: false,
  });

  axiosClient.interceptors.request.use(
    (config) => {
      // Add Authorization header with token
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      try {
        const { response } = error;
        if (response?.status === 401) {
          // Remove token on 401 error
          removeToken();
          window.location.href = "/login";
        }
      } catch (e) {
        console.error("Axios Error", e);
      }
      return Promise.reject(error);
    }
  );

  return axiosClient;
};

// Export token management functions
export { getToken, setToken, removeToken };
export default createAxiosClient;
