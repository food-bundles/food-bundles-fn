// Frontend Axios Client - Cookie-Based
import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { ROLE_ROUTES, buildLoginUrl } from "@/lib/navigations";

// Several requests can 401 at once — redirect only once
let redirectingToLogin = false;

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
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
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
      // Session expired mid-use: send to login and come back here afterwards.
      // Only when a token was sent and we're on a protected page — so wrong-password
      // 401s on /login and public pages never redirect (no loops).
      const sentToken = Boolean(error.config?.headers?.Authorization);
      if (
        error.response?.status === 401 &&
        sentToken &&
        typeof window !== "undefined" &&
        !redirectingToLogin &&
        Object.keys(ROLE_ROUTES).some((route) =>
          window.location.pathname.startsWith(route)
        )
      ) {
        redirectingToLogin = true;
        removeToken();
        document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        localStorage.removeItem("user");
        window.location.href = buildLoginUrl("expired");
      }
      return Promise.reject(error);
    }
  );

  return axiosClient;
};

export { getToken, setToken, removeToken };
export default createAxiosClient;
