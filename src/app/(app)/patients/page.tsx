
"use client";
import { PatientListTable } from "@/features/patients/components/PatientListTable";
import { PatientFormDialog } from "@/features/patients/components/PatientFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Loader2 } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import type { Patient } from "@/types";
import { cacheService } from '@/services/cacheService';
import { useAuth } from "@/hooks/useAuth"; 
import { hasPermission } from "@/lib/permissions";

export const mockPatientsData: Patient[] = [
  { id: '1', name: 'Ana Beatriz Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', dateOfBirth: '1990-05-15', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), updatedAt: new Date().toISOString(), assignedTo: 'mock-user-psychologist-1234' }, 
  { id: '2', name: 'Bruno Almeida Costa', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', dateOfBirth: '1985-11-20', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), updatedAt: new Date().toISOString(), assignedTo: 'other-psy-uid' },
  { id: '3', name: 'Carla Dias Oliveira', email: 'carla.oliveira@example.com', phone: '(31) 95555-5555', dateOfBirth: '2000-02-10', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), assignedTo: 'mock-user-psychologist-1234' },
];

export default function PatientsPage() {
  const { user } = useAuth(); 
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
           const mockWithAssignedTo = mockPatientsData.map((p, index) => ({
            ...p,
            assignedTo: p.assignedTo || ((index === 0 || index === 2) ? (user?.role === 'psychologist' ? user.id : 'mock-psy-id-for-admin-view') : `other-psy-${index}`)
          }));
          setPatients(mockWithAssignedTo); 
          try {
            await cacheService.patients.setList(mockWithAssignedTo);
          } catch (error) {
            // console.warn("Error saving initial patients to cache:", error);
          }
        }
      } catch (error) {
        // console.warn("Error loading patients from cache:", error);
        if (isMounted) {
           setPatients(mockPatientsData); 
        }
      }
      
      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadPatients();
    return () => { isMounted = false; };
  }, [user]);

  const handleNewPatient = useCallback(() => {
    setSelectedPatient(null);
    setIsFormOpen(true);
  }, []);

  const handleEditPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  }, []);

  const handleDeletePatient = useCallback(async (patientId: string) => {
    // In a real app, this would also call a backend service to delete from Firestore
    const updatedPatients = patients.filter(p => p.id !== patientId);
    setPatients(updatedPatients);
    await cacheService.patients.setList(updatedPatients); 
    // console.log(`Simulated delete patient ${patientId}`);
  }, [patients]);

  const handleSavePatient = useCallback(async (patientDataFromForm: Partial<Patient>) => {
    let updatedPatients;
    let patientToSave: Patient;

    if (selectedPatient && patientDataFromForm.id) { 
      patientToSave = {...selectedPatient, ...patientDataFromForm, updatedAt: new Date().toISOString()} as Patient;
      updatedPatients = patients.map(p => p.id === patientToSave.id ? patientToSave : p);
    } else { 
      const newPatientBase = { 
        ...patientDataFromForm, 
        id: `mock-${Date.now()}`, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(),
      };
      // Set assignedTo if current user is a psychologist
      if (user?.role === 'psychologist') {
        patientToSave = { ...newPatientBase, assignedTo: user.id } as Patient;
      } else {
        // For admin or other roles, assignedTo would come from form or be undefined
        // For this mock, if admin creates, assignedTo could be set if form is enhanced
        patientToSave = newPatientBase as Patient; 
      }
      updatedPatients = [patientToSave, ...patients];
    }
    setPatients(updatedPatients);
    await cacheService.patients.setList(updatedPatients); 
    // In a real app, this would be:
    // await setDoc(doc(db, "patients", patientToSave.id), patientToSave, { merge: !!selectedPatient });
    // console.log("Simulated save patient:", patientToSave);
    setIsFormOpen(false);
  }, [selectedPatient, patients, user]);

  const filteredPatients = useMemo(() => {
    let displayPatients = patients;
    if (user?.role === 'psychologist') {
      displayPatients = patients.filter(p => p.assignedTo === user.id);
    }
    // Admins, Secretaries, Schedulers see all patients based on initial load.
    // Firestore rules and Patient Detail Page logic restrict sensitive data access.
    
    return displayPatients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [patients, searchTerm, user]);

  // Permissions check for creating patients
  const canCreatePatient = hasPermission(user?.role, 'CREATE_EDIT_CLINICAL_NOTES') || // Psychologists can
                           hasPermission(user?.role, 'ACCESS_ADMIN_PANEL_SETTINGS'); // Admins can


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
          {canCreatePatient && (
            <Button onClick={handleNewPatient} className="shadow-md hover:shadow-lg transition-shadow">
              <PlusCircle className="mr-2 h-5 w-5" />
              Novo Paciente
            </Button>
          )}
        </div>
      </div>
      <p className="text-muted-foreground font-body">
        Gerencie os registros dos seus pacientes. Adicione, edite ou visualize informações.
        {user?.role === 'psychologist' && " Você está visualizando apenas pacientes atribuídos a você."}
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

      {isFormOpen && ( // Conditionally render dialog to ensure reset on patient change
        <PatientFormDialog
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            patient={selectedPatient}
            onSave={handleSavePatient}
        />
      )}
    </div>
  );
}
