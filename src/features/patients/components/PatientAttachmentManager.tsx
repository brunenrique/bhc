
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { PatientAttachment, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, FileText, Download, Trash2, AlertTriangle, Image as ImageIcon, FileArchive } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// Assume Firebase services are initialized and exported from @/services/firebase
// For this example, actual Firebase calls will be commented out due to mocked service.
// import { storage, db } from '@/services/firebase'; 
// import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
// import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc, orderBy, Timestamp } from "firebase/firestore";
import { Skeleton } from '@/components/ui/skeleton';
import { hasPermission } from '@/lib/permissions';

interface PatientAttachmentManagerProps {
  patientId: string;
  patientName: string;
  currentUser: User | null;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/plain': 'TXT',
};

function getFileIcon(mimeType: string): React.ReactNode {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
  if (mimeType === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) return <FileText className="h-5 w-5 text-sky-600" />;
  return <FileArchive className="h-5 w-5 text-gray-500" />;
}

export function PatientAttachmentManager({ patientId, patientName, currentUser }: PatientAttachmentManagerProps) {
  const [attachments, setAttachments] = useState<PatientAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchAttachments = useCallback(async () => {
    if (!patientId || !currentUser) return;
    setIsLoading(true);
    
    // MOCK IMPLEMENTATION (replace with actual Firebase calls)
    await new Promise(resolve => setTimeout(resolve, 600));
    const mockAttachments: PatientAttachment[] = [
      { id: 'mockattach1', fileUniqueId: 'uuid-example-1', filename: 'Relatorio_Psicologico_Q1.pdf', size: 120000, type: 'application/pdf', url: '#mock1', storagePath: `attachments/${patientId}/uuid-example-1`, uploadedBy: 'adminUID', uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'mockattach2', fileUniqueId: 'uuid-example-2', filename: 'Desenho_Crianca_Sessao3.png', size: 850000, type: 'image/png', url: '#mock2', storagePath: `attachments/${patientId}/uuid-example-2`, uploadedBy: currentUser.id, uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'mockattach3', fileUniqueId: 'uuid-example-3', filename: 'Termo_Consentimento.docx', size: 45000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', url: '#mock3', storagePath: `attachments/${patientId}/uuid-example-3`, uploadedBy: 'adminUID', uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    ];
    setAttachments(mockAttachments.sort((a,b) => parseISO(b.uploadedAt).getTime() - parseISO(a.uploadedAt).getTime()));
    
    /*
    // ACTUAL FIREBASE IMPLEMENTATION (uncomment and adapt services/firebase.ts)
    try {
      const attachmentsColRef = collection(db, `patients/${patientId}/attachments`);
      const q = query(attachmentsColRef, orderBy("uploadedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedAttachments = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        uploadedAt: (docSnap.data().uploadedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(), // Convert Firestore Timestamp
      })) as PatientAttachment[];
      setAttachments(fetchedAttachments);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      toast({ title: "Erro ao Carregar Anexos", description: "Não foi possível buscar os anexos do paciente.", variant: "destructive" });
    }
    */
    setIsLoading(false);
  }, [patientId, currentUser, toast]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      toast({ title: "Tipo de Arquivo Inválido", description: `Formatos permitidos: ${Object.values(ALLOWED_FILE_TYPES).join(', ')}.`, variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({ title: "Arquivo Muito Grande", description: `O tamanho máximo permitido é de ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // MOCK UPLOAD (replace with actual Firebase calls)
    const fileUniqueId = `mock-uuid-${Date.now()}`;
    const mockStoragePath = `attachments/${patientId}/${fileUniqueId}`;
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        const newAttachment: PatientAttachment = {
          id: `mock-${fileUniqueId}`,
          fileUniqueId: fileUniqueId,
          filename: file.name,
          size: file.size,
          type: file.type,
          url: `#mock-download-${fileUniqueId}`, // Mock download URL
          storagePath: mockStoragePath,
          uploadedBy: currentUser.id,
          uploadedAt: new Date().toISOString(),
        };
        setAttachments(prev => [newAttachment, ...prev].sort((a,b) => parseISO(b.uploadedAt).getTime() - parseISO(a.uploadedAt).getTime()));
        toast({ title: "Upload Concluído", description: `${file.name} foi enviado com sucesso.` });
        setIsUploading(false);
        setUploadProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }, 300);

    /*
    // ACTUAL FIREBASE UPLOAD (uncomment and adapt services/firebase.ts)
    const fileUniqueId = `${Date.now()}-${Math.random().toString(36).substring(2,9)}`; // Simple unique ID
    const storageFilePath = `attachments/${patientId}/${fileUniqueId}`;
    const storageRef = ref(storage, storageFilePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        toast({ title: "Erro no Upload", description: error.message, variant: "destructive" });
        setIsUploading(false);
        setUploadProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const attachmentData = {
            fileUniqueId,
            filename: file.name,
            size: file.size,
            type: file.type,
            url: downloadURL,
            storagePath: storageFilePath,
            uploadedBy: currentUser.id,
            uploadedAt: serverTimestamp(), // Firestore server timestamp
          };
          const attachmentsColRef = collection(db, `patients/${patientId}/attachments`);
          await addDoc(attachmentsColRef, attachmentData);
          
          // Optimistically update UI or refetch
          fetchAttachments(); // Refetch to get the new item with Firestore ID and server timestamp

          toast({ title: "Upload Concluído", description: `${file.name} foi enviado com sucesso.` });
        } catch (error: any) {
          console.error("Error saving metadata:", error);
          toast({ title: "Erro ao Salvar Metadados", description: error.message, variant: "destructive" });
        } finally {
          setIsUploading(false);
          setUploadProgress(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      }
    );
    */
  };
  
  const handleDeleteAttachment = async (attachment: PatientAttachment) => {
    if (!currentUser) return;
    // MOCK DELETE (replace with actual Firebase calls)
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setAttachments(prev => prev.filter(att => att.id !== attachment.id));
    toast({ title: "Anexo Removido", description: `${attachment.filename} foi excluído.`});
    setIsLoading(false);

    /*
    // ACTUAL FIREBASE DELETE (uncomment and adapt services/firebase.ts)
    setIsLoading(true);
    try {
      // 1. Delete from Firebase Storage
      const fileRef = ref(storage, attachment.storagePath);
      await deleteObject(fileRef);

      // 2. Delete metadata from Firestore
      const attachmentDocRef = doc(db, `patients/${patientId}/attachments`, attachment.id);
      await deleteDoc(attachmentDocRef);

      setAttachments(prev => prev.filter(att => att.id !== attachment.id));
      toast({ title: "Anexo Removido", description: `${attachment.filename} foi excluído.`});
    } catch (error: any) {
      console.error("Error deleting attachment:", error);
      toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
    */
  };

  const canManageAttachments = hasPermission(currentUser?.role, 'ACCESS_PATIENT_CLINICAL_DATA', patientId === currentUser?.id && currentUser?.role === 'psychologist');


  if (isLoading && attachments.length === 0) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">Anexos de {patientName}</CardTitle>
        <CardDescription>Gerencie arquivos importantes relacionados ao paciente.</CardDescription>
      </CardHeader>
      <CardContent>
        {canManageAttachments && (
          <div className="mb-6">
            <Label htmlFor="file-upload" className="text-sm font-medium text-muted-foreground">
              Adicionar Novo Anexo (Máx {MAX_FILE_SIZE_MB}MB)
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={isUploading}
                className="flex-grow"
                accept={Object.keys(ALLOWED_FILE_TYPES).join(',')}
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <UploadCloud className="mr-2 h-4 w-4" />
                {isUploading ? "Enviando..." : "Selecionar Arquivo"}
              </Button>
            </div>
            {isUploading && uploadProgress !== null && (
              <div className="mt-2">
                <Progress value={uploadProgress} className="w-full h-2" />
                <p className="text-xs text-muted-foreground text-center mt-1">{uploadProgress.toFixed(0)}%</p>
              </div>
            )}
             <p className="text-xs text-muted-foreground mt-1">
              Tipos permitidos: {Object.values(ALLOWED_FILE_TYPES).join(', ')}.
            </p>
          </div>
        )}

        {attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileArchive className="mx-auto h-10 w-10 mb-2" />
            Nenhum anexo encontrado para este paciente.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] hidden sm:table-cell">Tipo</TableHead>
                  <TableHead>Nome do Arquivo</TableHead>
                  <TableHead className="hidden md:table-cell">Tamanho</TableHead>
                  <TableHead className="hidden lg:table-cell">Enviado em</TableHead>
                  <TableHead className="hidden lg:table-cell">Enviado por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attachments.map((att) => (
                  <TableRow key={att.id} className="hover:bg-muted/50">
                    <TableCell className="hidden sm:table-cell">{getFileIcon(att.type)}</TableCell>
                    <TableCell className="font-medium max-w-[150px] sm:max-w-xs md:max-w-sm truncate" title={att.filename}>
                      {att.filename}
                       <div className="text-xs text-muted-foreground sm:hidden">{formatFileSize(att.size)}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatFileSize(att.size)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{format(parseISO(att.uploadedAt), "dd/MM/yy HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{att.uploadedBy === currentUser?.id ? 'Você' : att.uploadedBy}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8" title="Baixar"><a href={att.url} target="_blank" rel="noopener noreferrer" download={att.filename}><Download className="h-4 w-4" /></a></Button>
                      {canManageAttachments && (
                         <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Excluir"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-destructive"/>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja excluir o arquivo "{att.filename}"? Esta ação não poderá ser desfeita.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteAttachment(att)} className="bg-destructive hover:bg-destructive/90">
                                    Excluir Permanentemente
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
