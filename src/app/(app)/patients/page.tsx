
"use client";
import { PatientListTable } from "@/features/patients/components/PatientListTable";
import { PatientFormDialog } from "@/features/patients/components/PatientFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Loader2 } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import type { Patient } from "@/types";
import { cacheService } from '@/services/cacheService';

export const mockPatientsData: Patient[] = [
  { id: '1', name: 'Ana Beatriz Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', dateOfBirth: '1990-05-15', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Bruno Almeida Costa', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', dateOfBirth: '1985-11-20', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Carla Dias Oliveira', email: 'carla.oliveira@example.com', phone: '(31) 95555-5555', dateOfBirth: '2000-02-10', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export default function PatientsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadPatients = async () => {
      setIsLoading(true);
      try {
        const cachedPatients = await cacheService.patients.getList();
        if (isMounted && cachedPatients && cachedPatients.length > 0) {
          setPatients(cachedPatients);
        } else if (isMounted) {
          setPatients(mockPatientsData); 
          try {
            await cacheService.patients.setList(mockPatientsData);
          } catch (error) {
            // console.warn("Error saving initial patients to cache:", error);
          }
        }
      } catch (error) {
        // console.warn("Error loading patients from cache:", error);
        if (isMounted) {
           setPatients(mockPatientsData); // Fallback if cache read fails
        }
      }
      
      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadPatients();
    return () => { isMounted = false; };
  }, []);

  const handleNewPatient = useCallback(() => {
    setSelectedPatient(null);
    setIsFormOpen(true);
  }, []);

  const handleEditPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  }, []);

  const handleDeletePatient = useCallback(async (patientId: string) => {
    const updatedPatients = patients.filter(p => p.id !== patientId);
    setPatients(updatedPatients);
    await cacheService.patients.setList(updatedPatients); 
  }, [patients]);

  const handleSavePatient = useCallback(async (patientData: Partial<Patient>) => {
    let updatedPatients;
    if (selectedPatient && patientData.id) { 
      updatedPatients = patients.map(p => p.id === patientData.id ? {...p, ...patientData, updatedAt: new Date().toISOString()} as Patient : p);
    } else { 
      const newPatient = { ...patientData, id: `mock-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Patient;
      updatedPatients = [newPatient, ...patients];
    }
    setPatients(updatedPatients);
    await cacheService.patients.setList(updatedPatients); 
    setIsFormOpen(false);
  }, [selectedPatient, patients]);

  const filteredPatients = useMemo(() => 
    patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), 
    [patients, searchTerm]
  );

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
      
      {isLoading && patients.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <PatientListTable 
          patients={filteredPatients} 
          onEditPatient={handleEditPatient}
          onDeletePatient={handleDeletePatient}
        />
      )}

      <PatientFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        patient={selectedPatient}
        onSave={handleSavePatient}
      />
    </div>
  );
}
