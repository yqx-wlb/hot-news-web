import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";

interface MusicPlayerProps {
  onClose: () => void;
}

interface Song {
  name: string;
  artist: string;
  url: string;
  pic?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ onClose }) => {
  const [minimized, setMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [audio] = useState(new Audio());
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchMusic = async (isRetry = false) => {
    try {
      setError(null);
      const response = await fetch(
        "https://api.vvhan.com/api/wyMusic/飙升榜?type=json"
      );
      const data = await response.json();
      if (data.success) {
        setCurrentSong({
          name: data.info.name,
          artist: data.info.auther,
          url: data.info.url,
          pic: data.info.pic_url,
        });
        audio.src = data.info.url;
        if (isRetry) {
          setIsPlaying(true);
        }
        setRetryCount(0); // 重置重试计数
      } else {
        throw new Error("获取音乐失败");
      }
    } catch (error) {
      console.error("Error fetching music:", error);
      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
        setError(`获取音乐失败，正在尝试第${retryCount + 1}次重试...`);
        await fetchMusic(true);
      } else {
        setError("多次尝试获取音乐失败，请手动切换下一首");
        setRetryCount(0);
      }
    }
  };

  useEffect(() => {
    fetchMusic();
  }, []);

  useEffect(() => {
    if (currentSong) {
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(async (error) => {
            console.error("播放失败:", error);
            setError("播放失败，正在尝试下一首...");
            await fetchMusic(true);
          });
        }
      } else {
        audio.pause();
      }
    }
    return () => {
      audio.pause();
    };
  }, [isPlaying, currentSong]);

  const handlePlayPause = () => {
    if (error) {
      handleNext();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = async () => {
    setIsPlaying(false);
    await fetchMusic(true);
  };

  return (
    <Card
      className={`fixed bottom-4 right-4 bg-background/95 backdrop-blur-lg shadow-lg transition-all duration-300 overflow-hidden ${
        minimized ? "w-16 h-16 p-0" : "w-80 p-4"
      }`}
    >
      {minimized ? (
        <div
          className="w-full h-full relative group cursor-pointer"
          onClick={() => setMinimized(false)}
        >
          {currentSong?.pic ? (
            <img
              src={currentSong.pic}
              alt={currentSong.name}
              className={`w-full h-full object-cover ${
                isPlaying ? "animate-spin-slow" : ""
              }`}
              style={{ animationDuration: "8s" }}
            />
          ) : (
            <div
              className={`w-full h-full bg-primary/10 flex items-center justify-center ${
                isPlaying ? "animate-spin-slow" : ""
              }`}
            >
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19V5l12 7-12 7z"
                />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="text-white"
            >
              {isPlaying ? (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 6h2v12H8V6zm6 0h2v12h-2V6z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l12 7-12 7V5z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between h-8">
            <h3 className="font-medium">正在播放</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMinimized(true)}
                className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                title="最小化"
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
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                title="关闭"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          {currentSong && (
            <div className="mt-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  {currentSong.pic ? (
                    <img
                      src={currentSong.pic}
                      alt={currentSong.name}
                      className={`w-full h-full rounded-xl object-cover ${
                        isPlaying ? "animate-spin-slow" : ""
                      }`}
                      style={{ animationDuration: "8s" }}
                    />
                  ) : (
                    <div
                      className={`w-full h-full rounded-xl bg-primary/10 flex items-center justify-center ${
                        isPlaying ? "animate-spin-slow" : ""
                      }`}
                    >
                      <svg
                        className="w-8 h-8 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 19V5l12 7-12 7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {currentSong.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-1">
                    {currentSong.artist}
                  </div>
                </div>
              </div>
              {error && (
                <div className="text-xs text-destructive mt-2 text-center">
                  {error}
                </div>
              )}
              <div className="flex items-center justify-center gap-6 mt-4">
                <button
                  onClick={handlePlayPause}
                  className="p-2 hover:bg-accent rounded-full transition-colors text-primary hover:text-primary/80"
                  title={isPlaying ? "暂停" : "播放"}
                >
                  {isPlaying ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 6h2v12H8V6zm6 0h2v12h-2V6z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5l12 7-12 7V5z"
                      />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleNext(true)}
                  className="p-2 hover:bg-accent rounded-full transition-colors text-primary hover:text-primary/80"
                  title="下一首"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5l7 7-7 7M17 5v14"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
