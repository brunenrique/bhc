
"use client";
import { DocumentManager } from "@/components/documents/DocumentManager";
import type { DocumentResource } from "@/types";
import { useState, useCallback, useMemo } from "react";

const mockDocumentsData: DocumentResource[] = [
  { id: 'doc1', name: 'Formulário de Consentimento.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*5).toISOString(), size: 120 * 1024, category: 'Formulários Clínicos' },
  { id: 'doc2', name: 'Termos de Serviço Psicologia.docx', type: 'docx', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*10).toISOString(), size: 85 * 1024, category: 'Documentos Legais' },
  { id: 'doc3', name: 'Guia de Relaxamento.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*2).toISOString(), size: 250 * 1024, category: 'Recursos para Pacientes' },
  { id: 'doc4', name: 'Anotações Importantes.txt', type: 'txt', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*1).toISOString(), size: 5 * 1024, category: 'Notas Internas' },
  { id: 'doc5', name: 'Planilha de Acompanhamento.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*3).toISOString(), size: 150 * 1024, category: 'Recursos para Pacientes' },
];


export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResource[]>(mockDocumentsData);
  const [searchTerm, setSearchTerm] = useState('');

  const handleUploadDocument = useCallback((file: File) => {
    const newDoc: DocumentResource = {
      id: `doc${Date.now()}`,
      name: file.name,
      type: file.name.split('.').pop() as DocumentResource['type'] || 'other',
      url: URL.createObjectURL(file), 
      uploadedAt: new Date().toISOString(),
      size: file.size,
      category: "Uploads Recentes", // Default category for new uploads
    };
    setDocuments(prev => [newDoc, ...prev]);
  }, []);

  const handleDeleteDocument = useCallback((docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  }, []);

  const filteredDocuments = useMemo(() => 
    documents.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.category && doc.category.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()), // Sort by newest first
    [documents, searchTerm]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Documentos e Recursos</h1>
      <p className="text-muted-foreground font-body">
        Faça upload, gerencie e organize documentos importantes e recursos para a clínica e pacientes.
      </p>
      
      <DocumentManager 
        documents={filteredDocuments} 
        onUpload={handleUploadDocument}
        onDelete={handleDeleteDocument}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
      />
    </div>
  );
}

