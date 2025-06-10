
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardCard } from "@/components/ui/dashboard/DashboardCard";
import { ChartContainer } from "@/components/ui/dashboard/ChartContainer";
import { Users, UserCheck, CalendarCheck2, AlertTriangle, Activity } from "lucide-react"; 
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import type { SessionStatusData } from "@/components/charts/SessionStatusChart"; // Import the type

const SessionStatusChart = dynamic(() => 
  import('@/components/charts/SessionStatusChart').then(mod => mod.SessionStatusChart), 
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full" />
  }
);

const mockOverviewData = {
  activePatients: Math.floor(Math.random() * 150) + 50,
  activePsychologists: Math.floor(Math.random() * 10) + 3,
  sessionsThisMonth: Math.floor(Math.random() * 300) + 100,
  noShowRate: `${(Math.random() * 15 + 5).toFixed(1)}%`,
};

// Mock data for the SessionStatusChart
const mockSessionStatusData: SessionStatusData = {
  scheduled: Math.floor(Math.random() * 50) + 20,
  completed: Math.floor(Math.random() * 100) + 50,
  cancelled: Math.floor(Math.random() * 20) + 5,
  noShow: Math.floor(Math.random() * 15) + 3,
};

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-semibold">Visão Geral da Clínica</h1>
      <p className="text-muted-foreground font-body">
        Um resumo das atividades e principais indicadores da clínica. (Dados de exemplo)
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Pacientes Ativos"
          value={mockOverviewData.activePatients}
          icon={<Users className="h-6 w-6 text-primary" />}
          description="Total de pacientes com acompanhamento."
          className="shadow-lg hover:shadow-xl transition-shadow"
        />
        <DashboardCard
          title="Psicólogos Ativos"
          value={mockOverviewData.activePsychologists}
          icon={<UserCheck className="h-6 w-6 text-accent" />}
          description="Profissionais realizando atendimentos."
          className="shadow-lg hover:shadow-xl transition-shadow"
        />
        <DashboardCard
          title="Sessões no Mês"
          value={mockOverviewData.sessionsThisMonth}
          icon={<CalendarCheck2 className="h-6 w-6 text-green-500" />}
          description="Total de sessões realizadas este mês."
          className="shadow-lg hover:shadow-xl transition-shadow"
        />
        <DashboardCard
          title="Taxa de No-Show"
          value={mockOverviewData.noShowRate}
          icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
          description="Percentual de faltas em sessões agendadas."
          className="shadow-lg hover:shadow-xl transition-shadow"
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ChartContainer 
          title="Status das Sessões no Mês" 
          description="Distribuição das sessões por status no mês corrente."
          className="shadow-lg"
        >
          <SessionStatusChart data={mockSessionStatusData} />
        </ChartContainer>
        
        <ChartContainer 
          title="Canais de Entrada de Pacientes"
          description="Origem dos novos pacientes que chegam à clínica."
          className="shadow-lg"
        >
          <div className="h-[350px] flex items-center justify-center text-muted-foreground bg-muted/30 rounded-md">
            <Activity className="h-10 w-10 mr-2"/>
            <p>Gráfico de canais de entrada (Ex: Indicação, Site, Convênio) aparecerá aqui.</p>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
