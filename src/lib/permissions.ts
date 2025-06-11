
import type { UserRole } from '@/types';

export type AppAction =
  | 'VIEW_WEEKLY_AGENDA'
  | 'VIEW_WAITING_LIST_PATIENTS'
  | 'ADD_PATIENT_TO_WAITING_LIST'
  | 'SCHEDULE_FROM_WAITING_LIST'
  | 'CREATE_EDIT_CLINICAL_NOTES'
  | 'ACCESS_PATIENT_CLINICAL_DATA' // Requires isAssignedPsychologist or admin
  | 'MANAGE_ASSESSMENTS_FORMS'
  | 'ACCESS_ADMIN_PANEL_SETTINGS'
  | 'VIEW_ADMIN_METRICS'
  | 'VIEW_MY_PANEL_DASHBOARD'
  | 'VIEW_CLINICAL_ANALYSIS_DASHBOARD'
  | 'VIEW_PERFORMANCE_DASHBOARD'
  | 'VIEW_WHATSAPP_REMINDERS'
  | 'VIEW_DOCUMENTS_PAGE'
  | 'VIEW_GUIDE_PAGE'
  | 'VIEW_SETTINGS_PAGE';

export function hasPermission(
  userRole: UserRole | undefined,
  action: AppAction,
  isAssignedPsychologist?: boolean // Specific for ACCESS_PATIENT_CLINICAL_DATA
): boolean {
  if (!userRole) return false;

  switch (action) {
    case 'VIEW_WEEKLY_AGENDA':
    case 'VIEW_WAITING_LIST_PATIENTS':
      return ['admin', 'psychologist', 'secretary', 'scheduling'].includes(userRole);

    case 'ADD_PATIENT_TO_WAITING_LIST':
      return ['admin', 'psychologist', 'secretary'].includes(userRole);

    case 'SCHEDULE_FROM_WAITING_LIST':
      return ['admin', 'psychologist', 'scheduling'].includes(userRole);

    case 'CREATE_EDIT_CLINICAL_NOTES': // Psychologist can only edit for their patients (enforced by UI/backend logic)
    case 'MANAGE_ASSESSMENTS_FORMS': // Psychologist can only manage for their patients (enforced by UI/backend logic)
      return ['admin', 'psychologist'].includes(userRole);

    case 'ACCESS_PATIENT_CLINICAL_DATA':
      if (userRole === 'admin') return true;
      if (userRole === 'psychologist' && isAssignedPsychologist) return true;
      return false;

    case 'ACCESS_ADMIN_PANEL_SETTINGS':
    case 'VIEW_ADMIN_METRICS':
      return userRole === 'admin';
    
    case 'VIEW_MY_PANEL_DASHBOARD':
    case 'VIEW_CLINICAL_ANALYSIS_DASHBOARD':
        return ['admin', 'psychologist'].includes(userRole);

    case 'VIEW_PERFORMANCE_DASHBOARD':
        return ['admin', 'secretary'].includes(userRole);

    case 'VIEW_WHATSAPP_REMINDERS':
    case 'VIEW_DOCUMENTS_PAGE':
    case 'VIEW_GUIDE_PAGE':
    case 'VIEW_SETTINGS_PAGE':
      return ['admin', 'psychologist', 'secretary', 'scheduling'].includes(userRole); // Assume all roles can see these for now

    default:
      return false;
  }
}
