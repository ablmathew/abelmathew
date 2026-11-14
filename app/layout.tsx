import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ablmathew.github.io/abelmathew/"),
  title: "Abel Mathew | Cybersecurity & UI/UX Portfolio",
  description:
    "Explore the portfolio, projects, and writing of Abel Mathew, also known as ablmathew.",
  alternates: {
    canonical: "https://ablmathew.github.io/abelmathew/",
  },
  openGraph: {
    title: "Abel Mathew | Cybersecurity & UI/UX Portfolio",
    description:
      "Explore the portfolio, projects, and writing of Abel Mathew, also known as ablmathew.",
    url: "https://ablmathew.github.io/abelmathew/",
    siteName: "Abel Mathew Portfolio",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

