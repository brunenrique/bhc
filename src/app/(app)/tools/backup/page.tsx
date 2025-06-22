'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Archive,
  DownloadCloud,
  History,
  Settings2,
  PlayCircle,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { listenBackupHistory, type BackupHistoryEntry } from '@/services/backupService';
import { useRouter } from 'next/navigation';

type BackupStatus = 'Bem-sucedido' | 'Em Progresso' | 'Falhou';

const initialMockBackupHistory: BackupHistoryEntry[] = [];

export default function BackupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
  const [nextBackupDate, setNextBackupDate] = useState<number | null>(null);
  const [currentBackupStatus, setCurrentBackupStatus] = useState<BackupStatus>('Bem-sucedido');
  const [currentBackupProgress, setCurrentBackupProgress] = useState(100);
  const [backupHistory, setBackupHistory] =
    useState<BackupHistoryEntry[]>(initialMockBackupHistory);
  const [isManualBackupRunning, setIsManualBackupRunning] = useState(false);

  useEffect(() => {
    const unsub = listenBackupHistory((history) => {
      setBackupHistory(history);
      if (history[0]) setLastBackupDate(new Date(history[0].timestamp));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);
    setNextBackupDate(tomorrow.getTime());
  }, []);

  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval>;
    if (currentBackupStatus === 'Em Progresso') {
      setCurrentBackupProgress(0);
      progressInterval = setInterval(() => {
        setCurrentBackupProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setCurrentBackupStatus('Bem-sucedido');
            setIsManualBackupRunning(false);
            const newBackupEntry: BackupHistoryEntry = {
              id: `bkh_manual_${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'Manual',
              status: 'Bem-sucedido',
              size: `${(Math.random() * (1.5 - 0.8) + 0.8).toFixed(1)} GB`,
            };
            setBackupHistory((prevHistory) => [newBackupEntry, ...prevHistory]);
            setLastBackupDate(new Date(newBackupEntry.timestamp));
            toast({
              title: 'Backup Manual Concluído',
              description: 'O backup manual foi concluído com sucesso.',
            });
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
    return () => clearInterval(progressInterval);
  }, [currentBackupStatus, toast]);

  const handleStartNewBackup = () => {
    if (isManualBackupRunning) return;
    setIsManualBackupRunning(true);
    setCurrentBackupStatus('Em Progresso');
    toast({ title: 'Novo Backup Iniciado', description: 'O processo de backup foi iniciado.' });
  };

  const handleSimulateDownload = (backup: BackupHistoryEntry) => {
    toast({
      title: 'Download Simulado',
      description: `Iniciando download do backup de ${format(new Date(backup.timestamp), "P 'às' HH:mm", { locale: ptBR })} (${backup.size}).`,
    });
  };

  const handleSimulateRestore = (backup: BackupHistoryEntry) => {
    toast({
      title: 'Restauração Simulada Iniciada',
      description: `Sistema está sendo restaurado para o ponto de ${format(new Date(backup.timestamp), "P 'às' HH:mm", { locale: ptBR })}.`,
      variant: 'default',
    });
  };

  const handleSettingsClick = () => {
    router.push('/tools/backup/settings');
  };

  const getStatusBadge = (status: BackupStatus): 'default' | 'secondary' | 'destructive' => {
    if (status === 'Bem-sucedido') return 'default';
    if (status === 'Em Progresso') return 'secondary';
    return 'destructive';
  };

  const getStatusIcon = (status: BackupStatus) => {
    if (status === 'Bem-sucedido')
      return <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-green-500" />;
    if (status === 'Em Progresso')
      return <PlayCircle className="mr-1.5 h-3.5 w-3.5 text-blue-500 animate-pulse" />;
    return <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Archive className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-headline font-bold">Backup e Restauração de Dados</h1>
      </div>
      <CardDescription>
        Gerencie os backups de dados da sua clínica. Garanta que seus dados estejam seguros e possam
        ser restaurados quando necessário.
      </CardDescription>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Status do Backup Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              <strong>Último Backup Concluído:</strong>{' '}
              {lastBackupDate ? format(lastBackupDate, "P 'às' HH:mm", { locale: ptBR }) : 'Nenhum'}
            </p>
            <div className="text-sm flex items-center">
              <strong>Status Atual:</strong>
              <Badge variant={getStatusBadge(currentBackupStatus)} className="ml-2 text-xs">
                {getStatusIcon(currentBackupStatus)}
                {currentBackupStatus}
              </Badge>
            </div>
            <p className="text-sm">
              <strong>Próximo Backup Agendado:</strong>{' '}
              {nextBackupDate
                ? format(new Date(nextBackupDate), "P 'às' HH:mm", { locale: ptBR })
                : 'Calculando...'}
            </p>
            {(currentBackupStatus === 'Em Progresso' || isManualBackupRunning) && (
              <div>
                <Label htmlFor="backupProgress" className="text-sm">
                  Progresso do Backup Atual:
                </Label>
                <Progress
                  value={currentBackupProgress}
                  id="backupProgress"
                  className="w-full mt-1"
                />
                <p className="text-xs text-muted-foreground text-right">{currentBackupProgress}%</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={handleStartNewBackup}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isManualBackupRunning || currentBackupStatus === 'Em Progresso'}
              >
                <DownloadCloud className="mr-2 h-4 w-4" /> Iniciar Backup Manual Adicional
              </Button>
              <Button variant="outline" onClick={handleSettingsClick}>
                <Settings2 className="mr-2 h-4 w-4" /> Configurações
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Restauração Geral</CardTitle>
            <CardDescription>
              Selecione um ponto no histórico abaixo para restaurar os dados da clínica.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Restaurar dados de um backup substituirá os dados atuais. Esta ação é crítica e deve
              ser feita com cautela. Recomenda-se fazer um backup manual antes de restaurar.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={backupHistory.filter((b) => b.status === 'Bem-sucedido').length === 0}
                >
                  <History className="mr-2 h-4 w-4" /> Restaurar do Último Backup Bem-sucedido
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Restaurar do Último Backup?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você tem certeza que deseja restaurar os dados da clínica para o estado do
                    último backup bem-sucedido em{' '}
                    {format(
                      new Date(
                        backupHistory.find((b) => b.status === 'Bem-sucedido')?.timestamp ||
                          Date.now()
                      ),
                      "P 'às' HH:mm",
                      { locale: ptBR }
                    )}
                    ? Esta ação é irreversível.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      handleSimulateRestore(backupHistory.find((b) => b.status === 'Bem-sucedido')!)
                    }
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Confirmar Restauração
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline">Histórico de Backup</CardTitle>
          <CardDescription>Lista de backups automáticos e manuais realizados.</CardDescription>
        </CardHeader>
        <CardContent>
          {backupHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Data/Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupHistory.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        {format(new Date(backup.timestamp), 'Pp', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{backup.type}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(backup.status)} className="text-xs">
                          {getStatusIcon(backup.status)}
                          {backup.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSimulateDownload(backup)}
                          disabled={backup.status !== 'Bem-sucedido'}
                        >
                          <DownloadCloud className="mr-1.5 h-3.5 w-3.5" /> Download
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={
                                backup.status !== 'Bem-sucedido' ||
                                currentBackupStatus === 'Em Progresso'
                              }
                            >
                              <History className="mr-1.5 h-3.5 w-3.5" /> Restaurar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Restaurar Deste Ponto de Backup?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja restaurar os dados da clínica para o estado
                                do backup de{' '}
                                {format(new Date(backup.timestamp), "P 'às' HH:mm", {
                                  locale: ptBR,
                                })}
                                ? Esta ação é irreversível e substituirá todos os dados atuais.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleSimulateRestore(backup)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Restaurar Agora
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <History className="mx-auto h-10 w-10" />
              <p className="mt-2">Nenhum histórico de backup disponível ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
