import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ScatterBrainAI - Turn scattered thoughts into compelling content",
  description: "Transform your scattered thoughts into polished social content with AI. Capture ideas, generate platform-perfect posts, and never lose brilliant insights again. 7-day free trial.",
  keywords: "AI content generation, thought organization, social media content, ADHD productivity, content creation tool",
  openGraph: {
    title: "ScatterBrainAI - Your Cognitive Infrastructure",
    description: "Turn scattered thoughts into compelling social content",
    type: "website",
    url: "https://scatterbrainai.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScatterBrainAI",
    description: "Turn scattered thoughts into compelling social content",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
