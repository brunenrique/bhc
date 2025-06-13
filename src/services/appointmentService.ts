import type { AppointmentsByDate } from '@/types/appointment';

/**
 * Checks for scheduling conflicts against existing appointments.
 *
 * @param appointments - Map keyed by date containing appointments for that day.
 * @param dateKey - Date identifier (YYYY-MM-DD).
 * @param startTime - Proposed appointment start time (HH:mm).
 * @param endTime - Proposed appointment end time (HH:mm).
 * @param psychologistId - ID of the psychologist that will attend the patient.
 * @param isBlockTime - Indicates if the slot is a blocking event.
 * @returns `true` when there is a time overlap with another appointment.
 */

export function hasScheduleConflict(
  appointments: AppointmentsByDate,
  dateKey: string,
  startTime: string,
  endTime: string,
  psychologistId: string,
  isBlockTime: boolean
): boolean {
  const existing = appointments[dateKey] || [];
  return existing.some((appt) => {
    if (appt.psychologistId !== psychologistId) return false;
    if (appt.status === 'CancelledByPatient' || appt.status === 'CancelledByClinic') {
      return false;
    }
    if (!isBlockTime && appt.type === 'Blocked Slot') {
      // Bloqueio impede consulta
      return startTime < appt.endTime && endTime > appt.startTime;
    }
    return startTime < appt.endTime && endTime > appt.startTime;
  });
}
