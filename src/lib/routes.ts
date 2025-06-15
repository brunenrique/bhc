
export const APP_ROUTES = {
  dashboard: "/dashboard",
  schedule: "/schedule",
  patients: "/patients",
  newPatient: "/patients/new",
  groups: "/groups",
  waitingList: "/waiting-list",
  templates: "/templates",
  tasks: "/tasks",
  resources: "/resources",
  analytics: "/analytics",
  analyticsClinicOccupancy: "/analytics/clinic-occupancy",
  tools: "/tools",
  toolsPsychopharmacology: "/tools/psychopharmacology",
  toolsKnowledgeBase: "/tools/knowledge-base",
  toolsCaseFormulationModels: "/tools/case-formulation-models",
  inventoriesScales: "/inventories-scales",
  // userApprovals: "/user-approvals", // Route removed as feature is disabled
  toolsBackup: "/tools/backup",
  toolsAuditTrail: "/tools/audit-trail",
  adminMetrics: "/admin/metrics",
  settings: "/settings",
  help: "/help",
};

export type AppRouteKeys = keyof typeof APP_ROUTES;
