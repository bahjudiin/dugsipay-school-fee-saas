import type { Metadata, Viewport } from "next";
import "./globals.css";
import ToastViewport from "@/components/Toast";
import SWRegister from "@/components/SWRegister";

export const viewport: Viewport = {
  themeColor: "#0066cc",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "DugsiPAY — School Fee Management for Somali Schools",
    template: "%s · DugsiPAY",
  },
  description:
    "Stop chasing school fees in notebooks. DuqsiPay tracks students, payments, receipts and WhatsApp/SMS fee reminders for Somali schools — from $15/month.",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastViewport />
        <SWRegister />
      </body>
    </html>
  );
}
