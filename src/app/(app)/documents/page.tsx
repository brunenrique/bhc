
"use client";
import { DocumentManager } from "@/features/documents/components/DocumentManager";
import type { DocumentResource, DocumentSignatureDetails } from "@/types";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cacheService } from "@/services/cacheService";
import { useToast } from "@/hooks/use-toast"; 
import { subDays } from 'date-fns';

// Helper to create dates
const createDateISOString = (offsetDays: number, isPast: boolean = true): string => {
  const date = isPast ? subDays(new Date(), offsetDays) : new Date(new Date().setDate(new Date().getDate() + offsetDays));
  return date.toISOString();
};

export const mockDocumentsData: DocumentResource[] = [
  { id: 'doc1', name: 'Formulário de Consentimento Informado - Ana Silva.pdf', type: 'pdf', url: '#', uploadedAt: createDateISOString(5), size: 120 * 1024, category: 'Formulários Clínicos', signatureStatus: 'signed', signatureDetails: { hash: 'mockhash_consent_ana', signerInfo: 'Ana Silva (Paciente Mock)', signedAt: createDateISOString(4), verificationCode: 'VERIFY-CONSENT-ANA-123', signedDocumentLink: '#' } },
  { id: 'doc2', name: 'Termos de Serviço Psicologia Clínica.docx', type: 'docx', url: '#', uploadedAt: createDateISOString(10), size: 85 * 1024, category: 'Documentos Legais', signatureStatus: 'none' },
  { id: 'doc3', name: 'Relatório Psicológico - Bruno Costa.pdf', type: 'pdf', url: '#', uploadedAt: createDateISOString(2), size: 250 * 1024, category: 'Relatórios e Encaminhamentos', signatureStatus: 'pending_govbr_signature', signatureDetails: { hash: 'mockhash_report_bruno' } },
  { id: 'doc4', name: 'Anotações Confidenciais Reunião Equipe.txt', type: 'txt', url: '#', uploadedAt: createDateISOString(1), size: 5 * 1024, category: 'Notas Internas', signatureStatus: 'none' },
  { id: 'doc5', name: 'Planilha de Acompanhamento Financeiro.pdf', type: 'pdf', url: '#', uploadedAt: createDateISOString(3), size: 150 * 1024, category: 'Administrativo', signatureStatus: 'none' },
  { id: 'doc6', name: 'Guia de Relaxamento para Pacientes.pdf', type: 'pdf', url: '#', uploadedAt: createDateISOString(15), size: 300 * 1024, category: 'Recursos para Pacientes', signatureStatus: 'none' },
  { id: 'doc7', name: 'Contrato Terapêutico - Carla Dias.pdf', type: 'pdf', url: '#', uploadedAt: createDateISOString(8), size: 95 * 1024, category: 'Contratos', signatureStatus: 'verification_failed', signatureDetails: { hash: 'mockhash_contract_carla_fail', signerInfo: 'Tentativa por Carla Dias (Mock)', signedAt: createDateISOString(7)} },
  // Novos dados de exemplo
  { id: 'doc8', name: 'Encaminhamento Médico - Daniel Lima.pdf', type: 'pdf', url: '#', uploadedAt: createDateISOString(6), size: 180 * 1024, category: 'Relatórios e Encaminhamentos', signatureStatus: 'none' },
  { id: 'doc9', name: 'Atestado de Comparecimento - Eduarda Ferreira.docx', type: 'docx', url: '#', uploadedAt: createDateISOString(12), size: 70 * 1024, category: 'Formulários Clínicos', signatureStatus: 'pending_govbr_signature', signatureDetails: { hash: 'mockhash_att_eduarda' } },
  { id: 'doc10', name: 'Plano de Tratamento - Felipe Moreira.pdf', type: 'pdf', url: '#', uploadedAt: createDateISOString(20), size: 220 * 1024, category: 'Planos de Tratamento', signatureStatus: 'signed', signatureDetails: { hash: 'mockhash_plan_felipe', signerInfo: 'Felipe Moreira (Paciente Mock)', signedAt: createDateISOString(19), verificationCode: 'VERIFY-PLAN-FELIPE-456', signedDocumentLink: '#' } },
  { id: 'doc11', name: 'Material de Psicoeducação - Ansiedade.pdf', type: 'pdf', url: '#', uploadedAt: createDateISOString(30), size: 450 * 1024, category: 'Recursos para Pacientes', signatureStatus: 'none' },
  { id: 'doc12', name: 'Pesquisa de Satisfação (Modelo).txt', type: 'txt', url: '#', uploadedAt: createDateISOString(1), size: 2 * 1024, category: 'Administrativo', signatureStatus: 'none' },

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
            setDocuments(mockDocumentsData); 
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
      signedDocumentLink: URL.createObjectURL(signedFile), 
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

    