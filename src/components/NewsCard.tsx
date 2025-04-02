import React from "react";
import { Card, CardContent } from "./ui/card";
import type { NewsItem } from "../types/news";

interface NewsCardProps {
  news: NewsItem;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mx-2"
    >
      <Card className="group transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 backdrop-blur-sm bg-background/50 supports-[backdrop-filter]:bg-background/30">
        <CardContent className="py-2.5 px-3">
          <div className="flex gap-2.5">
            {news.index && (
              <div className="flex-none w-5 text-primary/70 font-medium text-xs pt-0.5">
                {String(news.index).padStart(2, "0")}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-medium leading-normal line-clamp-2 group-hover:text-primary transition-colors flex-1">
                  {news.title}
                </h3>
                {news.hot && (
                  <div className="flex items-center gap-1 flex-none">
                    <svg
                      className="w-3 h-3 text-primary/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                      />
                    </svg>
                    <span className="text-xs text-primary/70">{news.hot}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
};
