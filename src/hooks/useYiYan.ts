import { useState, useEffect } from "react";

interface YiYanData {
  id: number;
  content: string;
  form: string;
  creator: string;
}

interface YiYanResponse {
  success: boolean;
  type: string;
  data: YiYanData;
}

const STORAGE_KEY = "yiyan-last-update";
const ONE_HOUR = 60 * 60 * 1000; // 1小时的毫秒数

export function useYiYan() {
  const [yiyan, setYiyan] = useState<YiYanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shouldUpdate = () => {
    const lastUpdate = localStorage.getItem(STORAGE_KEY);
    if (!lastUpdate) return true;

    const timeDiff = Date.now() - parseInt(lastUpdate, 10);
    return timeDiff >= ONE_HOUR;
  };

  const fetchYiYan = async (force = false) => {
    if (!force && !shouldUpdate()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "https://api.vvhan.com/api/ian/rand?type=json"
      );
      const data: YiYanResponse = await response.json();

      if (data.success && data.data) {
        setYiyan(data.data);
        setError(null);
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      } else {
        setError("获取一言失败");
      }
    } catch (err) {
      setError("获取一言时发生错误");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 从本地存储恢复上次的一言
    const savedYiYan = localStorage.getItem("yiyan-data");
    if (savedYiYan) {
      try {
        const parsed = JSON.parse(savedYiYan);
        setYiyan(parsed);
        setLoading(false);
      } catch (e) {
        console.error("解析保存的一言数据失败:", e);
      }
    }

    fetchYiYan();

    // 每小时检查一次是否需要更新
    const interval = setInterval(() => {
      if (shouldUpdate()) {
        fetchYiYan();
      }
    }, 60 * 1000); // 每分钟检查一次，但只有在满足条件时才会实际更新

    return () => clearInterval(interval);
  }, []);

  // 保存新的一言到本地存储
  useEffect(() => {
    if (yiyan) {
      localStorage.setItem("yiyan-data", JSON.stringify(yiyan));
    }
  }, [yiyan]);

  const refresh = () => fetchYiYan(true);

  return { yiyan, loading, error, refresh };
}
