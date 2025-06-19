
"use client";

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserCircle, Edit, Lock, Bell, Briefcase, CalendarDays, Mail, Phone, ShieldCheck, Image as ImageIcon, UploadCloud } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

type UserGender = "masculino" | "feminino" | "outro";

const getDefaultAvatarByGender = (gender?: UserGender, name?: string) => {
  const initials = name ? (name.split(' ')[0][0] + (name.split(' ').length > 1 ? name.split(' ')[name.split(' ').length - 1][0] : '')).toUpperCase() : "??";
  switch (gender) {
    case "masculino":
      return `https://placehold.co/150x150/70C1B3/FFFFFF?text=M-${initials}`;
    case "feminino":
      return `https://placehold.co/150x150/D0BFFF/4F3A76?text=F-${initials}`;
    default:
      return `https://placehold.co/150x150/F5F5F5/4A4A4A?text=N-${initials}`;
  }
};

// Mock data for the logged-in user
const mockUserProfileData = {
  id: "usr123",
  name: "Dr. Carlos Silva",
  email: "carlos.silva@psiguard.app",
  gender: "masculino" as UserGender,
  role: "Psychologist" as "Psychologist" | "Admin" | "Secretary",
  specialty: "Terapia Cognitivo-Comportamental",
  phone: "(11) 98765-4321",
  dateRegistered: "2023-05-10T10:00:00Z",
  clinicName: "PsiGuard Clínica Central",
  avatarUrl: "" // Will be set by getDefaultAvatarByGender
};
mockUserProfileData.avatarUrl = getDefaultAvatarByGender(mockUserProfileData.gender, mockUserProfileData.name);


const predefinedAvatars = [
  { id: "avatar1", url: "https://placehold.co/100x100/D0BFFF/4F3A76?text=P1", name: "Avatar Roxo", dataAiHint: "avatar roxo" },
  { id: "avatar2", url: "https://placehold.co/100x100/70C1B3/FFFFFF?text=P2", name: "Avatar Verde Água", dataAiHint: "avatar verde" },
  { id: "avatar3", url: "https://placehold.co/100x100/FCEEAC/E6B325?text=P3", name: "Avatar Amarelo", dataAiHint: "avatar amarelo" },
  { id: "avatar4", url: "https://placehold.co/100x100/E6B325/FFFFFF?text=P4", name: "Avatar Laranja", dataAiHint: "avatar laranja" },
  { id: "avatar_male_1", url: getDefaultAvatarByGender("masculino", "CS"), name: "Padrão Masculino", dataAiHint: "avatar masculino" },
  { id: "avatar_female_1", url: getDefaultAvatarByGender("feminino", "CS"), name: "Padrão Feminino", dataAiHint: "avatar feminino" },
  { id: "avatar_neutral_1", url: getDefaultAvatarByGender("outro", "CS"), name: "Padrão Neutro", dataAiHint: "avatar neutro" },
];


export default function ProfilePage() {
  const { toast } = useToast();
  const [currentUserProfile, setCurrentUserProfile] = useState({
    ...mockUserProfileData,
    avatarUrl: getDefaultAvatarByGender(mockUserProfileData.gender, mockUserProfileData.name)
  });


  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '';
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  };

  const getRoleLabel = (role: string): string => {
    const roleMap: Record<string, string> = {
      Psychologist: "Psicólogo(a)",
      Secretary: "Secretário(a)",
      Admin: "Administrador(a)",
    };
    return roleMap[role] || role;
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    setCurrentUserProfile(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
    toast({
      title: "Avatar Atualizado (Simulado)",
      description: "Seu avatar foi alterado com sucesso.",
    });
    // Em uma aplicação real, aqui você chamaria a função updateUserAvatar do Firebase.
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserCircle className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-headline font-bold">Meu Perfil</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="items-center text-center p-6 sm:p-8 bg-muted/30">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-lg">
            <AvatarImage src={currentUserProfile.avatarUrl} alt={currentUserProfile.name} data-ai-hint="user avatar" />
            <AvatarFallback className="text-4xl bg-primary text-primary-foreground font-semibold">
              {getInitials(currentUserProfile.name)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="font-headline text-2xl sm:text-3xl mt-4">{currentUserProfile.name}</CardTitle>
          <CardDescription className="text-base">{getRoleLabel(currentUserProfile.role)}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">Informações de Contato</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <InfoRow icon={<Mail />} label="Email" value={currentUserProfile.email} />
            <InfoRow icon={<Phone />} label="Telefone" value={currentUserProfile.phone || "Não informado"} />
          </div>
          
          <Separator className="my-6" />

          <h3 className="text-lg font-semibold text-foreground mb-3">Detalhes Profissionais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {currentUserProfile.role === "Psychologist" && (
              <InfoRow icon={<Briefcase />} label="Especialidade" value={currentUserProfile.specialty || "Não informada"} />
            )}
            <InfoRow icon={<ShieldCheck />} label="Função no Sistema" value={getRoleLabel(currentUserProfile.role)} />
            <InfoRow icon={<Briefcase />} label="Clínica" value={currentUserProfile.clinicName} />
            <InfoRow icon={<CalendarDays />} label="Membro Desde" value={format(new Date(currentUserProfile.dateRegistered), "P", { locale: ptBR })} />
          </div>

          <Separator className="my-6" />

          <h3 className="text-lg font-semibold text-foreground mb-3">Alterar Avatar</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Avatar Atual</h4>
              <Avatar className="h-20 w-20">
                <AvatarImage src={currentUserProfile.avatarUrl} alt="Avatar atual" data-ai-hint="current user avatar" />
                <AvatarFallback>{getInitials(currentUserProfile.name)}</AvatarFallback>
              </Avatar>
            </div>
            <div>
                <h4 className="text-sm font-medium mb-2">Carregar Nova Foto</h4>
                <Button variant="outline" disabled>
                    <UploadCloud className="mr-2 h-4 w-4"/> Fazer Upload (Em Breve)
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Funcionalidade de upload de imagem será implementada futuramente.</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Ou escolha um dos nossos avatares:</h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
                {predefinedAvatars.map(avatar => (
                  <Avatar 
                    key={avatar.id} 
                    className="h-16 w-16 cursor-pointer hover:ring-2 hover:ring-accent transition-all"
                    onClick={() => handleAvatarChange(avatar.url)}
                    title={`Selecionar ${avatar.name}`}
                  >
                    <AvatarImage src={avatar.url} alt={avatar.name} data-ai-hint={avatar.dataAiHint} />
                    <AvatarFallback>{getInitials(avatar.name)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 p-6 border-t">
          <Button variant="default" asChild className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/settings?tab=account">
              <span className="inline-flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar Perfil
              </span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/settings?tab=account">
              <span className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Alterar Senha
              </span>
            </Link>
          </Button>
           <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/settings?tab=notifications">
              <span className="inline-flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Preferências de Notificação
              </span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start">
      <span className="text-muted-foreground mr-2 mt-0.5">{icon}</span>
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
