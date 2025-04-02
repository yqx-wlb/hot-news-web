export interface NewsItem {
  title: string;
  url: string;
  hot?: string | number;
  index?: number;
  type?: string;
}

export interface NewsSection {
  name: string;
  subtitle?: string;
  update_time?: string;
  data: NewsItem[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data: NewsSection[];
}
