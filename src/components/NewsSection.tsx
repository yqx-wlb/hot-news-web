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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium">{section.name}</h2>
          {section.subtitle && (
            <span className="text-sm text-muted-foreground">
              {section.subtitle}
            </span>
          )}
        </div>
        {section.update_time && (
          <span className="text-xs text-muted-foreground">
            {section.update_time}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-2">
          {section.data.map((news, index) => (
            <NewsCard key={index} news={{ ...news, index: index + 1 }} />
          ))}
        </div>
      </div>
    </div>
  );
};
