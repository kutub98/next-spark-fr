// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const urls = [
    { loc: "https://e-commerce-shop-ozeh.vercel.app//" },
    { loc: "https://e-commerce-shop-ozeh.vercel.app//products" },
    { loc: "https://e-commerce-shop-ozeh.vercel.app//checkout" },
    // You can fetch all dynamic product pages from DB/API here
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        ({ loc }) => `
      <url>
        <loc>${loc}</loc>
      </url>
    `
      )
      .join("")}
  </urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
