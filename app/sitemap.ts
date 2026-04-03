import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();
  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/search`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/para-profissionais`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/pro`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/sobre`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/ajuda`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contato`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/carreiras`, lastModified, changeFrequency: "monthly", priority: 0.45 },
    { url: `${base}/garantia`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/entrar`, lastModified, changeFrequency: "monthly", priority: 0.45 },
    { url: `${base}/criar-conta`, lastModified, changeFrequency: "monthly", priority: 0.45 },
    { url: `${base}/privacidade`, lastModified, changeFrequency: "yearly", priority: 0.35 },
    { url: `${base}/cookies`, lastModified, changeFrequency: "yearly", priority: 0.35 },
    { url: `${base}/termos`, lastModified, changeFrequency: "yearly", priority: 0.35 },
  ];
}
