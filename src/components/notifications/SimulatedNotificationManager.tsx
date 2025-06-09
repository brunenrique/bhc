
"use client";

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BellRing } from 'lucide-react';

// Mock de algumas sessões/tarefas futuras para simular lembretes
const mockUpcomingEvents = [
  { id: 'event1', title: 'Sessão com Ana Silva', time: new Date(Date.now() + 1000 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  { id: 'event2', title: 'Revisar avaliação de Bruno Costa', time: new Date(Date.now() + 1000 * 60 * 15).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
];

export function SimulatedNotificationManager() {
  const { toast } = useToast();

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    const showReminderToast = (title: string, scheduledTime: string) => {
      toast({
        title: (
          <div className="flex items-center">
            <BellRing className="mr-2 h-5 w-5 text-primary" />
            Lembrete de Tarefa/Sessão
          </div>
        ),
        description: `${title} - Agendado para ${scheduledTime}. (Simulação)`,
        duration: 10000, // 10 segundos
      });
    };

    // Configura um timer para o primeiro evento mockado (após 7 segundos para demonstração)
    if (mockUpcomingEvents.length > 0) {
      const firstEvent = mockUpcomingEvents[0];
      const timer1 = setTimeout(() => {
        showReminderToast(firstEvent.title, firstEvent.time);
      }, 7000); 
      timers.push(timer1);
    }
    
    // Configura um timer para o segundo evento mockado (após 14 segundos para demonstração)
     if (mockUpcomingEvents.length > 1) {
      const secondEvent = mockUpcomingEvents[1];
      const timer2 = setTimeout(() => {
        showReminderToast(secondEvent.title, secondEvent.time);
      }, 14000); 
      timers.push(timer2);
    }

    // Limpa os timers quando o componente é desmontado
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toast]);

  // Este componente não renderiza nada visualmente, apenas gerencia os toasts.
  // No PRD, isso seria idealmente gerenciado por Firebase Cloud Functions e um listener no frontend.
  return null;
}
