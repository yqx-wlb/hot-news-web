import React from "react";
import { Card, CardContent } from "./ui/card";
import type { NewsItem } from "../types/news";

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-2.5 sm:p-3 rounded-lg hover:bg-accent active:bg-accent/70 transition-colors"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {item.index && (
          <span className="text-xs sm:text-sm font-medium text-primary/70 tabular-nums">
            {String(item.index).padStart(2, "0")}
          </span>
        )}
        <h3 className="flex-1 text-xs sm:text-sm leading-normal text-foreground">
          {item.title}
        </h3>
        {item.hot && (
          <span className="text-[10px] sm:text-xs text-primary/50 tabular-nums">
            {item.hot}
          </span>
        )}
      </div>
    </a>
  );
}
