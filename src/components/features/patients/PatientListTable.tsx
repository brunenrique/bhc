"use client";

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Patient } from "@/types";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, parseISO } from 'date-fns';

interface PatientListTableProps {
  patients: Patient[];
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
}

export function PatientListTable({ patients, onEditPatient, onDeletePatient }: PatientListTableProps) {
  const router = useRouter();

  if (patients.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum paciente encontrado.</p>;
  }

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Telefone</TableHead>
            <TableHead className="hidden lg:table-cell">Cadastrado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id} className="hover:bg-muted/50 transition-colors">
              <TableCell>
                <div className="font-medium">{patient.name}</div>
                <div className="text-xs text-muted-foreground md:hidden">{patient.email}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{patient.email || "-"}</TableCell>
              <TableCell className="hidden lg:table-cell">{patient.phone || "-"}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {format(parseISO(patient.createdAt), "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="inline-flex items-center gap-2">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}`)}>
                      <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditPatient(patient)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDeletePatient(patient.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
