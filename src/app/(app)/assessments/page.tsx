import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList, PlusCircle, Search, Filter } from "lucide-react";
import Link from "next/link";
import AssessmentCard from "@/components/assessments/assessment-card";

const mockAssessments = [
  { id: "asm1", name: "Inventário de Depressão de Beck (BDI)", description: "Mede a severidade da depressão.", patientName: "Alice W.", dateSent: "2024-07-01", status: "Completed" as const, score: "15/63" },
  { id: "asm2", name: "Escala de Ansiedade GAD-7", description: "Rastreia transtorno de ansiedade generalizada.", patientName: "Bob B.", dateSent: "2024-07-10", status: "Pending" as const },
  { id: "asm3", name: "Escala de Autoestima de Rosenberg", description: "Mede a autoestima global.", patientName: "Charlie B.", dateSent: "2024-07-05", status: "Completed" as const, score: "25/30" },
  { id: "asm4", name: "Checklist de TEPT (PCL-5)", description: "Avalia sintomas de TEPT.", patientName: "Diana P.", dateSent: "2024-07-18", status: "Sent" as const },
];


export default function AssessmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-headline font-bold">Avaliações</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/assessments/templates/new">
              <span className="inline-flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Criar Novo Modelo
              </span>
            </Link>
          </Button>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/assessments/assign">
              <span className="inline-flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Atribuir Avaliação
              </span>
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline">Gerenciar Avaliações</CardTitle>
          <CardDescription>Acompanhe formulários de avaliação personalizados e seus status de preenchimento.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar avaliações..." className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mockAssessments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockAssessments.map(assessment => (
                <AssessmentCard key={assessment.id} assessment={assessment} showPatientInfo={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Nenhuma avaliação encontrada</h3>
              <p className="mt-1 text-sm text-muted-foreground">Comece criando um modelo de avaliação ou atribuindo um a um paciente.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
