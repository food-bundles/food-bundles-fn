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

export default createAxiosClient;
