
import { type Appointment, type AppointmentsByDate } from '@/types/appointment';
import { format } from 'date-fns';
import { toDate } from 'date-fns-tz';

/**
 * Formats a date and time in a given timezone into the UTC string used by ICS files.
 */
function formatToICSDateTime(dateString: string, timeString: string, timeZone: string = 'America/Sao_Paulo'): string {
  const dateTimeString = `${dateString}T${timeString}`; // e.g., "2024-08-15T10:00"
  
  // Use toDate from date-fns-tz to parse the string *in the specified timezone*.
  // This returns a Date object representing that specific instant (which is internally UTC).
  const dateInSpecifiedTimeZoneAsUtc = toDate(dateTimeString, { timeZone });
  
  // Now format this Date object (which is already the correct UTC instant)
  // The 'Z' in the format string indicates UTC.
  return format(dateInSpecifiedTimeZoneAsUtc, "yyyyMMdd'T'HHmmss'Z'");
}


/**
 * Generates a pseudo random UID for ICS events.
 */
function generateUID(length: number = 16): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result + '@psiguard.app';
}

// A simple map for psychologist names, can be expanded or passed as a parameter in a real app
const psychologistNameMap: Record<string, string> = {
  'psy1': 'Dr. Silva',
  'psy2': 'Dra. Jones',
  // Add other known psychologist IDs and names here
};

/**
 * Generates an iCalendar (.ics) string from the provided appointments.
 */
export function generateICS(appointmentsByDate: AppointmentsByDate, specificDate?: Date): string {
  let icsString = 'BEGIN:VCALENDAR\r\n';
  icsString += 'VERSION:2.0\r\n';
  icsString += `PRODID:-//PsiGuard//App//EN\r\n`;
  icsString += 'CALSCALE:GREGORIAN\r\n';

  // DTSTAMP is the current UTC time when the ICS file is generated.
  // new Date() creates a date object for the current moment.
  // format with 'Z' ensures it's output as UTC.
  const dtStamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

  for (const dateKey in appointmentsByDate) {
    if (specificDate && format(specificDate, "yyyy-MM-dd") !== dateKey) {
        continue; 
    }

    const appointmentsOnDate = appointmentsByDate[dateKey];
    appointmentsOnDate.forEach(appointment => {
      if (appointment.status === 'CancelledByClinic' || appointment.status === 'CancelledByPatient') {
        return; 
      }

      const dtStart = formatToICSDateTime(dateKey, appointment.startTime);
      const dtEnd = formatToICSDateTime(dateKey, appointment.endTime);
      
      let summary = appointment.type === 'Blocked Slot' 
        ? `Bloqueio: ${appointment.blockReason || 'Horário Bloqueado'}` 
        : `Consulta: ${appointment.patient}`;
      
      const descriptionParts: string[] = [];
      descriptionParts.push(`Tipo: ${appointment.type}`);

      if (appointment.psychologistId) {
        const psychologistName = psychologistNameMap[appointment.psychologistId] || appointment.psychologistId;
        descriptionParts.push(`Psicólogo(a): ${psychologistName}`);
      }
      if (appointment.notes) {
        descriptionParts.push(`Observações: ${appointment.notes.replace(/\n/g, '\\n')}`);
      }
      descriptionParts.push(`Status: ${appointment.status}`);
      const description = descriptionParts.join('\\n');


      icsString += 'BEGIN:VEVENT\r\n';
      icsString += `UID:${appointment.id}-${dateKey}-${generateUID(8)}@psiguard.app\r\n`;
      icsString += `DTSTAMP:${dtStamp}\r\n`;
      icsString += `DTSTART:${dtStart}\r\n`;
      icsString += `DTEND:${dtEnd}\r\n`;
      icsString += `SUMMARY:${summary}\r\n`;
      icsString += `DESCRIPTION:${description}\r\n`;
      icsString += `LOCATION:Consultório PsiGuard / Online\r\n`; 
      icsString += `STATUS:${appointment.status.toUpperCase()}\r\n`;
      icsString += 'END:VEVENT\r\n';
    });
  }

  icsString += 'END:VCALENDAR\r\n';
  return icsString;
}
