import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";

const createAxiosClient = (): AxiosInstance => {
  const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  axiosClient.interceptors.request.use(
    (config) => {
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
          // Check if window is available (client-side only)
          if (typeof window !== "undefined") {
            window.location.href = `/?showLogin=true&reason=invalid&redirect=${encodeURIComponent(
              window.location.pathname
            )}`;
          }
        }
      } catch (e) {
        console.error("Axios Error", e);
      }
      return Promise.reject(error);
    }
  );

  return axiosClient;
};

export default createAxiosClient;
