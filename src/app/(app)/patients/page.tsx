
"use client";
import { PatientListTable } from "@/features/patients/components/PatientListTable";
import { PatientFormDialog } from "@/features/patients/components/PatientFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Loader2, Users } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import type { Patient } from "@/types";
import { cacheService } from '@/services/cacheService';
import { useAuth } from "@/hooks/useAuth"; 
import { hasPermission } from "@/lib/permissions";
import { subDays } from 'date-fns';

const createPastDate = (days: number): string => subDays(new Date(), days).toISOString();

export const mockPatientsData: Patient[] = [
  { id: '1', name: 'Ana Beatriz Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', dateOfBirth: '1990-05-15', createdAt: createPastDate(10), updatedAt: new Date().toISOString(), assignedTo: 'psy1' }, 
  { id: '2', name: 'Bruno Almeida Costa', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', dateOfBirth: '1985-11-20', createdAt: createPastDate(5), updatedAt: new Date().toISOString(), assignedTo: 'psy1' },
  { id: '3', name: 'Carla Dias Oliveira', email: 'carla.oliveira@example.com', phone: '(31) 95555-5555', dateOfBirth: '2000-02-10', createdAt: createPastDate(0), updatedAt: new Date().toISOString(), assignedTo: 'psy2' },
  { id: '4', name: 'Daniel Farias Lima', email: 'daniel.lima@example.com', phone: '(41) 94444-0000', dateOfBirth: '1992-07-22', createdAt: createPastDate(20), updatedAt: new Date().toISOString(), assignedTo: 'psy1' },
  { id: '5', name: 'Eduarda Gomes Ferreira', email: 'eduarda.ferreira@example.com', phone: '(51) 93333-1111', dateOfBirth: '1998-03-30', createdAt: createPastDate(45), updatedAt: new Date().toISOString(), assignedTo: 'psy2' },
  { id: '6', name: 'Felipe Nogueira Moreira', email: 'felipe.moreira@example.com', phone: '(61) 92222-1111', dateOfBirth: '1995-09-12', createdAt: createPastDate(15), updatedAt: new Date().toISOString(), assignedTo: 'psy2' },
  { id: '7', name: 'Gabriela Martins Azevedo', email: 'gabriela.azevedo@example.com', phone: '(71) 91111-2222', dateOfBirth: '1993-01-25', createdAt: createPastDate(60), updatedAt: new Date().toISOString(), assignedTo: 'psy1' },
  { id: '8', name: 'Hugo Pereira da Silva', email: 'hugo.pereira@example.com', phone: '(81) 90000-3333', dateOfBirth: '1988-08-05', createdAt: createPastDate(3), updatedAt: new Date().toISOString(), assignedTo: 'other-psy-uid' }, 
  { id: '9', name: 'Isabela Santos Rocha', email: 'isabela.santos@example.com', phone: '(91) 98888-4444', dateOfBirth: '2002-12-12', createdAt: createPastDate(90), updatedAt: new Date().toISOString(), assignedTo: 'psy2' },
  { id: '10', name: 'Lucas Mendes Oliveira', email: 'lucas.mendes@example.com', phone: '(12) 97777-5555', dateOfBirth: '1975-06-18', createdAt: createPastDate(120), updatedAt: new Date().toISOString(), assignedTo: 'psy1' },
];


export default function PatientsPage() {
  const { user } = useAuth(); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const mapMockPsychologistIdToReal = (mockId: string | undefined, loggedInUser: typeof user): string | undefined => {
    if (!loggedInUser || loggedInUser.role !== 'psychologist') return mockId;
    if (mockId === 'psy1' && loggedInUser.name === 'Dr. Exemplo Silva') return loggedInUser.id;
    if (mockId === 'psy2' && loggedInUser.name === 'Dra. Modelo Souza') return loggedInUser.id;
    return mockId; // Return original if no match or not a psychologist
  };

  useEffect(() => {
    let isMounted = true;
    const loadPatients = async () => {
      if (!user) { 
        setIsLoading(true); 
        return;
      }
      setIsLoading(true);
      let dataToSet: Patient[];
      try {
        const cachedPatients = await cacheService.patients.getList();
        if (cachedPatients && cachedPatients.length > 0) {
          dataToSet = cachedPatients;
        } else {
          dataToSet = [...mockPatientsData];
          // Persist initial mock data if cache was empty
          await cacheService.patients.setList(dataToSet);
        }
      } catch (error) {
        dataToSet = [...mockPatientsData];
      }
      
      if (isMounted) {
        // Always apply mapping if the user is a psychologist, regardless of cache status
        if (user.role === 'psychologist') {
            dataToSet = dataToSet.map(p => ({
                ...p,
                assignedTo: mapMockPsychologistIdToReal(p.assignedTo, user)
            }));
        }
        setPatients(dataToSet);
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
    setPatients(prev => {
        const updated = prev.filter(p => p.id !== patientId);
        cacheService.patients.setList(updated);
        return updated;
    });
  }, []);

  const handleSavePatient = useCallback(async (patientDataFromForm: Partial<Patient>) => {
    setPatients(prevPatients => {
        let updatedPatientsList;
        let patientToSave: Patient;

        if (selectedPatient && patientDataFromForm.id) { 
        patientToSave = {...selectedPatient, ...patientDataFromForm, updatedAt: new Date().toISOString()} as Patient;
        updatedPatientsList = prevPatients.map(p => p.id === patientToSave.id ? patientToSave : p);
        } else { 
        const newPatientBase = { 
            ...patientDataFromForm, 
            id: `mock-${Date.now()}`, 
            createdAt: new Date().toISOString(), 
            updatedAt: new Date().toISOString(),
        };
        if (user?.role === 'psychologist') {
            patientToSave = { ...newPatientBase, assignedTo: user.id } as Patient;
        } else {
            patientToSave = newPatientBase as Patient; 
        }
        updatedPatientsList = [patientToSave, ...prevPatients];
        }
        cacheService.patients.setList(updatedPatientsList);
        return updatedPatientsList;
    });
    
    // Ensure patient detail cache is also updated if editing
    if (selectedPatient && patientDataFromForm.id) {
      const updatedPatientDetail = {...selectedPatient, ...patientDataFromForm, updatedAt: new Date().toISOString()} as Patient;
      await cacheService.patients.setDetail(updatedPatientDetail.id, updatedPatientDetail);
    }

    setIsFormOpen(false);
    setSelectedPatient(null);
  }, [selectedPatient, user]);

  const filteredPatients = useMemo(() => {
    if (!user) return []; 

    let displayPatients = patients;
    // Filter by assignedTo only if the user is a psychologist and not an admin
    // Admins should see all patients. Secretaries might also see all, or it depends on rules.
    if (user.role === 'psychologist') {
      displayPatients = displayPatients.filter(p => p.assignedTo === user.id);
    }
    
    return displayPatients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [patients, searchTerm, user]);

  const canCreatePatient = hasPermission(user?.role, 'CREATE_EDIT_CLINICAL_NOTES') || 
                           hasPermission(user?.role, 'ACCESS_ADMIN_PANEL_SETTINGS');


  if (isLoading || !user) { 
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold">Pacientes</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar paciente..." 
              className="pl-8 w-full sm:w-[200px] md:w-[300px]"
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
      
      {filteredPatients.length === 0 && !isLoading ? ( 
        <div className="text-center py-10 text-muted-foreground">
          <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
          Nenhum paciente encontrado para os filtros atuais
          {user?.role === 'psychologist' && " ou atribuído a você"}.
        </div>
      ) : (
        <PatientListTable 
          patients={filteredPatients} 
          onEditPatient={handleEditPatient}
          onDeletePatient={handleDeletePatient}
        />
      )}

      {isFormOpen && (
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
    