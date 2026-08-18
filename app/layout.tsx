import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Landing — Find your people",
  description:
    "Connect with other international students arriving at your campus the same month. Housing, furniture, admin — done together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
