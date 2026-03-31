export type BlogBody = string | Record<string, unknown> | Array<unknown>;

export interface BlogPost {
  title: string;
  slug: string;
  image?: string;
  date: string;
  author?: string;
  tags: string[];
  excerpt?: string;
  body: BlogBody;
}

export interface SiteSettings {
  site_title: string;
  description?: string;
}