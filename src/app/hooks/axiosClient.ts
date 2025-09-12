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
      console.log("Axios request:", config.method, config.url);
      return config;
    },
    (error) => {
      console.error("Axios request error:", error);
      return Promise.reject(error);
    }
  );

  axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(
        "Axios response success:",
        response.status,
        response.config.url
      );
      return response;
    },
    (error: AxiosError) => {
      console.error("Axios response error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
      });

      try {
        const { response } = error;
        if (response?.status === 401) {
          // Check if window is available (client-side only)
          if (typeof window !== "undefined") {
            // Store the current path before redirecting
            const currentPath = window.location.pathname;
            localStorage.setItem("pendingRedirect", currentPath);

            // Redirect to login
            const redirectUrl = `/?showLogin=true&reason=unauthorized&redirect=${encodeURIComponent(
              currentPath
            )}`;
            console.log("Redirecting due to 401:", redirectUrl);
            window.location.href = redirectUrl;
          }
        }
      } catch (e) {
        console.error("Error handling axios error:", e);
      }
      return Promise.reject(error);
    }
  );

  return axiosClient;
};

export default createAxiosClient;
