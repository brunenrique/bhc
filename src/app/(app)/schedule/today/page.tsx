"use client";

import { CalendarDays } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TodayAppointment {
  id: string;
  time: string;
  patient: string;
  status: string;
}

const todayAppointments: TodayAppointment[] = [
  { id: "appt1", time: "08:30", patient: "Alice Wonderland", status: "Confirmado" },
  { id: "appt2", time: "10:00", patient: "Bob Builder", status: "Agendado" },
  { id: "appt3", time: "14:30", patient: "Charlie Brown", status: "Realizado" },
];

export default function TodaySchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-headline font-bold">Agenda de Hoje</h1>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border -z-10" />
        <ul className="space-y-6">
          {todayAppointments.map((appt) => (
            <li key={appt.id} className="flex items-start gap-4">
              <span className="w-12 text-right text-sm font-medium pt-2">
                {appt.time}
              </span>
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{appt.patient}</CardTitle>
                  <CardDescription>{appt.status}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
