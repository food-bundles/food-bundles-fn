// Frontend Axios Client - Cookie-Based
import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";

const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "auth-token") {
        return decodeURIComponent(value);
      }
    }
  }
  return null;
};

const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    const isProduction = process.env.NODE_ENV === "production";
    const secureAttribute = isProduction ? "secure;" : "";
    document.cookie = `auth-token=${encodeURIComponent(
      token
    )}; path=/; max-age=86400; ${secureAttribute} samesite=lax`;
  }
};

const removeToken = (): void => {
  if (typeof window !== "undefined") {
    const isProduction = process.env.NODE_ENV === "production";
    const secureAttribute = isProduction ? "secure;" : "";
    document.cookie = `auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${secureAttribute} samesite=lax`;
  }
};

const createAxiosClient = (): AxiosInstance => {
  const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "https://server.food.rw",
    timeout: 50000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: false,
  });

  axiosClient.interceptors.request.use(
    (config) => {
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

export { getToken, setToken, removeToken };
export default createAxiosClient;
