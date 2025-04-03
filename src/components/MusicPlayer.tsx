import React, { useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";

interface MusicPlayerProps {
  onClose: () => void;
}

interface Song {
  name: string;
  artist: string;
  url: string;
  pic?: string;
  duration?: number;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ onClose }) => {
  const [minimized, setMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [pendingSong, setPendingSong] = useState<Song | null>(null);
  const [audio] = useState(new Audio());
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const MIN_DURATION = 120; // 最小时长2分钟（秒）
  const MAX_RETRIES = 3;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration);
  }, [audio]);

  const handleEnded = useCallback(async () => {
    await handleNext();
  }, []);

  const handleLoadedMetadata = useCallback(async () => {
    if (audio.duration < MIN_DURATION) {
      console.log(
        `跳过短音乐: ${pendingSong?.name}, 时长: ${audio.duration}秒`
      );
      await fetchMusic(true);
      return;
    }

    // 只有当音乐时长符合要求时才更新当前歌曲
    setDuration(audio.duration);
    if (pendingSong) {
      setCurrentSong(pendingSong);
      setPendingSong(null);
      setIsLoading(false);
      if (isPlaying) {
        audio.play();
      }
    }
  }, [pendingSong, isPlaying]);

  const fetchMusic = async (autoPlay = false) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://api.vvhan.com/api/wyMusic/飙升榜?type=json"
      );
      const data = await response.json();

      if (data.success) {
        const newSong = {
          name: data.info.name,
          artist: data.info.auther,
          url: data.info.url,
          pic: data.info.pic_url,
        };

        // 先设置为待处理歌曲
        setPendingSong(newSong);
        audio.src = newSong.url;

        if (autoPlay) {
          setIsPlaying(true);
        }

        setRetryCount(0);
        setError(null);
      } else {
        throw new Error("获取音乐失败");
      }
    } catch (error) {
      console.error("Error fetching music:", error);
      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
        await fetchMusic(autoPlay);
      } else {
        setError("多次尝试获取音乐失败，请手动切换下一首");
        setRetryCount(0);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [handleTimeUpdate, handleEnded, handleLoadedMetadata]);

  useEffect(() => {
    fetchMusic();
  }, []);

  useEffect(() => {
    if (currentSong && isPlaying && !isLoading) {
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
  }, [isPlaying, currentSong, isLoading]);

  const handlePlayPause = () => {
    if (error) {
      handleNext();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = async () => {
    setIsPlaying(false);
    setCurrentTime(0);
    await fetchMusic(true);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLoading) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleClose = useCallback(() => {
    setIsPlaying(false);
    audio.pause();
    audio.currentTime = 0;
    onClose();
  }, [onClose]);

  // 只在有当前歌曲时显示控件
  const showControls = currentSong && !isLoading;

  return (
    <Card
      className={`fixed bottom-4 right-4 bg-background/95 backdrop-blur-lg shadow-lg transition-all duration-300 overflow-hidden ${
        minimized ? "w-16 h-16 p-0" : "w-80 p-4"
      }`}
      style={{
        WebkitTapHighlightColor: "transparent",
        WebkitTouchCallout: "none",
        userSelect: "none",
        "-webkit-user-select": "none",
      }}
    >
      {minimized ? (
        <div
          className="w-full h-full relative cursor-pointer select-none touch-none"
          onClick={() => setMinimized(false)}
          style={{
            WebkitTapHighlightColor: "transparent",
            WebkitTouchCallout: "none",
            userSelect: "none",
            "-webkit-user-select": "none",
          }}
        >
          {showControls && currentSong.pic && (
            <img
              src={currentSong.pic}
              alt={currentSong.name}
              className={`absolute inset-0 w-full h-full object-cover ${
                isPlaying ? "animate-spin-slow" : ""
              }`}
              style={{ animationDuration: "8s" }}
              draggable={false}
            />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            {isLoading ? (
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors select-none touch-none"
                disabled={!showControls}
                style={{
                  WebkitTapHighlightColor: "transparent",
                  WebkitTouchCallout: "none",
                  userSelect: "none",
                  "-webkit-user-select": "none",
                }}
              >
                {isPlaying ? (
                  <svg
                    className="w-6 h-6 text-white select-none"
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
                    className="w-6 h-6 text-white select-none"
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
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between h-8">
            <h3 className="font-medium select-none">
              {isLoading ? "加载中..." : "正在播放"}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMinimized(true)}
                className="p-1.5 rounded-md transition-colors text-muted-foreground select-none touch-none"
                title="最小化"
                style={{
                  WebkitTapHighlightColor: "transparent",
                  WebkitTouchCallout: "none",
                  userSelect: "none",
                  "-webkit-user-select": "none",
                }}
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
                onClick={handleClose}
                className="p-1.5 rounded-md transition-colors text-muted-foreground select-none touch-none"
                title="关闭"
                style={{
                  WebkitTapHighlightColor: "transparent",
                  WebkitTouchCallout: "none",
                  userSelect: "none",
                  "-webkit-user-select": "none",
                }}
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
          {showControls ? (
            <div className="mt-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayPause}
                  className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden transition-opacity select-none touch-none"
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    WebkitTouchCallout: "none",
                    userSelect: "none",
                    "-webkit-user-select": "none",
                  }}
                >
                  {currentSong.pic ? (
                    <img
                      src={currentSong.pic}
                      alt={currentSong.name}
                      className={`w-full h-full object-cover select-none ${
                        isPlaying ? "animate-spin-slow" : ""
                      }`}
                      style={{ animationDuration: "8s" }}
                      draggable={false}
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-primary/10 flex items-center justify-center select-none ${
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
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    {isPlaying ? (
                      <svg
                        className="w-8 h-8 text-white select-none"
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
                        className="w-8 h-8 text-white select-none"
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
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate select-none">
                    {currentSong.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate mt-0.5 select-none">
                    {currentSong.artist}
                  </p>
                  {error && (
                    <p className="text-xs text-red-500 truncate mt-0.5 select-none">
                      {error}
                    </p>
                  )}
                  <div className="mt-2">
                    <div
                      className="h-1 bg-accent rounded-full overflow-hidden cursor-pointer select-none touch-none"
                      onClick={handleSeek}
                      style={{
                        WebkitTapHighlightColor: "transparent",
                        WebkitTouchCallout: "none",
                        userSelect: "none",
                        "-webkit-user-select": "none",
                      }}
                    >
                      <div
                        className="h-full bg-primary transition-all duration-150"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground select-none">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-md transition-colors text-muted-foreground select-none touch-none"
                  title="下一首"
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    WebkitTouchCallout: "none",
                    userSelect: "none",
                    "-webkit-user-select": "none",
                  }}
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
                      d="M13 5l9 7-9 7V5zM2 5l9 7-9 7V5z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center h-16">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </>
      )}
    </Card>
  );
};
