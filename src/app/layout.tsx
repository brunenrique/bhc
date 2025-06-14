"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import usePageView from "@/hooks/use-page-view";
import useSessionTimeout from "@/hooks/use-session-timeout";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase";
import { useRouter } from "next/navigation";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  usePageView();
  const router = useRouter();
  useSessionTimeout(async () => {
    await signOut(auth);
    router.push("/login");
  });
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" key="google-fonts-preconnect" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" key="google-fonts-gstatic" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" key="google-fonts-inter" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" key="google-fonts-space-grotesk" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
