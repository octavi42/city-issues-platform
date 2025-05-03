import "./globals.css";
import "@/components/examples/DetachedSheet/DetachedSheet.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import FloatingButton from "./components/FloatingButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Silk Examples CSS",
  description: "Native-like swipeable sheets on the web",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};
export const viewport: Viewport = {
  themeColor: "rgb(255, 255, 255)",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
  cat_modal,
  iss_modal,
}: {
  children: React.ReactNode;
  cat_modal: React.ReactNode;
  iss_modal: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        <FloatingButton />
        {children}
        {cat_modal}
        {iss_modal}
      </body>
    </html>
  );
}
