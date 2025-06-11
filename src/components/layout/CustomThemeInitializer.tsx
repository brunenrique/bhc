"use client";

import { useEffect } from 'react';

// Manter esta chave e lista sincronizadas com settings/page.tsx
const CUSTOM_THEME_LS_KEY = 'psiguard-custom-theme';
const THEMES_CONFIG = [
  { name: 'Padrão (Azul/Lavanda)', class: '' }, // Representa o tema base sem classe adicional
  { name: 'Moderno (Teal/Laranja)', class: 'theme-modern' },
  { name: 'Cinza Claro', class: 'theme-light-gray' },
  { name: 'Lilás', class: 'theme-lilac' },
];
const ALL_NAMED_CUSTOM_THEME_CLASSES = THEMES_CONFIG.map(t => t.class).filter(Boolean);

export function CustomThemeInitializer() {
  useEffect(() => {
    const savedThemeClass = localStorage.getItem(CUSTOM_THEME_LS_KEY); // Pode ser '', 'theme-modern', etc., ou null
    const htmlElement = document.documentElement;

    // Remove todas as classes de tema customizado nomeadas para garantir um estado limpo
    // antes de aplicar a classe correta.
    ALL_NAMED_CUSTOM_THEME_CLASSES.forEach(cls => {
      if (htmlElement.classList.contains(cls)) {
        htmlElement.classList.remove(cls);
      }
    });

    if (savedThemeClass !== null) {
      // Preferência de tema encontrada no localStorage.
      // Se for uma classe de tema customizado nomeada, adicione-a.
      // Se for uma string vazia (representando o tema padrão), nenhuma classe customizada é adicionada.
      if (savedThemeClass && ALL_NAMED_CUSTOM_THEME_CLASSES.includes(savedThemeClass)) {
        htmlElement.classList.add(savedThemeClass);
      }
    } else {
      // Nenhuma preferência de tema no localStorage. Aplicar o tema padrão "Moderno".
      // A classe 'theme-modern' já deve estar no <html> devido à renderização do servidor,
      // mas garantimos aqui caso tenha sido removida ou alterada por outra lógica.
      if (!htmlElement.classList.contains('theme-modern')) {
         htmlElement.classList.add('theme-modern');
      }
    }
  }, []);

  return null; // Este componente não renderiza nada visualmente
}
