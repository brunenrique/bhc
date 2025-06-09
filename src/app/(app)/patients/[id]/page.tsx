"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Patient, Session } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Mail, Phone, CalendarDays, FileText, PlusCircle, Trash2 } from 'lucide-react';
import { PatientFormDialog } from '@/components/patients/PatientFormDialog';
import { SessionFormDialog } from '@/components/scheduling/SessionFormDialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data fetching function
const fetchPatientDetails = async (id: string): Promise<Patient | null> => {
  console.log(`Fetching patient with id: ${id}`);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  const mockPatient: Patient = {
    id,
    name: id === '1' ? 'Ana Beatriz Silva' : id === '2' ? 'Bruno Almeida Costa' : 'Paciente Exemplo Detalhado',
    email: id === '1' ? 'ana.silva@example.com' : id === '2' ? 'bruno.costa@example.com' : 'paciente.detalhe@example.com',
    phone: id === '1' ? '(11) 98765-4321' : id === '2' ? '(21) 91234-5678' : '(XX) XXXXX-XXXX',
    dateOfBirth: id === '1' ? '1990-05-15' : id === '2' ? '1985-11-20' : '1995-01-01',
    address: 'Rua Fictícia, 123, Bairro Imaginário, Cidade Exemplo - UF',
    sessionNotes: `Paciente apresenta quadro de ansiedade generalizada, com picos de estresse relacionados ao trabalho. \n\nRecomendações: Técnicas de respiração, mindfulness e reavaliação de prioridades. \n\nPróxima sessão focará em estratégias de coping.`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    updatedAt: new Date().toISOString(),
  };
  if (id === 'notfound') return null;
  return mockPatient;
};

const fetchPatientSessions = async (patientId: string): Promise<Session[]> => {
  console.log(`Fetching sessions for patient id: ${patientId}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 's1', patientId, psychologistId: 'psy1', startTime: new Date(Date.now() - 1000*60*60*24*7).toISOString(), endTime: new Date(Date.now() - 1000*60*60*24*7 + 1000*60*60).toISOString(), status: 'completed', notes: 'Sessão produtiva, paciente demonstrou progresso.'},
    { id: 's2', patientId, psychologistId: 'psy1', startTime: new Date(Date.now() - 1000*60*60*24*2).toISOString(), endTime: new Date(Date.now() - 1000*60*60*24*2 + 1000*60*60).toISOString(), status: 'scheduled', notes: 'Foco em técnicas de relaxamento.'},
  ];
}


export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);


  useEffect(() => {
    if (patientId) {
      setIsLoading(true);
      Promise.all([
        fetchPatientDetails(patientId),
        fetchPatientSessions(patientId)
      ]).then(([patientData, sessionsData]) => {
        setPatient(patientData);
        setSessions(sessionsData);
        setIsLoading(false);
      }).catch(error => {
        console.error("Failed to fetch patient details or sessions:", error);
        setIsLoading(false);
        // Optionally redirect or show error message
      });
    }
  }, [patientId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!patient) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-4">Paciente não encontrado</h2>
        <Button onClick={() => router.push('/patients')}>Voltar para lista de pacientes</Button>
      </div>
    );
  }
  
  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setIsSessionFormOpen(true);
  }
  
  const handleNewSession = () => {
    setEditingSession(null); // Clear any previously editing session
    setIsSessionFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <Card className="shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 md:flex md:items-center md:gap-6">
          <Image 
            src={`https://placehold.co/128x128.png?text=${patient.name.charAt(0)}`} 
            alt={patient.name} 
            width={128} 
            height={128} 
            className="rounded-full border-4 border-background shadow-lg mx-auto md:mx-0"
            data-ai-hint="person avatar"
          />
          <div className="mt-4 md:mt-0 text-center md:text-left">
            <CardTitle className="text-3xl font-headline">{patient.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {patient.email && <span className="flex items-center justify-center md:justify-start mt-1"><Mail className="w-4 h-4 mr-2" /> {patient.email}</span>}
              {patient.phone && <span className="flex items-center justify-center md:justify-start mt-1"><Phone className="w-4 h-4 mr-2" /> {patient.phone}</span>}
              {patient.dateOfBirth && <span className="flex items-center justify-center md:justify-start mt-1"><CalendarDays className="w-4 h-4 mr-2" /> {format(parseISO(patient.dateOfBirth), "dd/MM/yyyy", { locale: ptBR })}</span>}
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" className="absolute top-4 right-4 md:static md:ml-auto" onClick={() => setIsPatientFormOpen(true)}>
            <Edit className="h-5 w-5" /> <span className="sr-only">Editar Paciente</span>
          </Button>
        </div>

        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-headline font-semibold mb-2">Endereço</h3>
            <p className="text-muted-foreground">{patient.address || "Não informado"}</p>
          </div>
          <Separator />
          <div>
            <h3 className="text-xl font-headline font-semibold mb-2 flex items-center"><FileText className="w-5 h-5 mr-2 text-primary"/> Histórico / Anotações</h3>
            <ScrollArea className="h-40 w-full rounded-md border p-3 bg-muted/20">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-body leading-relaxed">{patient.sessionNotes || "Nenhuma anotação registrada."}</pre>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-headline">Histórico de Sessões</CardTitle>
            <Button onClick={handleNewSession} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Sessão
            </Button>
        </CardHeader>
        <CardContent>
            {sessions.length > 0 ? (
                <ul className="space-y-3">
                    {sessions.map(s => (
                        <li key={s.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-sm">Data: {format(parseISO(s.startTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                    <p className="text-xs text-muted-foreground">Com: {s.psychologistName || 'Psicólogo não informado'}</p>
                                    <Badge variant={s.status === 'completed' ? 'secondary' : 'default'} className="mt-1 text-xs capitalize">
                                        {s.status === 'completed' ? 'Concluída' : s.status === 'scheduled' ? 'Agendada' : s.status}
                                    </Badge>
                                    {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">Nota: {s.notes.substring(0,50)}...</p>}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleEditSession(s)}>
                                    <Edit className="w-4 h-4 mr-1" /> Editar
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground">Nenhuma sessão registrada para este paciente.</p>
            )}
        </CardContent>
      </Card>

      <PatientFormDialog 
        isOpen={isPatientFormOpen} 
        onOpenChange={setIsPatientFormOpen}
        patient={patient}
        onSave={(updatedData) => {
          // Update patient data locally or refetch
          setPatient(prev => prev ? { ...prev, ...updatedData } : null);
          setIsPatientFormOpen(false);
        }}
      />
      
      <SessionFormDialog
        isOpen={isSessionFormOpen}
        onOpenChange={setIsSessionFormOpen}
        session={editingSession} // Pass the session being edited, or null for new
        // Ensure patientId is pre-filled if it's a new session for this patient
        onSave={(sessionData) => {
          console.log("Saving session for patient:", patientId, sessionData);
          // Add logic to save/update session (e.g., call API, update Zustand store)
          // For prototype, just close and log. Then refetch sessions.
          setIsSessionFormOpen(false);
          fetchPatientSessions(patientId).then(setSessions); // Refetch sessions after save
        }}
      />

    </div>
  );
}
