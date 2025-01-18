import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plant Doc",
  description:
    "Plant Doc is a tool that helps you diagnose your plants based on a picture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${onest.className} antialiased dark`}
      >
        <Toaster theme="dark" />
        {children}
      </body>
    </html>
  );
}
