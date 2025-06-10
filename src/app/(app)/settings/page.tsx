
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Loader2, Save, UserCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch"; // Assuming you have a Switch component
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Add more settings states as needed, e.g., notifications
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const getInitials = (nameStr: string) => {
    const names = nameStr.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '';
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call to save settings
    // console.log("Saving settings:", { name, email, enableNotifications });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast({
        title: "Configurações Salvas",
        description: "Suas preferências foram atualizadas com sucesso.",
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
            <CardDescription>Atualize suas informações pessoais e preferências.</CardDescription>
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

            {/* Example for password change - more complex, usually separate flow */}
            {/* <div>
              <Label htmlFor="password">Nova Senha</Label>
              <Input id="password" type="password" placeholder="Deixe em branco para não alterar" />
            </div> */}
          </CardContent>
        </Card>

        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Preferências</CardTitle>
            <CardDescription>Ajuste as configurações de notificação e outras preferências do sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            {/* Add more preference settings here */}
          </CardContent>
        </Card>
        
        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={isSaving || authLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}

