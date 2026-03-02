import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { getBaseUrl } from "@/lib/utils";

const rubik = Rubik({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "1PageMe | Build your professional resume in minutes",
    template: "%s | 1PageMe",
  },
  description:
    "The fastest way to build a professional, recruiter-approved resume. Optimized for one-page layouts but supports any length. Free AI-powered import.",
  keywords: [
    "resume builder",
    "one-page resume",
    "onepage me",
    "1page me",
    "cv maker",
    "ai resume",
    "career",
    "jobs",
  ],
  authors: [{ name: "1PageMe Team" }],
  creator: "1PageMe",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: getBaseUrl(),
    title: "1PageMe | Build your professional resume in minutes",
    description:
      "The fastest way to build a professional, recruiter-approved resume. Optimized for one-page layouts with intelligent formatting.",
    siteName: "1PageMe",
  },
  twitter: {
    card: "summary_large_image",
    title: "1PageMe | Build your professional resume in minutes",
    description:
      "The fastest way to build a professional, recruiter-approved resume.",
    creator: "@1PageMe",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    title: "1PageMe",
    statusBarStyle: "default",
    capable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={rubik.className}>
        <Toaster position="bottom-right" />
        {children}
      </body>
    </html>
  );
}
