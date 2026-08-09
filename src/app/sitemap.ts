import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const publicRoutes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/practice", changeFrequency: "weekly", priority: 0.9 },
    { path: "/learn", changeFrequency: "weekly", priority: 0.9 },
    { path: "/expert", changeFrequency: "weekly", priority: 0.9 },
    { path: "/leaderboard", changeFrequency: "daily", priority: 0.7 },
    { path: "/login", changeFrequency: "monthly", priority: 0.4 },
  ];

  return publicRoutes.map((route) => ({
    url: route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
