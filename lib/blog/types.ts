export type BlogCategory = "clientes" | "prestadores";

export type BlogSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  category: BlogCategory;
  readTimeMin: number;
  sections: BlogSection[];
  keywords?: string[];
};
