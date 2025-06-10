
"use client";
import { DocumentManager } from "@/features/documents/components/DocumentManager";
import type { DocumentResource, DocumentSignatureDetails } from "@/types";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cacheService } from "@/services/cacheService";
import { useToast } from "@/hooks/use-toast"; // Import useToast

export const mockDocumentsData: DocumentResource[] = [
  { id: 'doc1', name: 'Formulário de Consentimento Informado - Ana Silva.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*5).toISOString(), size: 120 * 1024, category: 'Formulários Clínicos', signatureStatus: 'signed', signatureDetails: { hash: 'mockhash_consent_ana', signerInfo: 'Ana Silva (Paciente Mock)', signedAt: new Date(Date.now() - 1000*60*60*24*4).toISOString(), verificationCode: 'VERIFY-CONSENT-ANA-123', signedDocumentLink: '#' } },
  { id: 'doc2', name: 'Termos de Serviço Psicologia Clínica.docx', type: 'docx', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*10).toISOString(), size: 85 * 1024, category: 'Documentos Legais', signatureStatus: 'none' },
  { id: 'doc3', name: 'Relatório Psicológico - Bruno Costa.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*2).toISOString(), size: 250 * 1024, category: 'Relatórios e Encaminhamentos', signatureStatus: 'pending_govbr_signature', signatureDetails: { hash: 'mockhash_report_bruno' } },
  { id: 'doc4', name: 'Anotações Confidenciais Reunião Equipe.txt', type: 'txt', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*1).toISOString(), size: 5 * 1024, category: 'Notas Internas', signatureStatus: 'none' },
  { id: 'doc5', name: 'Planilha de Acompanhamento Financeiro.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*3).toISOString(), size: 150 * 1024, category: 'Administrativo', signatureStatus: 'none' },
  { id: 'doc6', name: 'Guia de Relaxamento para Pacientes.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*15).toISOString(), size: 300 * 1024, category: 'Recursos para Pacientes', signatureStatus: 'none' },
  { id: 'doc7', name: 'Contrato Terapêutico - Carla Dias.pdf', type: 'pdf', url: '#', uploadedAt: new Date(Date.now() - 1000*60*60*24*8).toISOString(), size: 95 * 1024, category: 'Contratos', signatureStatus: 'verification_failed', signatureDetails: { hash: 'mockhash_contract_carla_fail', signerInfo: 'Tentativa por Carla Dias (Mock)', signedAt: new Date(Date.now() - 1000*60*60*24*7).toISOString()} },
];


export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        const cachedDocs = await cacheService.documents.getList();
        if (isMounted && cachedDocs && cachedDocs.length > 0) {
          setDocuments(cachedDocs);
        } else if (isMounted) {
            setDocuments(mockDocumentsData); 
            try {
              await cacheService.documents.setList(mockDocumentsData);
            } catch (error) {
              // console.warn("Error saving initial documents to cache:", error);
            }
        }
      } catch (error) {
        // console.warn("Error loading documents from cache:", error);
         if (isMounted) {
            setDocuments(mockDocumentsData); // Fallback if cache read fails
         }
      }
      
      if (isMounted) {
        setIsLoading(false);
      }
    };
    loadDocuments();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      signatureStatus: 'none',
    };
    const updatedDocuments = [newDoc, ...documents];
    setDocuments(updatedDocuments);
    await cacheService.documents.setList(updatedDocuments);
    toast({ title: "Documento Carregado", description: `${file.name} foi adicionado.`});
  }, [documents, toast]);

  const handleDeleteDocument = useCallback(async (docId: string) => {
    const docToDelete = documents.find(d => d.id === docId);
    const updatedDocuments = documents.filter(d => d.id !== docId);
    setDocuments(updatedDocuments);
    await cacheService.documents.setList(updatedDocuments);
    toast({ title: "Documento Excluído", description: `${docToDelete?.name || 'O documento'} foi removido.`, variant: "destructive" });
  }, [documents, toast]);

  const handleInitiateGovBRSignature = useCallback(async (docId: string) => {
    const docToSign = documents.find(d => d.id === docId);
    if (!docToSign) return;

    // Simulate hash generation
    const mockHash = `sha256-${Math.random().toString(36).substring(2, 15)}`;
    
    const updatedDocuments = documents.map(doc => 
      doc.id === docId 
        ? { ...doc, signatureStatus: 'pending_govbr_signature', signatureDetails: { ...doc.signatureDetails, hash: mockHash } } as DocumentResource
        : doc
    );
    setDocuments(updatedDocuments);
    await cacheService.documents.setList(updatedDocuments);
    toast({
      title: "Assinatura GOV.BR Iniciada (Simulado)",
      description: `Documento '${docToSign.name}' preparado. Por favor, 'vá ao portal GOV.BR' para assinar e depois faça o upload do arquivo .p7s ou PDF assinado. Hash (simulado): ${mockHash}`,
      duration: 9000,
    });
  }, [documents, toast]);

  const handleUploadSignedGovBRDocument = useCallback(async (docId: string, signedFile: File) => {
    const docToUpdate = documents.find(d => d.id === docId);
    if (!docToUpdate) return;

    // Simulate validation
    const isValidExtension = signedFile.name.endsWith('.p7s') || signedFile.name.endsWith('.pdf');
    if (!isValidExtension) {
      const updatedDocsError = documents.map(doc => 
        doc.id === docId 
          ? { ...doc, signatureStatus: 'verification_failed' } as DocumentResource
          : doc
      );
      setDocuments(updatedDocsError);
      await cacheService.documents.setList(updatedDocsError);
      toast({ title: "Falha na Verificação", description: "Arquivo de assinatura inválido. Use .p7s ou .pdf.", variant: "destructive" });
      return;
    }

    const signatureDetails: DocumentSignatureDetails = {
      ...docToUpdate.signatureDetails,
      signerInfo: `CPF ${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)} (Mock)`,
      signedAt: new Date().toISOString(),
      verificationCode: `GOVBR-MOCK-${Date.now().toString().slice(-6)}`,
      signedDocumentLink: URL.createObjectURL(signedFile), // Mock link to the "uploaded" signed file
      p7sFile: signedFile.name.endsWith('.p7s') ? signedFile.name : undefined,
    };
    
    const updatedDocuments = documents.map(doc => 
      doc.id === docId 
        ? { ...doc, signatureStatus: 'signed', signatureDetails } as DocumentResource
        : doc
    );
    setDocuments(updatedDocuments);
    await cacheService.documents.setList(updatedDocuments);
    toast({ title: "Documento Assinado (Simulado)", description: `${docToUpdate.name} foi marcado como assinado e verificado.`, className: "bg-primary text-primary-foreground" });
  }, [documents, toast]);


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
        Faça upload, gerencie, organize e simule assinaturas GOV.BR para documentos importantes.
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
          onInitiateGovBRSignature={handleInitiateGovBRSignature}
          onUploadSignedGovBRDocument={handleUploadSignedGovBRDocument}
        />
      )}
    </div>
  );
}

