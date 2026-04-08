import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduKard — Tuition Finance for International Students",
  description:
    "EduKard provides instant, fair tuition financing for employed international students in Canada. No credit score needed — powered by real-world asset (RWA) protocol.",
  keywords: ["tuition financing", "international students", "Canada", "student loans", "RWA", "fintech"],
  authors: [{ name: "Arkad Technologies" }],
  openGraph: {
    title: "EduKard — Tuition Finance for International Students",
    description: "Instant tuition financing. No credit score needed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
