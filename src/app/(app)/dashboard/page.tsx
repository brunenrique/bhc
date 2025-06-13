
"use client"; 

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Users, CalendarCheck, ArrowUpRight, LineChart, UsersRound, CalendarClock, UserX, FileX2, Repeat, CalendarDays, ClipboardList } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { SkeletonBox } from "@/components/ui/skeleton-box";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentActivityItem } from "@/components/dashboard/recent-activity-item";
import StatsCard from "@/components/dashboard/stats-card";


const OccupancyChart = dynamic(() => import('@/components/dashboard/occupancy-chart').then(mod => mod.OccupancyChart), {
  loading: () => <SkeletonBox className="h-[300px] w-full" />,
  ssr: false,
});
const PerformanceChart = dynamic(() => import('@/components/dashboard/performance-chart').then(mod => mod.PerformanceChart), {
  loading: () => <SkeletonBox className="h-[300px] w-full" />,
  ssr: false,
});
const DashboardWeeklySchedule = dynamic(() => import("@/components/dashboard/dashboard-weekly-schedule"), {
  loading: () => (
    <Card className="shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-1/3 mb-1" />
        <Skeleton className="h-4 w-1/4" />
      </CardHeader>
      <CardContent className="h-[400px] flex items-center justify-center">
        <SkeletonBox className="h-[350px] w-full" />
      </CardContent>
    </Card>
  ),
  ssr: false,
});


export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500); // Simulate loading time
    return () => clearTimeout(timer);
  }, []);
  const upcomingAppointments = [
    { id: '1', patientName: 'Alice Wonderland', time: '10:00', psychologist: 'Dr. Silva' },
    { id: '2', patientName: 'Bob O Construtor', time: '11:30', psychologist: 'Dra. Jones' },
    { id: '3', patientName: 'Charlie Brown', time: '14:00', psychologist: 'Dr. Silva' },
  ];

  const recentActivities = [
    { id: 'act1', description: 'Nova paciente "Eva Green" adicionada.', time: 'Há 2 horas', icon: <Users className="w-4 h-4" /> },
    { id: 'act2', description: 'Notas da sessão de "Alice W." finalizadas.', time: 'Há 5 horas', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'act3', description: 'Agendamento com "Bob O." remarcado.', time: 'Há 1 dia', icon: <CalendarCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline font-bold">Painel</h1>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/schedule/new">
            <CalendarCheck className="mr-2 h-4 w-4" /> Novo Agendamento
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
 {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(7)].map((_, i) => (
            <SkeletonBox key={i} className="h-[120px] w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Pacientes Ativos" value="78" icon={<UsersRound className="text-primary" />} trend="+2 esta semana" href="/patients" />
          <StatsCard title="Consultas Hoje" value="8" icon={<CalendarClock className="text-primary" />} trend="2 pendentes" href="/schedule/today" />
          <StatsCard title="Sessões Este Mês" value="45" icon={<LineChart className="text-primary" />} trend="+10% vs mês passado" />
          <StatsCard title="Tarefas Abertas" value="12" icon={<Activity className="text-primary" />} trend="3 atrasadas" href="/tasks" />
          <StatsCard title="Ausências no Mês" value="3" icon={<UserX className="text-primary" />} trend="-1 vs mês passado" />
          <StatsCard title="Cancelamentos no Mês" value="5" icon={<FileX2 className="text-primary" />} trend="+2 vs mês passado" />
          <StatsCard title="Remarcações no Mês" value="7" icon={<Repeat className="text-primary" />} trend="Estável" />
        </div>
      )}

      {/* Weekly Schedule Section */}
      {isLoading ? (
        <SkeletonBox className="h-[400px] w-full" />
      ) : (
        <DashboardWeeklySchedule />
      )}

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Ocupação da Agenda</CardTitle>
 {isLoading ? <Skeleton className="h-4 w-1/2" /> : <CardDescription>Tendências de ocupação semanal</CardDescription>}
          </CardHeader>
          <CardContent className="h-[300px]">
 {isLoading ? <SkeletonBox className="h-[260px] w-full" /> : <OccupancyChart />}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Desempenho dos Psicólogos</CardTitle>
 {isLoading ? <Skeleton className="h-4 w-1/2" /> : <CardDescription>Sessões concluídas por psicólogo</CardDescription>}
          </CardHeader>
          <CardContent className="h-[300px]">
 {isLoading ? <SkeletonBox className="h-[260px] w-full" /> : <PerformanceChart />}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Próximos Agendamentos</CardTitle>
 {isLoading && <Skeleton className="h-4 w-1/3" />}
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <SkeletonBox key={i} className="h-[60px] w-full" />
                ))}
              </>
            ) : upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-md"
                >
                  <div>
                    <p className="font-semibold">{appt.patientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {appt.psychologist}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{appt.time}</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-accent"
                      asChild
                    >
                      <Link href={`/patients/${appt.id}`}>Ver Detalhes</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                Nenhum próximo agendamento.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
 {isLoading && <Skeleton className="h-4 w-1/3" />}
            <CardTitle className="font-headline">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <SkeletonBox key={i} className="h-[60px] w-full" />
                ))}
              </>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <RecentActivityItem
                  key={activity.id}
                  description={activity.description}
                  time={activity.time}
                  icon={activity.icon}
                />
              ))
            ) : (
              <p className="text-muted-foreground">
                Nenhuma atividade recente.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
