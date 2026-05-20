import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOEIC Writing Mock Test",
  description:
    "Practice your TOEIC Writing skills with AI-powered feedback and scoring. Simulate the real exam experience with timed tests and detailed analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-gradient-animated">
        {children}
      </body>
    </html>
  );
}
