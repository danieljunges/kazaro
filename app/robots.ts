import type { MetadataRoute } from "next";
import { getAdminPanelBasePath } from "@/lib/admin/panel-path";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const staff = getAdminPanelBasePath();
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: [staff] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
