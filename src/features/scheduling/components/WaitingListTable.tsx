
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
import { MoreHorizontal, Edit, Trash2, CalendarPlus, UserCheck, PhoneCall, Clock4 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { hasPermission } from "@/lib/permissions";

interface WaitingListTableProps {
  entries: WaitingListEntry[];
  onSchedule: (entry: WaitingListEntry) => void;
  onEdit: (entry: WaitingListEntry) => void;
  onDelete: (entryId: string) => void;
  onChangeStatus: (entryId: string, status: WaitingListEntry['status']) => void;
  currentUserRole?: UserRole;
}

const statusMap: Record<WaitingListEntry["status"], { label: string; icon?: React.ElementType; color: string; badgeVariant: "default" | "secondary" | "outline" | "destructive" }> = {
  waiting: { label: "Aguardando", icon: Clock4, color: "text-yellow-600 border-yellow-500 bg-yellow-500/10", badgeVariant: "outline" },
  contacted: { label: "Contatado", icon: PhoneCall, color: "text-blue-600 border-blue-500 bg-blue-500/10", badgeVariant: "outline" },
  scheduled: { label: "Agendado", icon: UserCheck, color: "text-green-600 border-green-500 bg-green-500/10", badgeVariant: "secondary" },
  archived: { label: "Arquivado", color: "text-gray-500 border-gray-400 bg-gray-400/10", badgeVariant: "outline" },
};


export const WaitingListTable: React.FC<WaitingListTableProps> = ({ entries, onSchedule, onEdit, onDelete, onChangeStatus, currentUserRole }) => {
  if (!entries || entries.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum paciente na lista de espera no momento.</p>;
  }

  const canSchedule = hasPermission(currentUserRole, 'SCHEDULE_FROM_WAITING_LIST');
  // Assuming admins and psychologists can also edit/delete if they can add/schedule
  const canEdit = hasPermission(currentUserRole, 'ADD_PATIENT_TO_WAITING_LIST');
  const canDelete = hasPermission(currentUserRole, 'ADD_PATIENT_TO_WAITING_LIST');
  // All roles with access to the table can change status (scheduler, secretary, psychologist, admin)
  const canChangeStatus = hasPermission(currentUserRole, 'VIEW_WAITING_LIST_PATIENTS');


  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead className="hidden md:table-cell">Telefone</TableHead>
            <TableHead className="hidden lg:table-cell">Adicionado em</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Preferências</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const statusInfo = statusMap[entry.status] || statusMap.waiting;
            return (
              <TableRow key={entry.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div className="font-medium">{entry.patientName}</div>
                  <div className="text-xs text-muted-foreground md:hidden">{entry.contactPhone || 'N/A'}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{entry.contactPhone || 'N/A'}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {format(parseISO(entry.addedAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell>
                    <Badge variant={statusInfo.badgeVariant} className={`capitalize ${statusInfo.color}`}>
                      {statusInfo.icon && <statusInfo.icon className={`mr-1.5 h-3.5 w-3.5`} />}
                      {statusInfo.label}
                    </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate" title={`${entry.preferredPsychologistName ? `Psic.: ${entry.preferredPsychologistName}. ` : ''}${entry.preferredDays ? `Dias: ${entry.preferredDays}. ` : ''}${entry.preferredTimes ? `Hor.: ${entry.preferredTimes}. ` : ''}${entry.reason || ''}`}>
                  {entry.preferredPsychologistName && <div>Psic.: {entry.preferredPsychologistName}</div>}
                  {entry.preferredDays && <div>Dias: {entry.preferredDays}</div>}
                  {entry.preferredTimes && <div>Hor.: {entry.preferredTimes}</div>}
                  {entry.reason && <div className="italic">Motivo: {entry.reason}</div>}
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
                        <DropdownMenuItem onClick={() => onSchedule(entry)} disabled={entry.status === 'scheduled' || entry.status === 'archived'}>
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
                        <>
                            <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                            {Object.entries(statusMap).map(([statusKey, statusValue]) => (
                                <DropdownMenuItem 
                                key={statusKey} 
                                onClick={() => onChangeStatus(entry.id, statusKey as WaitingListEntry['status'])}
                                disabled={entry.status === statusKey}
                                className={entry.status === statusKey ? "bg-muted" : ""}
                                >
                                {statusValue.icon && <statusValue.icon className={`mr-2 h-4 w-4 ${statusValue.color.split(' ')[0]}`} />}
                                Marcar como {statusValue.label}
                                </DropdownMenuItem>
                            ))}
                        </>
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
