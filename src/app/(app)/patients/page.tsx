
"use client";
import { PatientListTable } from "@/components/patients/PatientListTable";
import { PatientFormDialog } from "@/components/patients/PatientFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import type { Patient } from "@/types";

const mockPatients: Patient[] = [
  { id: '1', name: 'Ana Beatriz Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', dateOfBirth: '1990-05-15', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Bruno Almeida Costa', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', dateOfBirth: '1985-11-20', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Carla Dias Oliveira', email: 'carla.oliveira@example.com', phone: '(31) 95555-5555', dateOfBirth: '2000-02-10', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export default function PatientsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleNewPatient = useCallback(() => {
    setSelectedPatient(null);
    setIsFormOpen(true);
  }, []);

  const handleEditPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  }, []);

  const handleDeletePatient = useCallback((patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
  }, []);

  const handleSavePatient = useCallback((patientData: Partial<Patient>) => {
    if (selectedPatient && patientData.id) { // Editing existing
      setPatients(prev => prev.map(p => p.id === patientData.id ? {...p, ...patientData} as Patient : p));
    } else { // Creating new
      const newPatient = { ...patientData, id: `mock-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Patient;
      setPatients(prev => [newPatient, ...prev]);
    }
    setIsFormOpen(false);
  }, [selectedPatient]);

  const filteredPatients = useMemo(() => 
    patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [patients, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold">Pacientes</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar paciente..." 
              className="pl-8 sm:w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleNewPatient} className="shadow-md hover:shadow-lg transition-shadow">
            <PlusCircle className="mr-2 h-5 w-5" />
            Novo Paciente
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground font-body">
        Gerencie os registros dos seus pacientes. Adicione, edite ou visualize informações.
      </p>
      
      <PatientListTable 
        patients={filteredPatients} 
        onEditPatient={handleEditPatient}
        onDeletePatient={handleDeletePatient}
      />

      <PatientFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        patient={selectedPatient}
        onSave={handleSavePatient}
      />
    </div>
  );
}

