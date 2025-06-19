import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import PropTypes from 'prop-types';
import { CustomThemeInitializer } from '@/components/layout/CustomThemeInitializer'; // Importado

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
    // Aplicando 'theme-modern' como classe padrão inicial.
    // CustomThemeInitializer cuidará de aplicar a preferência do usuário do localStorage.
    <html lang="pt-BR" suppressHydrationWarning className="theme-modern">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // Alterado de "system" para "light"
          enableSystem
          disableTransitionOnChange
        >
          <CustomThemeInitializer />
          {children || <div>Conteúdo não disponível</div>}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.element.isRequired,
};
