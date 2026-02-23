import axios from "axios";
import router from "@/router/index";
import { message } from "ant-design-vue";
const baseURL = import.meta.env.VITE_BASE_URL;

function getBaseURL() {
  if (import.meta.env.VITE_BASE_URL) return import.meta.env.VITE_BASE_URL
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  return `${protocol}://api-${hostname}`
}

const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000 * 10 * 100,
});

instance.interceptors.request.use(function (config) {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    if (error.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
      message.error("登录已过期，请重新登录");
    }
    return Promise.reject(error?.response?.data ?? error);
  },
);

export default instance;
