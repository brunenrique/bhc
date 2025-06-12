"use client";
import { PatientListTable } from "@/features/patients/components/PatientListTable";
import { PatientFormDialog } from "@/features/patients/components/PatientFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Loader2, Users } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import type { Patient, Prontuario, ProcedimentoAnaliseEntry } from "@/types";
import { cacheService } from '@/services/cacheService';
import { useAuth } from "@/hooks/useAuth"; 
import { hasPermission } from "@/lib/permissions";
import { subDays } from 'date-fns';

const createPastDate = (days: number): string => subDays(new Date(), days).toISOString();

// Helper para criar entradas de procedimento/análise mockadas
const createMockProcedimentoAnalise = (patientName: string, baseDate: Date): ProcedimentoAnaliseEntry[] => [
    {
        entryId: `proc-${patientName}-1-${Date.now()}`,
        date: subDays(baseDate, 10).toISOString(),
        content: `<p>Primeira sessão com ${patientName}. O paciente apresentou queixas de ansiedade social e dificuldade em iniciar novas amizades. Demonstra receio de julgamento e isolamento.</p><p>Exploramos a origem desses sentimentos e definimos o foco inicial da terapia.</p>`,
        recordedBy: 'psy1' // Mock Psychologist ID
    },
    {
        entryId: `proc-${patientName}-2-${Date.now()}`,
        date: subDays(baseDate, 5).toISOString(),
        content: `<p>Sessão de acompanhamento. ${patientName} relatou um pequeno avanço ao participar de um evento social curto, apesar da ansiedade. Discutimos estratégias de enfrentamento e respiração.</p><p>Exploramos crenças centrais sobre si mesmo e sobre os outros.</p>`,
        recordedBy: 'psy1' // Mock Psychologist ID
    },
     {
        entryId: `proc-${patientName}-3-${Date.now()}`,
        date: baseDate.toISOString(),
        content: `<p>Sessão atual. ${patientName} parece mais à vontade. Conversamos sobre a importância da exposição gradual. Agendamos tarefa de casa: iniciar uma breve conversa com um colega de trabalho.</p><p>Reforçamos os progressos e validamos os sentimentos de desconforto inicial.</p>`,
        recordedBy: 'psy1' // Mock Psychologist ID
    },
];


export const mockPatientsData: Patient[] = [
  { 
    id: '1', name: 'Ana Beatriz Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', dateOfBirth: '1990-05-15', createdAt: createPastDate(10), updatedAt: new Date().toISOString(), assignedTo: 'psy1',
    prontuario: {
      identificacao: { nomeCompleto: 'Ana Beatriz Silva', cpf: '111.222.333-44', dataNascimento: '1990-05-15' },
      entradaUnidade: { dataEntrada: createPastDate(10), descricaoEntrada: 'Paciente encaminhada com queixa de ansiedade social e isolamento.' },
      demandaQueixaPrincipal: 'Ansiedade social, dificuldade em fazer amizades e medo de julgamento em interações sociais.',
      procedimentosAnalise: createMockProcedimentoAnalise('Ana Beatriz Silva', new Date()),
      conclusaoEncaminhamentoGeral: 'Início de terapia focada em TCC para reestruturação cognitiva e exposição gradual a situações sociais.',
      localAssinatura: 'Centro'
    }
  }, 
  { 
    id: '2', name: 'Bruno Almeida Costa', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', dateOfBirth: '1985-11-20', createdAt: createPastDate(5), updatedAt: new Date().toISOString(), assignedTo: 'psy1',
     prontuario: {
      identificacao: { nomeCompleto: 'Bruno Almeida Costa', cpf: '222.333.444-55', dataNascimento: '1985-11-20' },
      entradaUnidade: { dataEntrada: createPastDate(5), descricaoEntrada: 'Busca por acompanhamento psicológico devido a estresse no trabalho.' },
      demandaQueixaPrincipal: 'Estresse crônico relacionado ao ambiente de trabalho, dificuldades de gestão de tempo e pressão por resultados.',
      procedimentosAnalise: createMockProcedimentoAnalise('Bruno Almeida Costa', new Date()),
      conclusaoEncaminhamentoGeral: 'Acompanhamento focado em desenvolvimento de habilidades de coping, organização e assertividade no ambiente profissional.',
      localAssinatura: 'Centro'
    }
  },
  { 
    id: '3', name: 'Carla Dias Oliveira', email: 'carla.oliveira@example.com', phone: '(31) 95555-5555', dateOfBirth: '2000-02-10', createdAt: createPastDate(0), updatedAt: new Date().toISOString(), assignedTo: 'psy2',
     prontuario: {
      identificacao: { nomeCompleto: 'Carla Dias Oliveira', cpf: '333.444.555-66', dataNascimento: '2000-02-10' },
      entradaUnidade: { dataEntrada: createPastDate(0), descricaoEntrada: 'Primeira avaliação. Encaminhada pela escola por dificuldades de aprendizagem.' },
      demandaQueixaPrincipal: 'Dificuldades de concentração, baixo rendimento escolar e possível quadro de TDAH. Ansiedade em relação às avaliações.',
      procedimentosAnalise: createMockProcedimentoAnalise('Carla Dias Oliveira', new Date()),
      conclusaoEncaminhamentoGeral: 'Início de processo de avaliação psicológica para investigar hipóteses diagnósticas e elaborar plano de intervenção com foco em estratégias de estudo e manejo da ansiedade.',
      localAssinatura: 'Fazendinha'
    }
  },
  { id: '4', name: 'Daniel Farias Lima', email: 'daniel.lima@example.com', phone: '(41) 94444-0000', dateOfBirth: '1992-07-22', createdAt: createPastDate(20), updatedAt: new Date().toISOString(), assignedTo: 'psy1',
    prontuario: {
      identificacao: { nomeCompleto: 'Daniel Farias Lima', cpf: '444.555.666-77', dataNascimento: '1992-07-22' },
      entradaUnidade: { dataEntrada: createPastDate(20), descricaoEntrada: 'Busca espontânea por apoio para lidar com luto.' },
      demandaQueixaPrincipal: 'Processo de luto pela perda de familiar. Tristeza profunda, insônia e dificuldade em retomar rotina.',
      procedimentosAnalise: createMockProcedimentoAnalise('Daniel Farias Lima', new Date()),
      conclusaoEncaminhamentoGeral: 'Terapia de apoio focada no processo de luto, validação de sentimentos e resgate da funcionalidade diária.',
      localAssinatura: 'Centro'
    }
  },
  { id: '5', name: 'Eduarda Gomes Ferreira', email: 'eduarda.ferreira@example.com', phone: '(51) 93333-1111', dateOfBirth: '1998-03-30', createdAt: createPastDate(45), updatedAt: new Date().toISOString(), assignedTo: 'psy2',
     prontuario: {
      identificacao: { nomeCompleto: 'Eduarda Gomes Ferreira', cpf: '555.666.777-88', dataNascimento: '1998-03-30' },
      entradaUnidade: { dataEntrada: createPastDate(45), descricaoEntrada: 'Encaminhada por médico para avaliação de quadro depressivo.' },
      demandaQueixaPrincipal: 'Humor deprimido, perda de interesse em atividades, fadiga e alterações no sono e apetite. Histórico de episódios anteriores.',
      procedimentosAnalise: createMockProcedimentoAnalise('Eduarda Gomes Ferreira', new Date()),
      conclusaoEncaminhamentoGeral: 'Início de terapia com foco em ativação comportamental e reestruturação cognitiva. Acompanhamento multiprofissional indicado.',
      localAssinatura: 'Fazendinha'
    }
  },
  { id: '6', name: 'Felipe Nogueira Moreira', email: 'felipe.moreira@example.com', phone: '(61) 92222-1111', dateOfBirth: '1995-09-12', createdAt: createPastDate(15), updatedAt: new Date().toISOString(), assignedTo: 'psy2',
     prontuario: {
      identificacao: { nomeCompleto: 'Felipe Nogueira Moreira', cpf: '666.777.888-99', dataNascimento: '1995-09-12' },
      entradaUnidade: { dataEntrada: createPastDate(15), descricaoEntrada: 'Busca por orientação vocacional no final do ensino médio.' },
      demandaQueixaPrincipal: 'Indecisão sobre escolha profissional, pressão familiar e receio de fazer a escolha errada.',
      procedimentosAnalise: createMockProcedimentoAnalise('Felipe Nogueira Moreira', new Date()),
      conclusaoEncaminhamentoGeral: 'Processo de orientação vocacional utilizando testes de interesse e aptidão, além de sessões de reflexão sobre valores e mercado de trabalho.',
      localAssinatura: 'Fazendinha'
    }
  },
  { id: '7', name: 'Gabriela Martins Azevedo', email: 'gabriela.azevedo@example.com', phone: '(71) 91111-2222', dateOfBirth: '1993-01-25', createdAt: createPastDate(60), updatedAt: new Date().toISOString(), assignedTo: 'psy1',
     prontuario: {
      identificacao: { nomeCompleto: 'Gabriela Martins Azevedo', cpf: '777.888.999-00', dataNascimento: '1993-01-25' },
      entradaUnidade: { dataEntrada: createPastDate(60), descricaoEntrada: 'Busca por terapia de casal. Crise conjugal.' },
      demandaQueixaPrincipal: 'Conflitos frequentes no relacionamento, dificuldades de comunicação e insatisfação geral com a dinâmica conjugal.',
      procedimentosAnalise: createMockProcedimentoAnalise('Gabriela Martins Azevedo', new Date()),
      conclusaoEncaminhamentoGeral: 'Início de terapia de casal focada em melhorar a comunicação, identificar padrões disfuncionais e construir estratégias de resolução de conflitos.',
      localAssinatura: 'Centro'
    }
  },
  { id: '8', name: 'Hugo Pereira da Silva', email: 'hugo.pereira@example.com', phone: '(81) 90000-3333', dateOfBirth: '1988-08-05', createdAt: createPastDate(3), updatedAt: new Date().toISOString(), assignedTo: 'other-psy-uid',
     prontuario: {
      identificacao: { nomeCompleto: 'Hugo Pereira da Silva', cpf: '888.999.000-11', dataNascimento: '1988-08-05' },
      entradaUnidade: { dataEntrada: createPastDate(3), descricaoEntrada: 'Avaliação neuropsicológica solicitada por neurologista.' },
      demandaQueixaPrincipal: 'Queixas de memória, dificuldade de concentração e organização após evento neurológico.',
      procedimentosAnalise: createMockProcedimentoAnalise('Hugo Pereira da Silva', new Date()),
      conclusaoEncaminhamentoGeral: 'Início de processo de avaliação neuropsicológica para investigar as funções cognitivas. Encaminhamento para reabilitação conforme resultados.',
      localAssinatura: 'Centro'
    }
  }, 
  { id: '9', name: 'Isabela Santos Rocha', email: 'isabela.santos@example.com', phone: '(91) 98888-4444', dateOfBirth: '2002-12-12', createdAt: createPastDate(90), updatedAt: new Date().toISOString(), assignedTo: 'psy2',
     prontuario: {
      identificacao: { nomeCompleto: 'Isabela Santos Rocha', cpf: '999.000.111-22', dataNascimento: '2002-12-12' },
      entradaUnidade: { dataEntrada: createPastDate(90), descricaoEntrada: 'Busca espontânea por terapia para autoconhecimento.' },
      demandaQueixaPrincipal: 'Busca por autoconhecimento e desenvolvimento pessoal. Questionamentos sobre futuro e propósito.',
      procedimentosAnalise: createMockProcedimentoAnalise('Isabela Santos Rocha', new Date()),
      conclusaoEncaminhamentoGeral: 'Início de terapia com foco em exploração de valores, crenças e metas pessoais. Utilização de técnicas de psicologia positiva.',
      localAssinatura: 'Fazendinha'
    }
  },
  { id: '10', name: 'Lucas Mendes Oliveira', email: 'lucas.mendes@example.com', phone: '(12) 97777-5555', dateOfBirth: '1975-06-18', createdAt: createPastDate(120), updatedAt: new Date().toISOString(), assignedTo: 'psy1',
     prontuario: {
      identificacao: { nomeCompleto: 'Lucas Mendes Oliveira', cpf: '000.111.222-33', dataNascimento: '1975-06-18' },
      entradaUnidade: { dataEntrada: createPastDate(120), descricaoEntrada: 'Encaminhado pelo RH da empresa por questões de performance.' },
      demandaQueixaPrincipal: 'Dificuldades de adaptação a novas tecnologias no trabalho, receio de ser substituído e baixa autoconfiança.',
      procedimentosAnalise: createMockProcedimentoAnalise('Lucas Mendes Oliveira', new Date()),
      conclusaoEncaminhamentoGeral: 'Terapia breve com foco em desenvolver resiliência, habilidades de adaptação e ressignificar crenças limitantes sobre capacidade profissional.',
      localAssinatura: 'Centro'
    }
  },
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
          dataToSet = [...mockPatientsData]; // Use a copy
          // Persist initial mock data if cache was empty
          await cacheService.patients.setList(dataToSet);
        }
      } catch (error) {
        // console.warn("Error loading patients from cache:", error);
        dataToSet = [...mockPatientsData]; // Use a copy on error
      }
      
      if (isMounted) {
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
    
    if (selectedPatient && patientDataFromForm.id) {
      const updatedPatientDetail = {...selectedPatient, ...patientDataFromForm, updatedAt: new Date().toISOString()} as Patient;
      await cacheService.patients.setDetail(updatedPatientDetail.id, updatedPatientDetail);
    }

    setIsFormOpen(false);
    setSelectedPatient(null);
  }, [selectedPatient, user]);

  const filteredPatients = useMemo(() => {
    if (!user) return []; 

    let patientsToFilter = patients;

    // If the user is a psychologist, include all mock patients in the list to be filtered by search term
    // (This overrides the previous 'assignedTo' filtering for psychologists)
    if (user.role === 'psychologist') {
        patientsToFilter = patients;
    }
    // For other roles (admin, secretary), they already see all patients before search term filtering
    
    return patientsToFilter.filter(p => 
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
        {user?.role === 'psychologist' && " Você está visualizando todos os pacientes mockados e os atribuídos a você."}
      </p>
      
      {filteredPatients.length === 0 && !isLoading ? ( 
        <div className="text-center py-10 text-muted-foreground">
          <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
          Nenhum paciente encontrado para os filtros atuais.
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
    