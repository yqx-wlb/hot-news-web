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
      className="block p-3 rounded-lg hover:bg-black/5 transition-colors"
    >
      <div className="flex items-center gap-3">
        {item.index && (
          <span className="text-sm font-medium text-gray-500">
            {item.index}
          </span>
        )}
        <h3 className="flex-1 text-sm">{item.title}</h3>
        {item.hot && <span className="text-xs text-gray-400">{item.hot}</span>}
      </div>
    </a>
  );
}
