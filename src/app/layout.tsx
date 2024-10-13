import { ProviderAntd } from "@/lib/ProviderAntd";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Demo Streaming App",
  description: "Streaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ProviderAntd>
        <body className={inter.className}>{children}</body>
      </ProviderAntd>
    </html>
  );
}
