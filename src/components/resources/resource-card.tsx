
"use client";

import React from 'react'; // Import React
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, FileImage, FileArchive, Download, Share2, Trash2, Users, Edit } from "lucide-react";

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Resource {
  id: string;
  name: string;
  type: "pdf" | "docx" | "image" | "other";
  size: string;
  uploadDate?: string; 
  sharedDate?: string; 
  sharedWith?: number; 
  dataAiHint?: string;
}

interface ResourceCardProps {
  resource: Resource;
  isGlobalList?: boolean; 
}

function ResourceCardComponent({ resource, isGlobalList = false }: ResourceCardProps) {
  const getFileIcon = () => {
    switch (resource.type) {
      case "pdf": return <FileText className="h-8 w-8 text-red-500" />;
      case "docx": return <FileText className="h-8 w-8 text-blue-500" />;
      case "image": return <FileImage className="h-8 w-8 text-green-500" />;
      default: return <FileArchive className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const dateToDisplay = isGlobalList ? resource.uploadDate : resource.sharedDate;
  const dateLabel = isGlobalList ? "Carregado" : "Compartilhado";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getFileIcon()}
          <CardTitle className="font-headline text-md flex-1 leading-tight_">{resource.name}</CardTitle>
        </div>
         {resource.type === "image" && (
            <div className="mt-2 aspect-video relative rounded-md overflow-hidden bg-muted">
                 <Image src={`https://placehold.co/300x200.png`} alt={resource.name} layout="fill" objectFit="cover" data-ai-hint={resource.dataAiHint || "imagem abstrata"}/>
            </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow text-xs text-muted-foreground space-y-1">
        <p>Tipo: <Badge variant="outline" className="uppercase tracking-wide">{resource.type}</Badge></p>
        <p>Tamanho: {resource.size}</p>
        {dateToDisplay && <p>{dateLabel}: {format(new Date(dateToDisplay), "P", { locale: ptBR })}</p>}
        {isGlobalList && resource.sharedWith !== undefined && (
          <p className="flex items-center"><Users className="mr-1 h-3 w-3" /> Compartilhado com {resource.sharedWith} paciente(s)</p>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3">
        <div className="flex w-full justify-end gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Baixar recurso ${resource.name}`}>
            <Download className="h-4 w-4" />
          </Button>
          {isGlobalList && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Compartilhar recurso ${resource.name}`}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Editar recurso ${resource.name}`}>
                <Edit className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" aria-label={`Excluir recurso ${resource.name}`}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

const ResourceCard = React.memo(ResourceCardComponent);
export default ResourceCard;
