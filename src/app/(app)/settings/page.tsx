
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Loader2, Save, UserCircle, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch"; 
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme as useNextTheme } from 'next-themes'; // For light/dark mode toggle

// Theme definitions
const THEMES = [
  { name: 'Padrão (Azul/Lavanda)', class: '' }, // Default, no extra class
  { name: 'Moderno (Teal/Laranja)', class: 'theme-modern' },
  { name: 'Cinza Claro', class: 'theme-light-gray' },
  { name: 'Lilás', class: 'theme-lilac' },
];
const CUSTOM_THEME_LS_KEY = 'psiguard-custom-theme';
const ALL_CUSTOM_THEME_CLASSES = THEMES.map(t => t.class).filter(Boolean);

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { theme: nextThemeMode, setTheme: setNextThemeMode } = useNextTheme(); // For light/dark

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCustomTheme, setSelectedCustomTheme] = useState<string>('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
    // Load custom theme preference
    const savedCustomTheme = localStorage.getItem(CUSTOM_THEME_LS_KEY);
    if (savedCustomTheme && ALL_CUSTOM_THEME_CLASSES.includes(savedCustomTheme)) {
      setSelectedCustomTheme(savedCustomTheme);
    } else {
      // Fallback to the default theme class from RootLayout or CSS if nothing is saved.
      // For the select, if it's "Padrão", the class is empty.
      const currentHtmlClass = document.documentElement.className;
      const activeTheme = THEMES.find(t => t.class && currentHtmlClass.includes(t.class));
      setSelectedCustomTheme(activeTheme?.class || '');
    }
  }, [user]);

  const getInitials = (nameStr: string) => {
    const names = nameStr.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '';
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  }

  const handleCustomThemeChange = (newThemeClass: string) => {
    setSelectedCustomTheme(newThemeClass);
    const htmlElement = document.documentElement;

    // Remove all known custom theme classes
    ALL_CUSTOM_THEME_CLASSES.forEach(cls => htmlElement.classList.remove(cls));

    // Add the new one if it's not the default (empty class)
    if (newThemeClass) {
      htmlElement.classList.add(newThemeClass);
    }
    localStorage.setItem(CUSTOM_THEME_LS_KEY, newThemeClass);
    toast({
        title: "Tema Alterado",
        description: `O tema da aplicação foi alterado.`,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call to save settings
    // console.log("Saving settings:", { name, email, enableNotifications, selectedCustomTheme });
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Note: Custom theme is already saved to localStorage by handleCustomThemeChange
    setIsSaving(false);
    toast({
        title: "Configurações Salvas",
        description: "Suas preferências de perfil e notificações foram atualizadas.",
    });
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-headline font-semibold">Configurações</h1>
      
      <form onSubmit={handleSave}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Perfil do Usuário</CardTitle>
            <CardDescription>Atualize suas informações pessoais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatarUrl || ''} alt={name} data-ai-hint="person avatar" />
                <AvatarFallback className="text-2xl">
                  {user ? getInitials(name) : <UserCircle />}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" type="button">Alterar Foto</Button> {/* Placeholder */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSaving} />
              </div>
            </div>
            
            <div className="space-y-1.5">
                <Label htmlFor="role">Função</Label>
                <Input id="role" type="text" value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} disabled className="capitalize bg-muted/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Preferências de Aparência e Notificações</CardTitle>
            <CardDescription>Ajuste o tema visual e como você recebe notificações.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="themeSelector">Tema da Aplicação</Label>
              <Select value={selectedCustomTheme} onValueChange={handleCustomThemeChange}>
                <SelectTrigger id="themeSelector" className="w-full">
                  <Palette className="mr-2 h-4 w-4 opacity-50" />
                  <SelectValue placeholder="Selecione um tema" />
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map(themeOption => (
                    <SelectItem key={themeOption.class || 'default'} value={themeOption.class}>
                      {themeOption.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
               <p className="text-xs text-muted-foreground">
                O modo Claro/Escuro é controlado pelo botão <Sun className="inline h-3 w-3"/>/<Moon className="inline h-3 w-3"/> na barra lateral.
              </p>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="notifications" className="font-medium">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receber lembretes de sessão e outras notificações importantes.
                </p>
              </div>
              <Switch 
                id="notifications" 
                checked={enableNotifications} 
                onCheckedChange={setEnableNotifications} 
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={isSaving || authLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações de Perfil
          </Button>
        </div>
      </form>
    </div>
  );
}
