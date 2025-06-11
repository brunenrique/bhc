import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes"; 

export const metadata: Metadata = {
  title: 'PsiGuard - Gestão de Clínica Psicológica',
  description: 'Sistema de gestão para clínicas de psicologia',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Aplicando 'theme-lilac' como classe padrão inicial.
    // A lógica no AppLayout (via settings ou useEffect) poderá sobrescrever isso com a preferência do usuário.
    <html lang="pt-BR" suppressHydrationWarning className="theme-lilac">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system" // next-themes gerencia light/dark
          enableSystem
          disableTransitionOnChange
          // O ThemeProvider do next-themes não gerenciará nossas classes de tema customizadas diretamente.
          // Faremos isso manualmente no AppLayout e Settings.
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
