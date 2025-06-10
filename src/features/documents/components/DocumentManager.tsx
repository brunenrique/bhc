
"use client";

import React, { useRef, useState, ChangeEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DocumentResource } from "@/types";
import { UploadCloud, FileText, FileArchive, Download, Trash2, MoreHorizontal, Search, Folder, FileUp } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


interface DocumentManagerProps {
  documents: DocumentResource[];
  onUpload: (file: File) => void;
  onDelete: (documentId: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const getFileIcon = (type: DocumentResource['type']) => {
  switch (type) {
    case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
    case 'doc': case 'docx': return <FileText className="h-5 w-5 text-blue-500" />;
    default: return <FileArchive className="h-5 w-5 text-gray-500" />;
  }
};

const formatFileSize = (bytes: number | undefined): string => {
  if (bytes === undefined) return '-';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const DocumentTable = React.memo(({ docs, onDelete }: { docs: DocumentResource[], onDelete: (id: string) => void }) => {
  if (docs.length === 0) {
    return <p className="text-sm text-muted-foreground p-4 text-center">Nenhum documento nesta categoria.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] hidden sm:table-cell"></TableHead>
            <TableHead>Nome do Arquivo</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead className="hidden lg:table-cell">Tamanho</TableHead>
            <TableHead className="hidden md:table-cell">Data de Upload</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docs.map((doc) => (
            <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="hidden sm:table-cell">{getFileIcon(doc.type)}</TableCell>
              <TableCell className="font-medium max-w-[150px] sm:max-w-xs md:max-w-sm truncate" title={doc.name}>
                {doc.name}
              </TableCell>
              <TableCell className="hidden md:table-cell capitalize">{doc.type}</TableCell>
              <TableCell className="hidden lg:table-cell">{formatFileSize(doc.size)}</TableCell>
              <TableCell className="hidden md:table-cell">{format(parseISO(doc.uploadedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                       <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer">
                         <Download className="mr-2 h-4 w-4" /> Download
                       </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(doc.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
DocumentTable.displayName = "DocumentTable";


export const DocumentManager = React.memo(function DocumentManager({ documents, onUpload, onDelete, searchTerm, onSearchTermChange }: DocumentManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      if(fileInputRef.current) { 
        fileInputRef.current.value = "";
      }
    }
  };

  const groupedDocuments = useMemo(() => {
    return documents.reduce((acc, doc) => {
      const category = doc.category || "Outros";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    }, {} as Record<string, DocumentResource[]>);
  }, [documents]);

  const categories = Object.keys(groupedDocuments).sort();
  const defaultOpenCategories = useMemo(() => {
    if (searchTerm) { 
        return categories.filter(category => groupedDocuments[category].some(doc => 
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (doc.category && doc.category.toLowerCase().includes(searchTerm.toLowerCase()))
        ));
    }
    const uploadsRecentes = "Uploads Recentes";
    if (categories.includes(uploadsRecentes) && groupedDocuments[uploadsRecentes]?.length > 0) return [uploadsRecentes];
    if (categories.length > 0) return [categories[0]];
    return [];
  }, [groupedDocuments, searchTerm, categories]);


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="font-headline">Gerenciador de Documentos</CardTitle>
          <CardDescription>Faça upload e organize seus arquivos por categoria.</CardDescription>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar documento..." 
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
            />
          </div>
          <Button onClick={() => fileInputRef.current?.click()} className="whitespace-nowrap">
            <UploadCloud className="mr-2 h-5 w-5" /> Upload
          </Button>
          <Input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
        </div>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <Accordion type="multiple" defaultValue={defaultOpenCategories} className="w-full">
            {categories.map(category => (
              <AccordionItem value={category} key={category}>
                <AccordionTrigger className="hover:no-underline text-base">
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" /> 
                    {category} ({groupedDocuments[category].length})
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t pt-2">
                  <DocumentTable docs={groupedDocuments[category]} onDelete={onDelete} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <FileUp className="mx-auto h-12 w-12 mb-2" />
            <p>Nenhum documento encontrado {searchTerm ? 'para "' + searchTerm + '"' : 'ainda'}.</p>
            <p>Clique em "Upload" para adicionar seu primeiro arquivo.</p>
          </div>
        )}
      </CardContent>
      {documents.length > 0 && (
        <CardFooter className="text-sm text-muted-foreground">
          Total de {documents.length} documento(s) {searchTerm ? 'correspondendo à busca' : ''} em {categories.length} categoria(s).
        </CardFooter>
      )}
    </Card>
  );
});
DocumentManager.displayName = "DocumentManager";
