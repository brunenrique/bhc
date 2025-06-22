import BackupSettingsForm from '@/components/forms/backup-settings-form';
import { CardDescription } from '@/components/ui/card';
import { Settings2 } from 'lucide-react';

export default function BackupSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings2 className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-headline font-bold">Configurações de Backup</h1>
      </div>
      <CardDescription>Defina a frequência e o destino dos backups automáticos.</CardDescription>
      <BackupSettingsForm />
    </div>
  );
}
