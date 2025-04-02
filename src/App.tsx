import { useEffect, useState } from "react";
import { NewsSection } from "./components/NewsSection";
import { MusicPlayer } from "./components/MusicPlayer";
import type { NewsSection as NewsSectionType } from "./types/news";
import { YiYan } from "./components/YiYan";

interface YiyanResponse {
  success: boolean;
  data: {
    content: string;
    from?: string;
  };
}

function App() {
  const [sections, setSections] = useState<NewsSectionType[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as "light" | "dark") || "dark";
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yiyan, setYiyan] = useState<{ content: string; from?: string } | null>(
    null
  );
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  useEffect(() => {
    const fetchYiyan = async () => {
      try {
        const response = await fetch(
          "https://api.vvhan.com/api/ian/rand?type=json"
        );
        const data: YiyanResponse = await response.json();
        if (data.success) {
          setYiyan(data.data);
        }
      } catch (error) {
        console.error("Error fetching yiyan:", error);
      }
    };

    fetchYiyan();
    // 每小时更新一次
    const interval = setInterval(fetchYiyan, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("https://api.vvhan.com/api/hotlist/all");
        const data = await response.json();
        if (!data.success) {
          throw new Error("获取数据失败");
        }
        setSections(data.data);
      } catch (error) {
        console.error("Error fetching news:", error);
        setError("获取数据失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-primary animate-pulse">摸鱼加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex flex-col py-2">
          <div className="flex h-8 items-center">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                摸鱼时刻
              </h1>
              <span className="text-xs text-muted-foreground">
                / 打工人的快乐源泉
              </span>
            </div>
            <div className="flex-1" />
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title={theme === "light" ? "切换到深色模式" : "切换到浅色模式"}
            >
              {theme === "light" ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between py-1 text-sm">
            <div className="flex items-center gap-2 text-xs">
              {yiyan && (
                <>
                  <span className="text-primary/70">『</span>
                  <span className="text-muted-foreground">{yiyan.content}</span>
                  <span className="text-primary/70">』</span>
                  {yiyan.from && (
                    <span className="text-muted-foreground/50">
                      —— {yiyan.from}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMusicPlayer(true)}
                className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                title="打开音乐播放器"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </button>
            </div>
          </div>
          <YiYan />
        </div>
      </header>
      <main className="flex-1 container max-w-[1440px] mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-card/30 backdrop-blur-xl rounded-xl p-3 sm:p-4 lg:h-[calc(100vh-8rem)] border"
            >
              <NewsSection section={section} />
            </div>
          ))}
        </div>
      </main>
      {showMusicPlayer && (
        <MusicPlayer onClose={() => setShowMusicPlayer(false)} />
      )}
    </div>
  );
}

export default App;
