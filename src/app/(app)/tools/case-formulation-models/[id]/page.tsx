"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Network, Edit, ArrowLeft, Brain } from "lucide-react";
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CaseFormulationTemplate } from "@/app/(app)/tools/case-formulation-models/page";
import { mockCaseFormulationTemplates } from "@/app/(app)/tools/case-formulation-models/page";

export default function CaseFormulationModelDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const template: CaseFormulationTemplate | undefined = mockCaseFormulationTemplates.find(t => t.id === params.id);

  if (!template) {
    return (
      <div className="space-y-6 text-center py-10">
        <Network className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="text-3xl font-headline font-bold text-destructive">Modelo não encontrado</h1>
        <Button variant="outline" asChild>
          <Link href="/tools/case-formulation-models">Voltar para Modelos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4 sm:mb-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/tools/case-formulation-models/edit/${template.id}`}> 
            <Edit className="mr-2 h-4 w-4" /> Editar Modelo
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Network className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-headline font-bold">{template.name}</h1>
          </div>
          <CardDescription>
            Categoria: <span className="font-medium">{template.category}</span> | Última Atualização: {format(new Date(template.lastUpdated), "P", { locale: ptBR })}
          </CardDescription>
          {template.description && <p className="text-sm text-muted-foreground">{template.description}</p>}
        </CardHeader>
        <CardContent className="space-y-3">
          <h2 className="font-semibold flex items-center"><Brain className="mr-2 h-4 w-4 text-accent"/>Estrutura / Prompt</h2>
          <pre className="whitespace-pre-wrap text-sm bg-muted/40 p-4 rounded-md border">
{template.structurePrompt}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
