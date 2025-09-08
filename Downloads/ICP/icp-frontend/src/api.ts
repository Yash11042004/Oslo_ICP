import axios from "axios";
import { getAccess, getRefresh, setTokens, clearTokens } from "./auth";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

// attach access token
API.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// auto-refresh on 401
let refreshing = false;
let queue: Array<(t: string) => void> = [];

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      if (refreshing) {
        // queue the request until refresh completes
        return new Promise((resolve) => {
          queue.push((newToken: string) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(API(original));
          });
        });
      }
      original._retry = true;
      refreshing = true;
      try {
        const refreshToken = getRefresh();
        if (!refreshToken) throw new Error("No refresh token");
        const resp = await axios.post("http://localhost:8000/auth/refresh", {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token } = resp.data;
        setTokens(access_token, refresh_token);
        original.headers.Authorization = `Bearer ${access_token}`;
        // flush queue
        queue.forEach((fn) => fn(access_token));
        queue = [];
        return API(original);
      } catch (e) {
        clearTokens();
        queue = [];
        window.location.href = "/login";
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default API;
