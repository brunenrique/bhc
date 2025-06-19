
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { UserCircle, Users, CalendarClock, ClipboardCheck, FileSignature, ArrowRight, ExternalLink, AlertTriangle } from "lucide-react";
import type { Patient, Session, Assessment, DocumentResource } from "@/types";
import { useAuth } from '@/hooks/useAuth';
import { cacheService } from '@/services/cacheService';
import { mockPatientsData as fallbackPatients } from '@/app/(app)/patients/page';
import { mockSessionsData as fallbackSessions } from '@/app/(app)/whatsapp-reminders/page'; // Using this as it has future sessions
import { mockAssessmentsData as fallbackAssessments } from '@/app/(app)/assessments/page';
import { mockDocumentsData as fallbackDocuments } from '@/app/(app)/documents/page';
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to get start and end of the current week
const getCurrentWeekInterval = () => {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(now, { weekStartsOn: 1 }),     // Sunday
  };
};

export default function MyPanelPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [myPatients, setMyPatients] = useState<Patient[]>([]);
  const [mySessionsThisWeek, setMySessionsThisWeek] = useState<Session[]>([]);
  const [pendingAssessments, setPendingAssessments] = useState<Assessment[]>([]);
  const [documentsToSign, setDocumentsToSign] = useState<DocumentResource[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Assume current psychologist ID - in a real app, this would come from `user.id` or a specific field.
  // For mock purposes, let's use 'psy1' which is Dr. Exemplo Silva in some mocks.
  const currentPsychologistId = useMemo(() => user?.id || 'psy1', [user]);


  useEffect(() => {
    let isMounted = true;
    const loadPanelData = async () => {
      if (!currentPsychologistId || authLoading) return;
      setIsLoadingData(true);

      // Fetch all necessary data (or use fallback mocks)
      const allPatients = (await cacheService.patients.getList()) || fallbackPatients;
      const allSessions = (await cacheService.sessions.getList()) || fallbackSessions;
      const allAssessments = (await cacheService.assessments.getList()) || fallbackAssessments;
      const allDocuments = (await cacheService.documents.getList()) || fallbackDocuments;

      if (!isMounted) return;

      // 1. Determine "my patients"
      // Filter sessions by currentPsychologistId
      const psychologistSessions = allSessions.filter(s => s.psychologistId === currentPsychologistId);
      const myPatientIds = new Set(psychologistSessions.map(s => s.patientId));
      const filteredMyPatients = allPatients.filter(p => myPatientIds.has(p.id));
      setMyPatients(filteredMyPatients);

      // 2. Filter "my sessions this week"
      const weekInterval = getCurrentWeekInterval();
      const filteredMySessionsThisWeek = psychologistSessions.filter(s => {
        const sessionDate = parseISO(s.startTime);
        return isWithinInterval(sessionDate, weekInterval) && s.status === 'scheduled';
      }).sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
      setMySessionsThisWeek(filteredMySessionsThisWeek);

      // 3. Filter "pending assessments" for my patients
      const filteredPendingAssessments = allAssessments.filter(
        assessment => myPatientIds.has(assessment.patientId) && assessment.status === 'sent'
      ).sort((a,b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());
      setPendingAssessments(filteredPendingAssessments);
      
      // 4. Filter "documents to sign" (general for now, or by involvement if model supported it)
      // For this mock, we'll just show a few documents that are pending signature.
      const filteredDocumentsToSign = allDocuments.filter(
        doc => doc.signatureStatus === 'pending_govbr_signature'
      ).slice(0, 3); // Limit for display
      setDocumentsToSign(filteredDocumentsToSign);

      setIsLoadingData(false);
    };

    loadPanelData();
    return () => { isMounted = false; };
  }, [currentPsychologistId, authLoading]);

  if (authLoading || isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-semibold">Meu Painel</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card className="shadow-lg"><CardHeader><Skeleton className="h-6 w-1/2 mb-2" /><Skeleton className="h-4 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
          <Card className="shadow-lg"><CardHeader><Skeleton className="h-6 w-1/2 mb-2" /><Skeleton className="h-4 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }
  
  if (user?.role !== 'psychologist' && user?.role !== 'admin') {
    // This should ideally be handled by the layout, but as a fallback:
    return (
         <Card className="shadow-xl">
            <CardHeader className="items-center">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <CardTitle className="text-2xl font-headline mt-2">Acesso Negado</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">Esta seção é destinada apenas a psicólogos e administradores.</p>
                <Button asChild className="mt-4"><Link href="/dashboard">Voltar para Visão Geral</Link></Button>
            </CardContent>
        </Card>
    );
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <UserCircle className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Meu Painel, {user?.name.split(' ')[0]}</h1>
      </div>
      <p className="text-muted-foreground font-body">
        Sua visão personalizada com seus pacientes, próximas sessões e tarefas pendentes.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Meus Pacientes Ativos</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">{myPatients.length}</div>
            <Link href="/patients" className="text-xs text-primary hover:underline flex items-center">
              Ver todos <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Sessões na Semana</CardTitle>
            <CalendarClock className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">{mySessionsThisWeek.length}</div>
            <Link href="/scheduling" className="text-xs text-primary hover:underline flex items-center">
              Ver agenda completa <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Avaliações Pendentes</CardTitle>
            <ClipboardCheck className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">{pendingAssessments.length}</div>
             <p className="text-xs text-muted-foreground">Aguardando resposta dos pacientes.</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Documentos para Assinar</CardTitle>
            <FileSignature className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">{documentsToSign.length}</div>
            <Link href="/documents" className="text-xs text-primary hover:underline flex items-center">
              Ver documentos <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Próximas Sessões na Semana</CardTitle>
            <CardDescription>Suas sessões agendadas para os próximos 7 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            {mySessionsThisWeek.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead className="text-right">Horário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mySessionsThisWeek.slice(0, 5).map(session => ( // Show first 5
                    <TableRow key={session.id}>
                      <TableCell>{format(parseISO(session.startTime), "dd/MM (EEE)", { locale: ptBR })}</TableCell>
                      <TableCell>{session.patientName}</TableCell>
                      <TableCell className="text-right">{format(parseISO(session.startTime), "HH:mm", { locale: ptBR })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">Nenhuma sessão agendada para esta semana.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Avaliações com Respostas Pendentes</CardTitle>
            <CardDescription>Avaliações enviadas aos seus pacientes que aguardam resposta.</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingAssessments.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {pendingAssessments.map(assessment => (
                  <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{assessment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Para: {assessment.patientName || 'Paciente não identificado'}
                      </p>
                       <p className="text-xs text-muted-foreground">
                        Enviada em: {format(parseISO(assessment.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/patients/${assessment.patientId}`}>
                        <span className="inline-flex items-center gap-2">
                          Ver Paciente <ExternalLink className="h-3 w-3" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma avaliação pendente no momento.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    