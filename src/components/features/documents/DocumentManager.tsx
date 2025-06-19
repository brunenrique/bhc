"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DocumentResource } from "@/types";
import { UploadCloud, FileText, FileSpreadsheet, FileImage, FileArchive, Download, Trash2, MoreHorizontal, Search } from "lucide-react";
import { useRef, useState, ChangeEvent } from "react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


interface DocumentManagerProps {
  documents: DocumentResource[];
  onUpload: (file: File) => void;
  onDelete: (documentId: string) => void;
}

const getFileIcon = (type: DocumentResource['type']) => {
  switch (type) {
    case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
    case 'doc': return <FileText className="h-5 w-5 text-blue-500" />;
    // Add more cases for xls, ppt, img etc.
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


export function DocumentManager({ documents, onUpload, onDelete }: DocumentManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="font-headline">Gerenciador de Documentos</CardTitle>
          <CardDescription>Faça upload e gerencie seus arquivos.</CardDescription>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar documento..." 
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => fileInputRef.current?.click()} className="whitespace-nowrap">
            <UploadCloud className="mr-2 h-5 w-5" /> Upload
          </Button>
          <Input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
        </div>
      </CardHeader>
      <CardContent>
        {filteredDocuments.length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
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
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="hidden sm:table-cell">{getFileIcon(doc.type)}</TableCell>
                    <TableCell className="font-medium max-w-[200px] sm:max-w-xs md:max-w-sm truncate" title={doc.name}>
                      {doc.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell capitalize">{doc.type}</TableCell>
                    <TableCell className="hidden lg:table-cell">{formatFileSize(doc.size)}</TableCell>
                    <TableCell className="hidden md:table-cell">{format(parseISO(doc.uploadedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem asChild><a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" /> Download</a></DropdownMenuItem>
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
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <FileArchive className="mx-auto h-12 w-12 mb-2" />
            <p>Nenhum documento encontrado {searchTerm ? 'para "' + searchTerm + '"' : 'ainda'}.</p>
            <p>Clique em "Upload" para adicionar seu primeiro arquivo.</p>
          </div>
        )}
      </CardContent>
      {filteredDocuments.length > 0 && (
        <CardFooter className="text-sm text-muted-foreground">
          Mostrando {filteredDocuments.length} de {documents.length} documentos.
        </CardFooter>
      )}
    </Card>
  );
}
