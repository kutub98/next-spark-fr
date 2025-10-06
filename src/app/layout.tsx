// src/app/layout.tsx
import Providers from "@/providers/ReduxProvider";
import "@/styles/globals.css";
import { Toaster } from "sonner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "কুইজ প্রতিযোগিতা",
  description: "অনলাইন কুইজ প্রতিযোগিতা প্ল্যাটফর্ম",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="bn">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        />
      </head>
      <body className="bg-white font-roboto">
        <Providers>
          <Toaster />
          {children}
        </Providers>
        <div id="portal"></div>
      </body>
    </html>
  );
}