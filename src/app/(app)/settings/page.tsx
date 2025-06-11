"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Loader2, Save, UserCircle, Palette, Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch"; 
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme as useNextTheme } from 'next-themes';

// Theme definitions
const THEMES = [
  { name: 'Padrão (Azul/Lavanda)', value: 'psiguard-default', className: '' }, // Default CSS variables (no specific class)
  { name: 'Moderno (Teal/Laranja)', value: 'theme-modern', className: 'theme-modern' },
  { name: 'Cinza Claro', value: 'theme-light-gray', className: 'theme-light-gray' },
  { name: 'Lilás', value: 'theme-lilac', className: 'theme-lilac' },
];
const CUSTOM_THEME_LS_KEY = 'psiguard-custom-theme';
const ALL_CSS_THEME_CLASSES = THEMES.map(t => t.className).filter(Boolean);

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { theme: nextThemeMode, setTheme: setNextThemeMode } = useNextTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Initialize with the 'value' of the Moderno theme
  const [selectedCustomTheme, setSelectedCustomTheme] = useState<string>(THEMES.find(t => t.className === 'theme-modern')?.value || 'theme-modern');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
    // Load custom theme preference
    const storedClassName = localStorage.getItem(CUSTOM_THEME_LS_KEY); 
    
    if (storedClassName !== null) { 
        const themeFromStorage = THEMES.find(t => t.className === storedClassName);
        // Set to the 'value' of the theme found in storage, or 'psiguard-default' if className was ''
        setSelectedCustomTheme(themeFromStorage ? themeFromStorage.value : THEMES.find(t => t.className === '')!.value); 
    } else {
        // No preference in localStorage, default to "Moderno"
        setSelectedCustomTheme(THEMES.find(t => t.className === 'theme-modern')?.value || 'theme-modern');
    }
  }, [user]);

  const getInitials = (nameStr: string) => {
    const names = nameStr.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '';
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  }

  const handleCustomThemeChange = (selectedValue: string) => { 
    setSelectedCustomTheme(selectedValue); // selectedValue is 'psiguard-default', 'theme-modern', etc.
    const themeToApply = THEMES.find(t => t.value === selectedValue);
    
    if (themeToApply) {
      const cssClassName = themeToApply.className; 
      const htmlElement = document.documentElement;

      ALL_CSS_THEME_CLASSES.forEach(cls => htmlElement.classList.remove(cls));

      if (cssClassName) {
        htmlElement.classList.add(cssClassName);
      }
      localStorage.setItem(CUSTOM_THEME_LS_KEY, cssClassName); 
      toast({
          title: "Tema Alterado",
          description: `O tema da aplicação foi alterado para ${themeToApply.name}.`,
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // console.log("Saving settings:", { name, email, enableNotifications });
    await new Promise(resolve => setTimeout(resolve, 1500));
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
              <Button variant="outline" type="button">Alterar Foto</Button>
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
                  {THEMES.filter(themeOption => typeof themeOption.value === 'string' && themeOption.value !== '').map(themeOption => (
                    <SelectItem key={themeOption.value} value={themeOption.value}>
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
