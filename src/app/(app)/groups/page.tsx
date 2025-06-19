
"use client"; 

import React from 'react'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, PlusCircle, Search, Filter, MoreHorizontal, CalendarPlus, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { GroupResource } from '@/app/(app)/groups/[id]/page'; 

export const mockTherapeuticGroups = [
  {
    id: "grp1",
    name: "Grupo de Apoio à Ansiedade",
    psychologist: "Dr. Silva",
    psychologistId: "psy1",
    membersCount: 2, 
    schedule: "Terças, 18:00 - 19:30",
    dayOfWeek: "tuesday",
    startTime: "18:00",
    endTime: "19:30",
    nextSession: "2024-08-06T18:00:00Z",
    description: "Um grupo focado em fornecer apoio mútuo e estratégias de enfrentamento para indivíduos que lidam com ansiedade. As sessões incluem discussões, técnicas de relaxamento e compartilhamento de experiências.",
    participants: [
      { id: "1", name: "Alice Wonderland", avatarUrl: "https://placehold.co/100x100/D0BFFF/4F3A76?text=AW", dataAiHint: "female avatar" },
      { id: "2", name: "Bob O Construtor", avatarUrl: "https://placehold.co/100x100/70C1B3/FFFFFF?text=BC", dataAiHint: "male builder" },
    ],
    meetingAgenda: "Sessão 1: Apresentações e estabelecimento de metas do grupo.\nSessão 2: Entendendo os mecanismos da ansiedade e identificando gatilhos pessoais.\nSessão 3: Introdução a técnicas de respiração e relaxamento muscular progressivo.\nSessão 4: Estratégias de reestruturação cognitiva para pensamentos ansiogênicos.\nSessão 5: Exposição gradual e dessensibilização sistemática (discussão e planejamento).",
    resources: [
      { id: "grp1res1", name: "Folha de Exercício: Roda da Vida", type: "pdf", uploadDate: "2024-07-20", description: "Atividade para autoavaliação das áreas da vida.", dataAiHint: "documento exercício" },
      { id: "grp1res2", name: "Áudio: Meditação Guiada para Ansiedade (5 min)", type: "link", url: "#", uploadDate: "2024-07-21", description: "Link para meditação no YouTube/SoundCloud.", dataAiHint: "áudio meditação" }
    ] as GroupResource[],
  },
  {
    id: "grp2",
    name: "Habilidades Sociais para Adolescentes",
    psychologist: "Dra. Jones",
    psychologistId: "psy2",
    membersCount: 2, 
    schedule: "Quintas, 16:00 - 17:00",
    dayOfWeek: "thursday",
    startTime: "16:00",
    endTime: "17:00",
    nextSession: "2024-08-08T16:00:00Z",
    description: "Este grupo ajuda adolescentes a desenvolver e praticar habilidades sociais essenciais em um ambiente seguro e de apoio. Foco em comunicação, assertividade e resolução de conflitos.",
    participants: [
      { id: "3", name: "Charlie Brown", avatarUrl: "https://placehold.co/100x100/FCEEAC/E6B325?text=CB", dataAiHint: "boy character" },
      { id: "4", name: "Diana Prince", avatarUrl: "https://placehold.co/100x100/E6B325/FFFFFF?text=DP", dataAiHint: "female hero" },
    ],
    meetingAgenda: "Encontro 1: Quebra-gelo e comunicação verbal básica (escuta ativa, iniciar conversas).\nEncontro 2: Comunicação não-verbal (linguagem corporal, contato visual).\nEncontro 3: Assertividade vs. Agressividade vs. Passividade.\nEncontro 4: Lidando com feedback e críticas.\nEncontro 5: Resolução de conflitos interpessoais.",
    resources: [
      { id: "grp2res1", name: "Cartões de Cenários Sociais", type: "pdf", uploadDate: "2024-07-18", description: "Situações para role-playing.", dataAiHint: "documento cartões" }
    ] as GroupResource[],
  },
  {
    id: "grp3",
    name: "Grupo de Luto e Perdas",
    psychologist: "Dr. Silva",
    psychologistId: "psy1",
    membersCount: 0, 
    schedule: "Segundas, 10:00 - 11:30",
    dayOfWeek: "monday",
    startTime: "10:00",
    endTime: "11:30",
    nextSession: "2024-08-05T10:00:00Z",
    description: "Um espaço para processar o luto e encontrar apoio após a perda de um ente querido. O grupo oferece um ambiente de compreensão e ferramentas para lidar com a dor.",
    participants: [], 
    meetingAgenda: "Semana 1: Introdução ao processo de luto e compartilhamento de histórias.\nSemana 2: Validando emoções e lidando com a saudade.\nSemana 3: Rituais de despedida e ressignificação.\nSemana 4: Encontrando novo sentido e reconstruindo o futuro.",
    resources: [] as GroupResource[],
  },
];

export default function TherapeuticGroupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-headline font-bold">Grupos Terapêuticos</h1>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/groups/new">
            <span className="inline-flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Criar Novo Grupo
            </span>
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline">Gerenciar Grupos Terapêuticos</CardTitle>
          <CardDescription>Visualize, crie e gerencie os grupos terapêuticos da clínica.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <input placeholder="Buscar grupos..." className="w-full bg-transparent pl-8 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mockTherapeuticGroups.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Nome do Grupo</TableHead>
                    <TableHead className="min-w-[150px]">Psicólogo(a) Responsável</TableHead>
                    <TableHead className="text-center">Membros</TableHead>
                    <TableHead className="min-w-[180px]">Horário Fixo</TableHead>
                    <TableHead className="min-w-[150px]">Próxima Sessão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTherapeuticGroups.map(group => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        <Link href={`/groups/${group.id}`} className="hover:underline text-accent">
                          {group.name}
                        </Link>
                      </TableCell>
                      <TableCell>{group.psychologist}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{group.participants.length}</Badge>
                      </TableCell>
                      <TableCell>{group.schedule}</TableCell>
                      <TableCell>{group.nextSession ? format(new Date(group.nextSession), "P 'às' HH:mm", { locale: ptBR }) : "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ações para {group.name}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/schedule/new?groupId=${group.id}&type=group`}>
                                <span className="inline-flex items-center gap-2">
                                  <CalendarPlus className="h-4 w-4" />
                                  Agendar Sessão Avulsa
                                </span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/groups/edit/${group.id}`}>
                                <span className="inline-flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Editar Grupo
                                </span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir Grupo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center py-10">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Nenhum grupo terapêutico encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">Comece criando um novo grupo.</p>
               <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/groups/new">
                    <span className="inline-flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Criar Novo Grupo
                    </span>
                  </Link>
               </Button>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
