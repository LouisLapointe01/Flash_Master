import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { DemoProvider } from "@/lib/demo/context";
import "./globals.css";

const titleFont = Fraunces({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flash Master",
  description: "Flashcards et quizzes pour apprendre efficacement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${titleFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
