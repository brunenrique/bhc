
"use client";
import { WaitingListTable } from "@/features/scheduling/components/WaitingListTable";
import { WaitingListEntryDialog } from "@/features/scheduling/components/WaitingListEntryDialog";
import { InteractiveCalendar } from "@/features/scheduling/components/InteractiveCalendar"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2, WifiOff, Wifi, ListPlus, CalendarDays, MapPin } from "lucide-react"; 
import { useState, useCallback, useEffect } from "react";
import type { WaitingListEntry } from "@/types"; 
import { parseISO, subDays } from 'date-fns'; 
import { cacheService } from '@/services/cacheService';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";
import { formatPhoneNumberToE164 } from "@/utils/formatter";


const initialMockWaitingList: WaitingListEntry[] = [
  { id: 'wl1', nomeCompleto: 'Mariana F. Lima', cpf: '111.222.333-44', contato: formatPhoneNumberToE164('(11) 99999-0001'), motivo: 'Primeira consulta, ansiedade', prioridade: 'normal', criadoEm: subDays(new Date(), 2).toISOString(), criadoPor: 'mockAdminUID', status: 'pendente'},
  { id: 'wl2', nomeCompleto: 'João Pedro S. Santos', cpf: '222.333.444-55', contato: formatPhoneNumberToE164('(21) 98888-0002'), motivo: 'Acompanhamento', prioridade: 'normal', criadoEm: subDays(new Date(), 5).toISOString(), criadoPor: 'mockPsychologistUID', status: 'pendente'},
  { id: 'wl3', nomeCompleto: 'Sofia C. Oliveira', cpf: '333.444.555-66', contato: formatPhoneNumberToE164('(31) 97777-0003'), motivo: 'Retorno', prioridade: 'urgente', criadoEm: subDays(new Date(), 1).toISOString(), criadoPor: 'mockSecretaryUID', status: 'pendente'},
  { id: 'wl4', nomeCompleto: 'Ricardo Almeida', cpf: '444.555.666-77', contato: formatPhoneNumberToE164('(41) 96666-0004'), motivo: 'Avaliação neuropsicológica', prioridade: 'normal', criadoEm: subDays(new Date(), 10).toISOString(), criadoPor: 'mockPsychologistUID', status: 'pendente'},
  { id: 'wl5', nomeCompleto: 'Beatriz Costa', cpf: '555.666.777-88', contato: formatPhoneNumberToE164('(51) 95555-0005'), motivo: 'Terapia de casal', prioridade: 'urgente', criadoEm: subDays(new Date(), 3).toISOString(), criadoPor: 'mockAdminUID', status: 'agendado'},
  { id: 'wl6', nomeCompleto: 'Thiago Ferreira', cpf: '666.777.888-99', contato: formatPhoneNumberToE164('(61) 94444-0006'), motivo: 'Orientação vocacional', prioridade: 'normal', criadoEm: subDays(new Date(), 7).toISOString(), criadoPor: 'mockSecretaryUID', status: 'pendente'},
];

export default function SchedulingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [isWaitingListEntryDialogOpen, setIsWaitingListEntryDialogOpen] = useState(false);
  const [editingWaitingListEntry, setEditingWaitingListEntry] = useState<WaitingListEntry | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true); 

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
      try {
        const cachedWaitingList = await cacheService.waitingList.getList();
        if (isMounted && cachedWaitingList && cachedWaitingList.length > 0) {
          setWaitingList(cachedWaitingList.sort((a,b) => parseISO(b.criadoEm).getTime() - parseISO(a.criadoEm).getTime()));
        } else if (isMounted) {
          setWaitingList(initialMockWaitingList.sort((a,b) => parseISO(b.criadoEm).getTime() - parseISO(a.criadoEm).getTime()));
          await cacheService.waitingList.setList(initialMockWaitingList);
        }
      } catch (error) {
         if (isMounted) setWaitingList(initialMockWaitingList.sort((a,b) => parseISO(b.criadoEm).getTime() - parseISO(a.criadoEm).getTime()));
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
 
  useEffect(() => {
    const syncPendingSessions = async () => {
      if (isOnline) {
        const pending = await cacheService.pendingSessions.getList();
        if (pending && pending.length > 0) {
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
    toast({
      title: "Agendar Paciente (Simulado)",
      description: `Abra o calendário e crie uma nova sessão para ${entry.nomeCompleto}. Detalhes: CPF ${entry.cpf}, Contato ${entry.contato}.`,
      duration: 7000,
    });
    handleChangeWaitingListStatus(entry.id, 'agendado');
  }, [user, toast, handleChangeWaitingListStatus]);

  const canAddWaitingList = hasPermission(user?.role, 'ADD_PATIENT_TO_WAITING_LIST');
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-headline font-semibold">Agendamentos por Local</h1>
        </div>
        <div className="flex items-center gap-2">
           {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-destructive" />}
            <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-destructive'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
        </div>
      </div>
      <p className="text-muted-foreground font-body">
        Visualize os horários disponíveis dos psicólogos por local (semana atual e próxima).
        {isOnline ? "" : " Você está offline. Os calendários podem não refletir a disponibilidade mais recente."}
      </p>
      
      {isLoading && waitingList.length === 0 ? ( 
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InteractiveCalendar locationName="Centro" />
          <InteractiveCalendar locationName="Fazendinha" />
        </div>
        
        <div id="waiting-list" className="pt-12"> 
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

