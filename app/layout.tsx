import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./components/Header";
import { FloatingActionButton } from "./components/FloatingActionButton";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Mikines Kitchen",
  description: "Your personal recipe keeper",
  other: {
    "darkreader-lock": "true",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen pb-20 transition-colors">
        <Providers>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <FloatingActionButton />
        </Providers>
      </body>
    </html>
  );
}
