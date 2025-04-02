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
      <div className="flex items-center justify-between mb-2 sm:mb-4 sticky top-0 bg-background/80 backdrop-blur-sm -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 rounded-t-xl border-b">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-primary">
            {section.name}
          </h2>
          {section.subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {section.subtitle}
            </p>
          )}
        </div>
        {section.update_time && (
          <span className="text-[10px] sm:text-xs text-muted-foreground/70 ml-2">
            {section.update_time}
          </span>
        )}
      </div>

      <div className="min-h-[50vh] lg:min-h-0 lg:h-full overflow-y-auto -mx-3 sm:-mx-4 px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="space-y-2 sm:space-y-4">
          {section.data?.map((item: NewsItem, index: number) => (
            <NewsCard key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
