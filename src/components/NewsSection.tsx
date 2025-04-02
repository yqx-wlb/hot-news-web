import React from "react";
import type { NewsSection as NewsSectionType } from "../types/news";
import { NewsCard } from "./NewsCard";

interface NewsSectionProps {
  section: NewsSectionType;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ section }) => {
  if (!section || !section.data) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">{section.name}</h2>
          {section.subtitle && (
            <p className="text-sm text-gray-500">{section.subtitle}</p>
          )}
        </div>
        {section.update_time && (
          <span className="text-xs text-gray-400">{section.update_time}</span>
        )}
      </div>

      <div className="flex-1 lg:overflow-y-auto overflow-visible">
        <div className="space-y-4">
          {section.data.map((item: NewsItem, index: number) => (
            <NewsCard key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
