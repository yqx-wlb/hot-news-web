import axios from "axios";
import type { ApiResponse } from "../types/news";

const api = axios.create({
  baseURL: "https://api.vvhan.com/api",
});

export const fetchNews = async (): Promise<ApiResponse> => {
  const { data } = await api.get<ApiResponse>("/hotlist/all");

  // 打印原始数据，用于调试
  console.log("API Response:", data);

  // 确保数据格式正确
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error("API 返回数据格式错误");
  }

  return data;
};
