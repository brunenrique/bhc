
"use client";
import { DocumentManager } from "@/features/documents/components/DocumentManager";
import type { DocumentResource } from "@/types";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cacheService } from "@/services/cacheService";

const mockDocumentsData: DocumentResource[] = [
  { id: 'doc1', name: 'Formulário de Consentimento.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*5).toISOString(), size: 120 * 1024, category: 'Formulários Clínicos' },
  { id: 'doc2', name: 'Termos de Serviço Psicologia.docx', type: 'docx', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*10).toISOString(), size: 85 * 1024, category: 'Documentos Legais' },
  { id: 'doc3', name: 'Guia de Relaxamento.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*2).toISOString(), size: 250 * 1024, category: 'Recursos para Pacientes' },
  { id: 'doc4', name: 'Anotações Importantes.txt', type: 'txt', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*1).toISOString(), size: 5 * 1024, category: 'Notas Internas' },
  { id: 'doc5', name: 'Planilha de Acompanhamento.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*3).toISOString(), size: 150 * 1024, category: 'Recursos para Pacientes' },
];


export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        const cachedDocs = await cacheService.documents.getList();
        if (isMounted && cachedDocs) {
          setDocuments(cachedDocs);
        }
      } catch (error) {
        // console.warn("Error loading documents from cache:", error);
      }

      // Simulate fetching fresh data
      await new Promise(resolve => setTimeout(resolve, 300)); 
      
      if (isMounted) {
        setDocuments(mockDocumentsData); 
        try {
          await cacheService.documents.setList(mockDocumentsData);
        } catch (error) {
          // console.warn("Error saving documents to cache:", error);
        }
        setIsLoading(false);
      }
    };
    loadDocuments();
    return () => { isMounted = false; };
  }, []);


  const handleUploadDocument = useCallback(async (file: File) => {
    const newDoc: DocumentResource = {
      id: `doc${Date.now()}`,
      name: file.name,
      type: file.name.split('.').pop() as DocumentResource['type'] || 'other',
      url: URL.createObjectURL(file), 
      uploadedAt: new Date().toISOString(),
      size: file.size,
      category: "Uploads Recentes", 
    };
    const updatedDocuments = [newDoc, ...documents];
    setDocuments(updatedDocuments);
    await cacheService.documents.setList(updatedDocuments);
  }, [documents]);

  const handleDeleteDocument = useCallback(async (docId: string) => {
    const updatedDocuments = documents.filter(d => d.id !== docId);
    setDocuments(updatedDocuments);
    await cacheService.documents.setList(updatedDocuments);
  }, [documents]);

  const filteredDocuments = useMemo(() => 
    documents.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.category && doc.category.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()),
    [documents, searchTerm]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Documentos e Recursos</h1>
      <p className="text-muted-foreground font-body">
        Faça upload, gerencie e organize documentos importantes e recursos para a clínica e pacientes.
      </p>
      
      {isLoading && documents.length === 0 ? (
         <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <DocumentManager 
          documents={filteredDocuments} 
          onUpload={handleUploadDocument}
          onDelete={handleDeleteDocument}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
        />
      )}
    </div>
  );
}
