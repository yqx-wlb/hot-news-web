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

export function useYiYan() {
  const [yiyan, setYiyan] = useState<YiYanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchYiYan = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.vvhan.com/api/ian/rand?type=json"
      );
      const data: YiYanResponse = await response.json();

      if (data.success && data.data) {
        setYiyan(data.data);
        setError(null);
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
    fetchYiYan();

    // 每分钟更新一次
    const interval = setInterval(fetchYiYan, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { yiyan, loading, error, refresh: fetchYiYan };
}
