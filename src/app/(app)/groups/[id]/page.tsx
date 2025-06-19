
"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Users as GroupIcon, User as UserIcon, CalendarDays, Clock, FileText, Edit, Trash2, ArrowLeft, Settings, ListChecks, Users2 as UsersIconLucide, Paperclip, UploadCloud, Download, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { mockTherapeuticGroups } from "@/app/(app)/groups/page"; 
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";


interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  dataAiHint?: string;
}

export interface GroupResource {
  id: string;
  name: string;
  type: "pdf" | "docx" | "image" | "link" | "other";
  url?: string;
  uploadDate: string; // ISO date string
  description?: string;
  dataAiHint?: string;
}

interface Group {
  id: string;
  name: string;
  psychologist: string;
  psychologistId: string;
  membersCount: number; 
  schedule: string; 
  dayOfWeek: string; 
  startTime: string; 
  endTime: string; 
  nextSession?: string;
  description?: string;
  participants: Participant[];
  meetingAgenda?: string;
  resources?: GroupResource[];
}

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length === 1) return names[0][0]?.toUpperCase() || '';
  return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
};

const dayOfWeekDisplay: Record<string, string> = {
  monday: "Segundas",
  tuesday: "Terças",
  wednesday: "Quartas",
  thursday: "Quintas",
  friday: "Sextas",
  saturday: "Sábados",
  sunday: "Domingos",
};


export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const group: Group | undefined = mockTherapeuticGroups.find(g => g.id === params.id);

  // State for Add Resource Dialog
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);
  const [newResourceName, setNewResourceName] = useState("");
  const [newResourceType, setNewResourceType] = useState<GroupResource["type"]>("pdf");
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [newResourceDescription, setNewResourceDescription] = useState("");


  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <GroupIcon className="w-24 h-24 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Grupo Não Encontrado</h1>
        <p className="text-muted-foreground mb-6">O grupo que você está procurando não existe ou foi movido.</p>
        <Button asChild variant="outline">
          <Link href="/groups">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Grupos
          </Link>
        </Button>
      </div>
    );
  }
  // Explicitly cast to Group to satisfy TypeScript after undefined check
  const currentGroup = group as Group;

  const handleDeleteGroup = () => {
    toast({
      title: "Grupo Excluído (Simulado)",
      description: `O grupo "${currentGroup.name}" foi excluído com sucesso.`,
      variant: "destructive"
    });
    router.push("/groups");
  };

  const handleAddResource = () => {
    if (!newResourceName || (newResourceType === 'link' && !newResourceUrl)) {
        toast({ title: "Erro", description: "Nome do recurso e URL (para links) são obrigatórios.", variant: "destructive" });
        return;
    }
    // Simulate adding resource
    const newResource: GroupResource = {
        id: `res_${Date.now()}`,
        name: newResourceName,
        type: newResourceType,
        url: newResourceType === 'link' ? newResourceUrl : undefined,
        uploadDate: new Date().toISOString(),
        description: newResourceDescription,
    };
    // In a real app, update backend and then update local state or re-fetch
    currentGroup.resources = [...(currentGroup.resources || []), newResource]; 
    toast({ title: "Recurso Adicionado (Simulado)", description: `"${newResourceName}" foi adicionado ao grupo.` });
    setIsAddResourceDialogOpen(false);
    setNewResourceName("");
    setNewResourceType("pdf");
    setNewResourceUrl("");
    setNewResourceDescription("");
};


  const formattedNextSession = currentGroup.nextSession
    ? format(parseISO(currentGroup.nextSession), "PPPp", { locale: ptBR })
    : "Não agendada";

  const displaySchedule = `${dayOfWeekDisplay[currentGroup.dayOfWeek] || currentGroup.dayOfWeek}, ${currentGroup.startTime} - ${currentGroup.endTime}`;

  const getResourceTypeIcon = (type: GroupResource["type"]) => {
    switch(type) {
      case "pdf": return <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />;
      case "docx": return <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />;
      case "image": return <FileText className="h-5 w-5 text-green-500 flex-shrink-0" />; // Using FileText for consistency, could be ImageIcon
      case "link": return <LinkIcon className="h-5 w-5 text-accent flex-shrink-0" />;
      default: return <Paperclip className="h-5 w-5 text-muted-foreground flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4 sm:mb-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href={`/groups/edit/${currentGroup.id}`}>
                    <span className="inline-flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Editar Grupo
                    </span>
                </Link>
            </Button>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-destructive/90 hover:bg-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir Grupo
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Grupo Permanentemente?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Todos os dados associados ao grupo &quot;{currentGroup.name}&quot; serão removidos. Tem certeza?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive hover:bg-destructive/90">
                        Excluir
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <UsersIconLucide className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-headline font-bold">{currentGroup.name}</h1>
              <p className="text-muted-foreground">Psicólogo(a) Responsável: {currentGroup.psychologist}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid md:grid-cols-2 gap-x-6 gap-y-4">
          <InfoItem icon={<CalendarDays />} label="Horário Regular" value={displaySchedule} />
          <InfoItem icon={<Clock />} label="Próxima Sessão (Avulsa/Exemplo)" value={formattedNextSession} />
          <InfoItem icon={<GroupIcon />} label="Contagem de Membros" value={`${currentGroup.participants?.length || 0} participante(s)`} />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><UserIcon className="mr-2 h-5 w-5 text-primary" /> Participantes ({(currentGroup.participants || []).length})</CardTitle>
          <CardDescription>Membros atuais do grupo terapêutico.</CardDescription>
        </CardHeader>
        <CardContent>
          {(currentGroup.participants || []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(currentGroup.participants || []).map(participant => (
                <Link key={participant.id} href={`/patients/${participant.id}`} className="block">
                  <Card className="hover:shadow-md transition-shadow hover:border-accent">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(participant.name)}`} alt={participant.name} data-ai-hint={participant.dataAiHint || "avatar pessoa"} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground">{getInitials(participant.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{participant.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum participante adicionado a este grupo ainda.</p>
          )}
        </CardContent>
        <CardFooter>
            <Button variant="outline" asChild>
                <Link href={`/groups/edit/${currentGroup.id}?tab=participants`}>
                    <span className="inline-flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Gerenciar Participantes
                    </span>
                </Link>
            </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" /> Descrição do Grupo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {currentGroup.description || "Nenhuma descrição fornecida."}
            </p>
          </div>
        </CardContent>
         <CardFooter>
            <Button variant="outline" asChild>
                <Link href={`/groups/edit/${currentGroup.id}?tab=details`}>
                    <span className="inline-flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Editar Descrição
                    </span>
                </Link>
            </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary" /> Roteiro dos Encontros</CardTitle>
          <CardDescription>Planejamento e tópicos para as sessões do grupo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-md">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {currentGroup.meetingAgenda || "Nenhum roteiro de encontros definido para este grupo."}
            </p>
          </div>
        </CardContent>
         <CardFooter>
            <Button variant="outline" asChild>
                <Link href={`/groups/edit/${currentGroup.id}?tab=agenda`}>
                    <span className="inline-flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Editar Roteiro
                    </span>
                </Link>
            </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="font-headline flex items-center"><Paperclip className="mr-2 h-5 w-5 text-primary" /> Materiais e Atividades do Grupo</CardTitle>
            <CardDescription>Recursos, exercícios e links compartilhados com o grupo.</CardDescription>
          </div>
          <Dialog open={isAddResourceDialogOpen} onOpenChange={setIsAddResourceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <UploadCloud className="mr-2 h-4 w-4" /> Adicionar Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Material ao Grupo</DialogTitle>
                <DialogDescription>Insira os detalhes do arquivo ou link.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="resource-name">Nome do Material *</Label>
                  <Input id="resource-name" value={newResourceName} onChange={(e) => setNewResourceName(e.target.value)} placeholder="Ex: Guia de Mindfulness.pdf" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="resource-type">Tipo *</Label>
                  <select id="resource-type" value={newResourceType} onChange={(e) => setNewResourceType(e.target.value as GroupResource["type"])} className="w-full p-2 border rounded-md bg-background">
                    <option value="pdf">PDF</option>
                    <option value="docx">Documento (DOCX)</option>
                    <option value="image">Imagem</option>
                    <option value="link">Link Externo</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                {newResourceType === "link" && (
                  <div className="space-y-1">
                    <Label htmlFor="resource-url">URL do Link *</Label>
                    <Input id="resource-url" value={newResourceUrl} onChange={(e) => setNewResourceUrl(e.target.value)} placeholder="https://exemplo.com/material" />
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="resource-description">Descrição (Opcional)</Label>
                  <Textarea id="resource-description" value={newResourceDescription} onChange={(e) => setNewResourceDescription(e.target.value)} placeholder="Breve descrição do material..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddResourceDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddResource} className="bg-accent hover:bg-accent/90 text-accent-foreground">Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {(currentGroup.resources || []).length > 0 ? (
            <div className="space-y-3">
              {(currentGroup.resources || []).map(resource => (
                <Card key={resource.id} className="shadow-xs hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getResourceTypeIcon(resource.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={resource.name}>{resource.name}</p>
                        {resource.description && <p className="text-xs text-muted-foreground truncate" title={resource.description}>{resource.description}</p>}
                        <p className="text-xs text-muted-foreground">Adicionado em: {format(new Date(resource.uploadDate), "P", { locale: ptBR })}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                    {resource.type === "link" && resource.url ? (
                         <Button variant="outline" size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                <span className="inline-flex items-center gap-2">
                                    <LinkIcon className="h-3.5 w-3.5" />
                                    Acessar Link
                                </span>
                            </a>
                        </Button>
                    ) : (
                         <Button variant="outline" size="sm">
                            <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-1 text-destructive hover:text-destructive/80" aria-label={`Excluir recurso ${resource.name}`}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-4 text-center">Nenhum material ou atividade adicionado a este grupo ainda.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

function InfoItem({ icon, label, value, className }: InfoItemProps) {
  return (
    <div className={`flex items-start gap-3 p-3 bg-secondary/20 rounded-md ${className}`}>
      <span className="text-muted-foreground mt-1">{icon}</span>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="text-foreground text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
