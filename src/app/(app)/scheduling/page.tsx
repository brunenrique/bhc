
"use client";
// Removed SessionCalendar, selectedSession, currentCalendarDate, handleSaveSession related to old calendar
// Kept WaitingList related state and handlers
import { WaitingListTable } from "@/features/scheduling/components/WaitingListTable";
import { WaitingListEntryDialog } from "@/features/scheduling/components/WaitingListEntryDialog";
import { InteractiveCalendar } from "@/features/scheduling/components/InteractiveCalendar"; // New Calendar
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2, WifiOff, Wifi, ListPlus, CalendarDays } from "lucide-react"; // Added CalendarDays
import { useState, useCallback, useEffect } from "react";
import type { WaitingListEntry } from "@/types"; // Session type no longer needed here directly for calendar
import { parseISO, subDays } from 'date-fns'; // Session related date functions removed
import { cacheService } from '@/services/cacheService';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";
import { formatPhoneNumberToE164 } from "@/utils/formatter";


const initialMockWaitingList: WaitingListEntry[] = [
  { id: 'wl1', nomeCompleto: 'Mariana F. Lima', cpf: '111.222.333-44', contato: formatPhoneNumberToE164('(11) 99999-0001'), motivo: 'Primeira consulta, ansiedade', prioridade: 'normal', criadoEm: subDays(new Date(), 2).toISOString(), criadoPor: 'mockAdminUID', status: 'pendente'},
  { id: 'wl2', nomeCompleto: 'João Pedro S. Santos', cpf: '222.333.444-55', contato: formatPhoneNumberToE164('(21) 98888-0002'), motivo: 'Acompanhamento', prioridade: 'normal', criadoEm: subDays(new Date(), 5).toISOString(), criadoPor: 'mockPsychologistUID', status: 'pendente'},
  { id: 'wl3', nomeCompleto: 'Sofia C. Oliveira', cpf: '333.444.555-66', contato: formatPhoneNumberToE164('(31) 97777-0003'), motivo: 'Retorno', prioridade: 'urgente', criadoEm: subDays(new Date(), 1).toISOString(), criadoPor: 'mockSecretaryUID', status: 'pendente'},
];

export default function SchedulingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for Waiting List
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [isWaitingListEntryDialogOpen, setIsWaitingListEntryDialogOpen] = useState(false);
  const [editingWaitingListEntry, setEditingWaitingListEntry] = useState<WaitingListEntry | null>(null);

  // General loading and online state
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true); 

  // SessionFormDialog and selectedSession state (might be used if FullCalendar event click opens it)
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  // const [selectedSessionForForm, setSelectedSessionForForm] = useState<Partial<FirestoreSessionData> | null>(null);


  useEffect(() => {
    let isMounted = true;

    const updateOnlineStatus = () => {
      if (isMounted) setIsOnline(navigator.onLine);
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    if (typeof navigator !== "undefined") updateOnlineStatus(); 

    const loadData = async () => {
      setIsLoading(true);
      // Calendar data is now fetched within InteractiveCalendar.tsx
      // Only load waiting list data here.
      try {
        const cachedWaitingList = await cacheService.waitingList.getList();
        if (isMounted && cachedWaitingList && cachedWaitingList.length > 0) {
          setWaitingList(cachedWaitingList);
        } else if (isMounted) {
          setWaitingList(initialMockWaitingList);
          await cacheService.waitingList.setList(initialMockWaitingList);
        }
      } catch (error) {
         if (isMounted) setWaitingList(initialMockWaitingList);
      }

      if (isMounted) setIsLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Offline sync logic for pending sessions (if any were created outside FullCalendar context)
  // This might need adjustment if all session creation/updates go through FullCalendar now.
  useEffect(() => {
    const syncPendingSessions = async () => {
      if (isOnline) {
        const pending = await cacheService.pendingSessions.getList();
        if (pending && pending.length > 0) {
          // If using FullCalendar, this sync logic might need to update FullCalendar's event source
          // or trigger a refetch within InteractiveCalendar.
          // For now, just a toast.
          await cacheService.pendingSessions.clear();
          toast({
            title: "Sincronização Concluída (Simulado)",
            description: `${pending.length} sessão(ões) pendente(s) seriam sincronizadas. Atualize o calendário se necessário.`,
            className: "bg-primary text-primary-foreground"
          });
        }
      }
    };
    if (isOnline) { 
        syncPendingSessions();
    }
  }, [isOnline, toast]);


  const handleOpenNewWaitingListEntryDialog = useCallback(() => {
    if (!hasPermission(user?.role, 'ADD_PATIENT_TO_WAITING_LIST')) {
        toast({ title: "Acesso Negado", description: "Você não tem permissão para adicionar pacientes à lista de espera.", variant: "destructive"});
        return;
    }
    setEditingWaitingListEntry(null);
    setIsWaitingListEntryDialogOpen(true);
  }, [user, toast]);

  const handleEditWaitingListEntry = useCallback((entry: WaitingListEntry) => {
    setEditingWaitingListEntry(entry);
    setIsWaitingListEntryDialogOpen(true);
  }, []);
  
  const handleSaveWaitingListEntry = useCallback(async (entryData: Omit<WaitingListEntry, 'id' | 'criadoEm' | 'criadoPor'>, id?: string) => {
    if (!user?.id) {
        toast({ title: "Erro de Autenticação", description: "Não foi possível identificar o usuário logado.", variant: "destructive" });
        return;
    }
    let updatedList;
    if (id && editingWaitingListEntry) { 
      const updatedEntry = { ...editingWaitingListEntry, ...entryData };
      updatedList = waitingList.map(e => e.id === id ? updatedEntry : e);
      toast({ title: "Entrada Atualizada", description: "Dados da lista de espera atualizados." });
    } else { 
      const newEntry: WaitingListEntry = {
        id: `wl-${Date.now()}`,
        criadoEm: new Date().toISOString(),
        criadoPor: user.id,
        status: 'pendente',
        ...entryData,
      };
      updatedList = [newEntry, ...waitingList];
      toast({ title: "Adicionado à Lista de Espera", description: `${newEntry.nomeCompleto} foi adicionado(a).` });
    }
    setWaitingList(updatedList.sort((a,b) => parseISO(b.criadoEm).getTime() - parseISO(a.criadoEm).getTime()));
    await cacheService.waitingList.setList(updatedList);
    setIsWaitingListEntryDialogOpen(false);
    setEditingWaitingListEntry(null);
  }, [editingWaitingListEntry, waitingList, toast, user]);

  const handleDeleteWaitingListEntry = useCallback(async (entryId: string) => {
    const entryToDelete = waitingList.find(e => e.id === entryId);
    const updatedList = waitingList.filter(e => e.id !== entryId);
    setWaitingList(updatedList);
    await cacheService.waitingList.setList(updatedList);
    toast({ title: "Removido da Lista", description: `${entryToDelete?.nomeCompleto || 'A entrada'} foi removida.`, variant: "destructive" });
  }, [waitingList, toast]);

  const handleChangeWaitingListStatus = useCallback(async (entryId: string, status: WaitingListEntry['status']) => {
    const entryToUpdate = waitingList.find(e => e.id === entryId);
    if (!entryToUpdate) return;

    const updatedList = waitingList.map(e => e.id === entryId ? { ...e, status } : e);
    setWaitingList(updatedList.sort((a,b) => parseISO(b.criadoEm).getTime() - parseISO(a.criadoEm).getTime()));
    await cacheService.waitingList.setList(updatedList);
    toast({ title: "Status Atualizado", description: `Status de ${entryToUpdate.nomeCompleto} alterado para "${status}".` });
  }, [waitingList, toast]);
  
  const handleScheduleFromWaitingList = useCallback((entry: WaitingListEntry) => {
     if (!hasPermission(user?.role, 'SCHEDULE_FROM_WAITING_LIST')) {
        toast({ title: "Acesso Negado", description: "Você não tem permissão para agendar sessões a partir da lista de espera.", variant: "destructive"});
        return;
    }
    // This would ideally pre-fill a form for the new FullCalendar
    // For now, just a toast as FullCalendar handles its own creation/editing.
    // To integrate: one might open a modal (like SessionFormDialog, adapted) 
    // with patient details from 'entry' pre-filled, and upon saving, add event to FullCalendar.
    toast({
      title: "Agendar Paciente (Simulado)",
      description: `Abra o calendário e crie uma nova sessão para ${entry.nomeCompleto}. Detalhes: CPF ${entry.cpf}, Contato ${entry.contato}.`,
      duration: 7000,
    });
    handleChangeWaitingListStatus(entry.id, 'agendado');
  }, [user, toast, handleChangeWaitingListStatus]);

  // const canCreateNewSession = hasPermission(user?.role, 'SCHEDULE_FROM_WAITING_LIST') || hasPermission(user?.role, 'CREATE_EDIT_CLINICAL_NOTES');
  const canAddWaitingList = hasPermission(user?.role, 'ADD_PATIENT_TO_WAITING_LIST');
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-headline font-semibold">Agendamentos</h1>
        </div>
        <div className="flex items-center gap-2">
           {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-destructive" />}
            <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-destructive'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          {/* Button for new session might be part of FullCalendar's header or a separate button that interacts with it */}
          {/* {canCreateNewSession && (
            <Button onClick={() => {}} className="shadow-md hover:shadow-lg transition-shadow">
                <PlusCircle className="mr-2 h-5 w-5" />
                Nova Sessão (Calendário)
            </Button>
          )} */}
        </div>
      </div>
      <p className="text-muted-foreground font-body">
        Visualize e gerencie os agendamentos de sessões no calendário interativo.
        {isOnline ? "" : " Você está offline. As sessões criadas/alteradas no calendário podem não ser sincronizadas imediatamente."}
      </p>
      
      {isLoading && waitingList.length === 0 ? ( // Adjusted loading condition
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
        <InteractiveCalendar /> 
        
        <div id="waiting-list" className="pt-12"> {/* Added more top padding */}
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                        <ListPlus className="h-6 w-6 text-primary" />
                        <CardTitle className="text-xl font-headline">Lista de Espera</CardTitle>
                    </div>
                    {canAddWaitingList && (
                        <Button onClick={handleOpenNewWaitingListEntryDialog} size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar à Lista
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <WaitingListTable 
                        entries={waitingList}
                        onSchedule={handleScheduleFromWaitingList}
                        onEdit={handleEditWaitingListEntry}
                        onDelete={handleDeleteWaitingListEntry}
                        onChangeStatus={handleChangeWaitingListStatus}
                        currentUserRole={user?.role}
                    />
                </CardContent>
            </Card>
        </div>
        </>
      )}

      {/* SessionFormDialog is kept if needed for creating events on FullCalendar via a modal */}
      {/* For now, FullCalendar's select callback is commented out, so this dialog isn't triggered by it */}
      {/* <SessionFormDialog
            isOpen={isSessionFormOpen}
            onOpenChange={setIsSessionFormOpen}
            session={selectedSessionForForm} // Needs to be adapted for FirestoreSessionData or EventInput
            onSave={() => {}} // Needs new save handler for FullCalendar events
        /> */}

      {isWaitingListEntryDialogOpen && (
        <WaitingListEntryDialog
            isOpen={isWaitingListEntryDialogOpen}
            onOpenChange={setIsWaitingListEntryDialogOpen}
            entry={editingWaitingListEntry}
            onSave={handleSaveWaitingListEntry}
        />
      )}
    </div>
  );
}
