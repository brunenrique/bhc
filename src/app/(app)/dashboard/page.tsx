"use client";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, PieChart, Users, CalendarCheck, AlertTriangle } from 'lucide-react';

// Dynamically import chart components
const WeeklySessionsChart = dynamic(() => import('@/components/dashboard/WeeklySessionsChart').then(mod => mod.WeeklySessionsChart), { 
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><p>Carregando gráfico...</p></div> 
});
const OccupancyRateChart = dynamic(() => import('@/components/dashboard/OccupancyRateChart').then(mod => mod.OccupancyRateChart), { 
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><p>Carregando gráfico...</p></div> 
});
const CommonIssuesChart = dynamic(() => import('@/components/dashboard/CommonIssuesChart').then(mod => mod.CommonIssuesChart), { 
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><p>Carregando gráfico...</p></div> 
});


export default function DashboardPage() {
  const { user } = useAuth();

  const summaryStats = [
    { title: "Pacientes Ativos", value: "78", icon: Users, color: "text-primary" },
    { title: "Sessões Hoje", value: "12", icon: CalendarCheck, color: "text-green-500" },
    { title: "Avaliações Pendentes", value: "5", icon: AlertTriangle, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-semibold">Dashboard</h1>
      <p className="text-muted-foreground font-body">
        Bem-vindo(a) de volta, {user?.name || 'Usuário'}! Aqui está um resumo da sua clínica.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaryStats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-headline">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">{stat.value}</div>
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Sessões Semanais</CardTitle>
            <CardDescription>Visão geral das sessões realizadas na última semana.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklySessionsChart />
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><PieChart className="mr-2 h-5 w-5 text-accent" />Taxa de Ocupação</CardTitle>
            <CardDescription>Taxa de ocupação dos psicólogos.</CardDescription>
          </CardHeader>
          <CardContent>
            <OccupancyRateChart />
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Problemas Prevalentes (Exemplo)</CardTitle>
          <CardDescription>Insights sobre os temas mais comuns nas sessões.</CardDescription>
        </CardHeader>
        <CardContent>
          <CommonIssuesChart />
        </CardContent>
      </Card>
    </div>
  );
}
