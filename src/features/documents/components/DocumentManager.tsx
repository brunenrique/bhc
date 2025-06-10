
"use client";

import React, { useRef, useState, ChangeEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { DocumentResource, DocumentSignatureStatus, DocumentSignatureDetails } from "@/types";
import { 
  UploadCloud, FileText, FileArchive, Download, Trash2, MoreHorizontal, Search, Folder, FileUp, 
  ShieldAlert, SendToBack, ShieldCheck, ShieldX, Fingerprint, Eye // Signature icons
} from "lucide-react";
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
  onInitiateGovBRSignature: (documentId: string) => void;
  onUploadSignedGovBRDocument: (documentId: string, signedFile: File) => void;
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

const SignatureStatusIndicator: React.FC<{ status?: DocumentSignatureStatus }> = ({ status }) => {
  switch (status) {
    case 'pending_govbr_signature':
      return <Badge variant="outline" className="text-blue-600 border-blue-500 bg-blue-500/10"><SendToBack className="mr-1.5 h-3.5 w-3.5" />Pendente GOV.BR</Badge>;
    case 'signed':
      return <Badge variant="secondary" className="text-green-600 border-green-500 bg-green-500/10"><ShieldCheck className="mr-1.5 h-3.5 w-3.5" />Assinado</Badge>;
    case 'verification_failed':
      return <Badge variant="destructive"><ShieldX className="mr-1.5 h-3.5 w-3.5" />Falha Verif.</Badge>;
    case 'none':
    default:
      return <Badge variant="outline" className="text-yellow-600 border-yellow-500 bg-yellow-500/10"><ShieldAlert className="mr-1.5 h-3.5 w-3.5" />Não Assinado</Badge>;
  }
};

interface SignatureDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  details: DocumentSignatureDetails | undefined;
  documentName: string;
}

function SignatureDetailsDialog({ isOpen, onOpenChange, details, documentName }: SignatureDetailsDialogProps) {
  if (!details) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center"><Fingerprint className="mr-2 h-5 w-5 text-primary"/>Detalhes da Assinatura</DialogTitle>
          <DialogDescription>Para o documento: {documentName}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2 text-sm">
          <p><strong>Hash (Simulado):</strong> <span className="font-mono text-xs break-all">{details.hash || 'N/A'}</span></p>
          <p><strong>Informações do Assinante (Simulado):</strong> {details.signerInfo || 'N/A'}</p>
          <p><strong>Data da Assinatura (Simulada):</strong> {details.signedAt ? format(parseISO(details.signedAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : 'N/A'}</p>
          <p><strong>Código de Verificação (Simulado):</strong> {details.verificationCode || 'N/A'}</p>
          {details.p7sFile && <p><strong>Arquivo de Assinatura (.p7s):</strong> {details.p7sFile}</p>}
          {details.signedDocumentLink && details.signedDocumentLink !== '#' && (
             <p><strong>Documento Assinado:</strong> <Button variant="link" size="sm" asChild className="p-0 h-auto"><a href={details.signedDocumentLink} target="_blank" rel="noopener noreferrer">Visualizar/Baixar (Simulado)</a></Button></p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


const DocumentTable = React.memo(({ 
  docs, 
  onDelete, 
  onInitiateGovBRSignature, 
  onUploadSignedGovBRDocument 
}: { 
  docs: DocumentResource[], 
  onDelete: (id: string) => void,
  onInitiateGovBRSignature: (documentId: string) => void;
  onUploadSignedGovBRDocument: (documentId: string, signedFile: File) => void;
}) => {
  const [selectedDocForDetails, setSelectedDocForDetails] = useState<DocumentResource | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileUploadTrigger = (docId: string) => {
    fileInputRefs.current[docId]?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadSignedGovBRDocument(docId, file);
      event.target.value = ""; // Reset file input
    }
  };
  
  if (docs.length === 0) {
    return <p className="text-sm text-muted-foreground p-4 text-center">Nenhum documento nesta categoria.</p>;
  }
  return (
    <>
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px] hidden sm:table-cell"></TableHead>
            <TableHead>Nome do Arquivo</TableHead>
            <TableHead className="hidden md:table-cell">Status Assinatura</TableHead>
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
              <TableCell className="hidden md:table-cell">
                <SignatureStatusIndicator status={doc.signatureStatus} />
              </TableCell>
              <TableCell className="hidden lg:table-cell">{formatFileSize(doc.size)}</TableCell>
              <TableCell className="hidden md:table-cell">{format(parseISO(doc.uploadedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
              <TableCell className="text-right">
                <input 
                  type="file" 
                  accept=".p7s,.pdf"
                  ref={el => fileInputRefs.current[doc.id] = el} 
                  onChange={(e) => handleFileChange(e, doc.id)}
                  className="hidden"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações do Documento</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                       <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer">
                         <Download className="mr-2 h-4 w-4" /> Download Original
                       </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Assinatura GOV.BR (Simulado)</DropdownMenuLabel>
                    {doc.signatureStatus === 'none' && (
                      <DropdownMenuItem onClick={() => onInitiateGovBRSignature(doc.id)}>
                        <Fingerprint className="mr-2 h-4 w-4 text-blue-500" /> Iniciar Assinatura
                      </DropdownMenuItem>
                    )}
                    {doc.signatureStatus === 'pending_govbr_signature' && (
                      <DropdownMenuItem onClick={() => handleFileUploadTrigger(doc.id)}>
                        <UploadCloud className="mr-2 h-4 w-4 text-orange-500" /> Upload Doc. Assinado
                      </DropdownMenuItem>
                    )}
                    {doc.signatureStatus === 'signed' && doc.signatureDetails && (
                      <DropdownMenuItem onClick={() => setSelectedDocForDetails(doc)}>
                        <Eye className="mr-2 h-4 w-4 text-green-500" /> Ver Detalhes Assinatura
                      </DropdownMenuItem>
                    )}
                     {doc.signatureStatus === 'verification_failed' && (
                       <DropdownMenuItem disabled className="text-destructive">
                        <ShieldX className="mr-2 h-4 w-4" /> Falha na Verificação
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(doc.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir Documento
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    {selectedDocForDetails && (
      <SignatureDetailsDialog 
        isOpen={!!selectedDocForDetails}
        onOpenChange={(open) => !open && setSelectedDocForDetails(null)}
        details={selectedDocForDetails.signatureDetails}
        documentName={selectedDocForDetails.name}
      />
    )}
    </>
  );
});
DocumentTable.displayName = "DocumentTable";


export const DocumentManager = React.memo(function DocumentManager({ 
  documents, 
  onUpload, 
  onDelete, 
  searchTerm, 
  onSearchTermChange,
  onInitiateGovBRSignature,
  onUploadSignedGovBRDocument,
}: DocumentManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file); // This is for new, unsigned document uploads
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
          <CardDescription>Faça upload, organize e simule assinaturas GOV.BR.</CardDescription>
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
            <UploadCloud className="mr-2 h-5 w-5" /> Novo Documento
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
                  <DocumentTable 
                    docs={groupedDocuments[category]} 
                    onDelete={onDelete}
                    onInitiateGovBRSignature={onInitiateGovBRSignature}
                    onUploadSignedGovBRDocument={onUploadSignedGovBRDocument}
                  />
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
