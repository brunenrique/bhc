import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DateNotesForm from '@/components/forms/date-notes-form';

describe('DateNotesForm', () => {
  test('submits valid values', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<DateNotesForm />);

    const dateInput = screen.getByLabelText(/Data\/Hora/i);
    const notesInput = screen.getByLabelText(/Notas/i);
    const future = new Date(Date.now() + 60 * 60 * 1000);

    fireEvent.change(dateInput, { target: { value: future.toISOString().slice(0,16) } });
    fireEvent.change(notesInput, { target: { value: 'valid notes' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(logSpy).toHaveBeenCalled());
    logSpy.mockRestore();
  });

  test('shows validation errors', async () => {
    render(<DateNotesForm />);
    const dateInput = screen.getByLabelText(/Data\/Hora/i);
    const notesInput = screen.getByLabelText(/Notas/i);
    const past = new Date(Date.now() - 60 * 60 * 1000);
    fireEvent.change(dateInput, { target: { value: past.toISOString().slice(0,16) } });
    fireEvent.change(notesInput, { target: { value: 'no' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText(/A data e hora deve ser igual/)).toBeInTheDocument();
    expect(await screen.findByText(/Notas deve ter no mínimo/)).toBeInTheDocument();
  });
});
