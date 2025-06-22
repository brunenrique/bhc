import { render, screen } from '@testing-library/react';
import AppointmentForm from '@/components/forms/appointment-form';
import GroupForm from '@/components/forms/group-form';
import TaskForm from '@/components/forms/task-form';
import WaitingListForm from '@/components/forms/waiting-list-form';
import TemplateEditor from '@/components/forms/template-editor';
import CaseFormulationModelForm from '@/components/forms/case-formulation-model-form';

// Mock router to prevent navigation issues
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(''),
}));

// Mock zod schemas if needed, or external API calls

describe('Form Components', () => {
  it('renders AppointmentForm without crashing', () => {
    render(<AppointmentForm />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('renders GroupForm without crashing', () => {
    render(<GroupForm />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('renders TaskForm without crashing', () => {
    render(<TaskForm />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('renders WaitingListForm without crashing', () => {
    render(<WaitingListForm />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('renders TemplateEditor without crashing', () => {
    render(<TemplateEditor />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('renders CaseFormulationModelForm without crashing', () => {
    render(<CaseFormulationModelForm />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });
});
