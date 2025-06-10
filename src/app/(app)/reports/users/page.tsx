
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users2 } from "lucide-react";

export default function ReportsUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users2 className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Relatório de Usuários</h1>
      </div>
      <p className="text-muted-foreground font-body">
        Visualize e gerencie os usuários da plataforma (psicólogos, secretários, administradores).
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>Funcionalidade a ser implementada.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aqui será exibida a tabela de usuários com opções de edição, adição e remoção.</p>
        </CardContent>
      </Card>
    </div>
  );
}
