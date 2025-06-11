
"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WaitingListEntry, UserRole } from "@/types";
import { MoreHorizontal, Edit, Trash2, CalendarPlus, UserCheck, PhoneCall, Clock4, ShieldAlert, AlertTriangle, CalendarClock } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { hasPermission } from "@/lib/permissions";
import { formatCPF } from "@/utils/cpfValidator";

interface WaitingListTableProps {
  entries: WaitingListEntry[];
  onSchedule: (entry: WaitingListEntry) => void;
  onEdit: (entry: WaitingListEntry) => void;
  onDelete: (entryId: string) => void;
  onChangeStatus: (entryId: string, status: WaitingListEntry['status']) => void;
  currentUserRole?: UserRole;
}

const statusMap: Record<WaitingListEntry["status"], { label: string; icon?: React.ElementType; color: string; badgeVariant: "default" | "secondary" | "outline" | "destructive" }> = {
  pendente: { label: "Pendente", icon: Clock4, color: "text-yellow-600 border-yellow-500 bg-yellow-500/10", badgeVariant: "outline" },
  agendado: { label: "Agendado", icon: UserCheck, color: "text-green-600 border-green-500 bg-green-500/10", badgeVariant: "secondary" },
  removido: { label: "Removido", icon: Trash2, color: "text-gray-500 border-gray-400 bg-gray-400/10", badgeVariant: "outline" },
};

const priorityMap: Record<WaitingListEntry["prioridade"], { label: string; icon?: React.ElementType; color: string; badgeVariant: "default" | "secondary" | "outline" | "destructive" }> = {
  normal: { label: "Normal", icon: CalendarClock, color: "text-blue-600 border-blue-500 bg-blue-500/10", badgeVariant: "outline" },
  urgente: { label: "Urgente", icon: AlertTriangle, color: "text-red-600 border-red-500 bg-red-500/10", badgeVariant: "destructive"},
};


export const WaitingListTable: React.FC<WaitingListTableProps> = ({ entries, onSchedule, onEdit, onDelete, onChangeStatus, currentUserRole }) => {
  if (!entries || entries.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum paciente na lista de espera no momento.</p>;
  }

  const canSchedule = hasPermission(currentUserRole, 'SCHEDULE_FROM_WAITING_LIST');
  const canEdit = hasPermission(currentUserRole, 'ADD_PATIENT_TO_WAITING_LIST'); // Assuming edit uses same perm as add for simplicity
  const canDelete = hasPermission(currentUserRole, 'ADD_PATIENT_TO_WAITING_LIST'); // Assuming delete uses same perm as add for simplicity
  const canChangeStatus = hasPermission(currentUserRole, 'VIEW_WAITING_LIST_PATIENTS');


  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead className="hidden sm:table-cell">CPF</TableHead>
            <TableHead className="hidden md:table-cell">Contato</TableHead>
            <TableHead className="hidden lg:table-cell">Adicionado em</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const statusInfo = statusMap[entry.status] || statusMap.pendente;
            const priorityInfo = priorityMap[entry.prioridade] || priorityMap.normal;
            return (
              <TableRow key={entry.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div className="font-medium">{entry.nomeCompleto}</div>
                  <div className="text-xs text-muted-foreground sm:hidden">{formatCPF(entry.cpf)}</div>
                  <div className="text-xs text-muted-foreground md:hidden">{entry.contato}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs">{formatCPF(entry.cpf)}</TableCell>
                <TableCell className="hidden md:table-cell text-xs">{entry.contato}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs">
                  {format(parseISO(entry.criadoEm), "dd/MM/yy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell>
                    <Badge variant={priorityInfo.badgeVariant} className={`capitalize ${priorityInfo.color}`}>
                      {priorityInfo.icon && <priorityInfo.icon className={`mr-1.5 h-3.5 w-3.5`} />}
                      {priorityInfo.label}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={statusInfo.badgeVariant} className={`capitalize ${statusInfo.color}`}>
                      {statusInfo.icon && <statusInfo.icon className={`mr-1.5 h-3.5 w-3.5`} />}
                      {statusInfo.label}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações na Lista</DropdownMenuLabel>
                      {canSchedule && (
                        <DropdownMenuItem onClick={() => onSchedule(entry)} disabled={entry.status === 'agendado' || entry.status === 'removido'}>
                            <CalendarPlus className="mr-2 h-4 w-4" /> Agendar Sessão
                        </DropdownMenuItem>
                      )}
                      {canEdit && (
                        <DropdownMenuItem onClick={() => onEdit(entry)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar Entrada
                        </DropdownMenuItem>
                      )}
                      
                      { (canSchedule || canEdit) && <DropdownMenuSeparator /> }
                      
                      {canChangeStatus && (
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Alterar Status</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                     <DropdownMenuLabel>Novo Status</DropdownMenuLabel>
                                     <DropdownMenuSeparator/>
                                    {Object.entries(statusMap).map(([statusKey, statusValue]) => (
                                        <DropdownMenuItem 
                                        key={statusKey} 
                                        onClick={() => onChangeStatus(entry.id, statusKey as WaitingListEntry['status'])}
                                        disabled={entry.status === statusKey}
                                        className={entry.status === statusKey ? "bg-muted" : ""}
                                        >
                                        {statusValue.icon && <statusValue.icon className={`mr-2 h-4 w-4 ${statusValue.color.split(' ')[0]}`} />}
                                        {statusValue.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                      )}
                      {canDelete && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(entry.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" /> Remover da Lista
                            </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

WaitingListTable.displayName = "WaitingListTable";
