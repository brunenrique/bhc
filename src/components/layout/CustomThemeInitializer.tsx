"use client";

import { useEffect } from 'react';

// Manter esta chave e lista sincronizadas com settings/page.tsx
const CUSTOM_THEME_LS_KEY = 'psiguard-custom-theme';
const THEMES_CONFIG = [
  { name: 'Padrão (Azul/Lavanda)', class: '' },
  { name: 'Moderno (Teal/Laranja)', class: 'theme-modern' },
  { name: 'Cinza Claro', class: 'theme-light-gray' },
  { name: 'Lilás', class: 'theme-lilac' },
];
// Lista apenas das classes que são realmente adicionadas ao HTML (exclui a classe vazia do tema padrão)
const ALL_NAMED_CUSTOM_THEME_CLASSES = THEMES_CONFIG.map(t => t.class).filter(Boolean);

export function CustomThemeInitializer() {
  useEffect(() => {
    const savedThemeClass = localStorage.getItem(CUSTOM_THEME_LS_KEY); // Pode ser '', 'theme-modern', etc., ou null
    const htmlElement = document.documentElement;

    // Remove todas as classes de tema customizado nomeadas para começar limpo
    // antes de aplicar a correta.
    ALL_NAMED_CUSTOM_THEME_CLASSES.forEach(cls => {
      if (htmlElement.classList.contains(cls)) {
        htmlElement.classList.remove(cls);
      }
    });

    if (savedThemeClass !== null) {
      // Uma preferência de tema foi encontrada no localStorage.
      // Se for uma classe de tema customizado nomeada, adicione-a.
      // Se for uma string vazia (representando o tema padrão), nenhuma classe customizada é adicionada,
      // permitindo que os estilos base :root (sem classe de tema específica) sejam aplicados.
      if (savedThemeClass && ALL_NAMED_CUSTOM_THEME_CLASSES.includes(savedThemeClass)) {
        htmlElement.classList.add(savedThemeClass);
      }
      // Se savedThemeClass === '', nenhuma classe customizada é adicionada, o que é o comportamento correto para o tema padrão.
    } else {
      // Nenhuma preferência de tema no localStorage.
      // O tema padrão definido no className do <html> em src/app/layout.tsx (ex: "theme-lilac")
      // deve ser aplicado. Como já removemos todas as classes customizadas acima,
      // precisamos re-adicionar a padrão do servidor se ela não for a base (sem classe).
      // No nosso caso, RootLayout já tem "theme-lilac" no servidor. Se nenhuma preferência for encontrada,
      // e "theme-lilac" foi removida, devemos re-adicioná-la aqui.
      // Ou, se o tema padrão fosse o "sem classe", não faríamos nada aqui.
      // Como o padrão inicial é "theme-lilac" (uma classe nomeada):
      if (!ALL_NAMED_CUSTOM_THEME_CLASSES.some(cls => htmlElement.classList.contains(cls))) {
         htmlElement.classList.add('theme-lilac'); // Ou qualquer que seja o default do RootLayout
      }
    }
  }, []);

  return null; // Este componente não renderiza nada visualmente
}
