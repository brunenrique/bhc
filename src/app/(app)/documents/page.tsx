"use client";
import { DocumentManager } from "@/components/documents/DocumentManager";
import type { DocumentResource } from "@/types";
import { useState } from "react";

const mockDocuments: DocumentResource[] = [
  { id: 'doc1', name: 'Formulário de Consentimento.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*5).toISOString(), size: 120 * 1024 },
  { id: 'doc2', name: 'Termos de Serviço Psicologia.docx', type: 'doc', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*10).toISOString(), size: 85 * 1024 },
  { id: 'doc3', name: 'Guia de Relaxamento.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*2).toISOString(), size: 250 * 1024 },
  { id: 'doc4', name: 'Anotações Importantes.txt', type: 'txt', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*1).toISOString(), size: 5 * 1024 },
];


export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResource[]>(mockDocuments);

  const handleUploadDocument = (file: File) => {
    // Simulate upload
    const newDoc: DocumentResource = {
      id: `doc${Date.now()}`,
      name: file.name,
      type: file.name.split('.').pop() as DocumentResource['type'] || 'other',
      url: URL.createObjectURL(file), // Temporary URL for display
      uploadedAt: new Date().toISOString(),
      size: file.size,
    };
    setDocuments(prev => [newDoc, ...prev]);
    console.log("Uploading document:", file.name);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    console.log("Deleting document:", docId);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Documentos e Recursos</h1>
      <p className="text-muted-foreground font-body">
        Faça upload, gerencie e organize documentos importantes e recursos para a clínica e pacientes.
      </p>
      
      <DocumentManager 
        documents={documents} 
        onUpload={handleUploadDocument}
        onDelete={handleDeleteDocument}
      />
    </div>
  );
}
