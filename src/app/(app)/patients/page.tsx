"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, Search, Filter, Users } from "lucide-react";
import Link from "next/link";
import PatientListItem from "@/components/patients/patient-list-item";
import { mockPatients, type MockPatient } from "@/mocks/patients";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkUserRole } from "@/services/authRole";
import EmptyState from "@/components/ui/empty-state";
import PatientListItemSkeleton from "@/components/patients/patient-list-item-skeleton";
import { APP_ROUTES } from "@/lib/routes";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<MockPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole(["Admin", "Psychologist", "Secretary"]).then((ok) => {
      if (!ok) router.replace("/");
    });

    const timer = setTimeout(() => {
      setPatients(mockPatients);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-headline font-bold">Pacientes</h1>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/patients/new">
            <span>
              <UserPlus className="mr-2 h-4 w-4" /> Adicionar Novo Paciente
            </span>
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline">Registros de Pacientes</CardTitle>
          <CardDescription>Gerencie e visualize as informações dos pacientes.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar pacientes..." className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <PatientListItemSkeleton key={`skeleton-${idx}`} />
              ))}
            </div>
          ) : patients.length > 0 ? (
            <div className="space-y-4">
              {patients.map((patient) => (
                <PatientListItem key={patient.id} patient={patient} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users className="mx-auto h-12 w-12 text-muted-foreground" />}
              title="Nenhum paciente encontrado"
              description="Comece adicionando um novo paciente."
              action={
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href={APP_ROUTES.newPatient}>
                    <span>
                      <UserPlus className="mr-2 h-4 w-4" /> Adicionar Novo Paciente
                    </span>
                  </Link>
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
