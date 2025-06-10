
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardCard } from "@/components/ui/dashboard/DashboardCard";
import { ChartContainer } from "@/components/ui/dashboard/ChartContainer";
import { Users, UserCheck, CalendarCheck2, AlertTriangle, BarChart3, Activity } from "lucide-react"; // Added BarChart3 and Activity

// This is now a Server Component, so no client-side hooks like useAuth or useState directly here.
// Data fetching would typically happen here (e.g., from Firestore) or be passed as props.
// For now, we'll use mock data.

const mockOverviewData = {
  activePatients: Math.floor(Math.random() * 150) + 50, // e.g., 50-200
  activePsychologists: Math.floor(Math.random() * 10) + 3, // e.g., 3-13
  sessionsThisMonth: Math.floor(Math.random() * 300) + 100, // e.g., 100-400
  noShowRate: `${(Math.random() * 15 + 5).toFixed(1)}%`, // e.g., 5.0% - 20.0%
};

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      {/* The main title "Painel de Controle" is now in the layout, so we can have a more specific title here */}
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
          <div className="h-[350px] flex items-center justify-center text-muted-foreground bg-muted/30 rounded-md">
            <BarChart3 className="h-10 w-10 mr-2"/>
            <p>Gráfico de status das sessões (Ex: Agendadas, Realizadas, Canceladas) aparecerá aqui.</p>
          </div>
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
