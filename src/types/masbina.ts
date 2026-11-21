export type Language = 'en' | 'zh';

export type NavSection = 'quick-entry' | 'crm-board' | 'quotation-builder';

export type BusinessScope =
  | 'CCTV Surveillance System'
  | 'Alarm System'
  | 'Access Control System'
  | 'Automation System'
  | 'Security Products Retail';

export type EngineeringServiceType =
  | 'Consultation'
  | 'Design'
  | 'Supply & Retail'
  | 'Installation'
  | 'Testing & Commissioning'
  | 'Maintenance & Support';

export type WorkflowStage =
  | 'Consultation'
  | 'Design & Quotation'
  | 'Supply & Installation'
  | 'Testing & Handover'
  | 'Maintenance & Support';

export type DealStatus =
  | 'New Lead'
  | 'Quotation Sent'
  | 'Negotiating'
  | 'Closed Won'
  | 'Closed Lost';

export type SiteType =
  | 'Factory'
  | 'Office'
  | 'Residential'
  | 'Warehouse'
  | 'Commercial'
  | 'Industrial Park'
  | 'Other';

export interface CrmRecord {
  id: string;
  clientName: string;
  contactPerson: string;
  contactPhone: string;
  siteType: SiteType;
  location: string;
  businessScopes: BusinessScope[];
  workflowStage: WorkflowStage;
  painPoints: string;
  technicalRequirements: string;
  actionItems: string[];
  nextFollowUpDate: string; // YYYY-MM-DD
  dealStatus: DealStatus;
  rawNotes?: string;
  linkedQuotationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentLineItem {
  id: string;
  itemName: string;
  brandSpec: string;
  businessScope: BusinessScope;
  qty: number;
  unit: string;
  unitPrice: number; // MYR
}

export interface ServiceLineItem {
  id: string;
  serviceCategory: EngineeringServiceType;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number; // MYR
}

export interface MaintenanceLineItem {
  id: string;
  planName: string;
  frequency: 'Annual' | 'Quarterly' | 'Bi-Annual' | 'Monthly';
  description: string;
  qty: number;
  unitPrice: number; // MYR
}

export interface EngineeringQuotation {
  id: string;
  quoteRef: string; // e.g., QT-2026-001
  linkedCrmId?: string;
  clientName: string;
  contactPerson: string;
  contactPhone: string;
  siteLocation: string;
  projectTitle: string;
  preparedBy: string;
  issueDate: string; // YYYY-MM-DD
  validityDate: string; // YYYY-MM-DD
  equipmentItems: EquipmentLineItem[];
  serviceItems: ServiceLineItem[];
  maintenanceItems: MaintenanceLineItem[];
  includeMaintenanceInTotal: boolean;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  sstRate: 0 | 8;
  termsAndConditions: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationTotals {
  equipmentSubtotal: number;
  serviceSubtotal: number;
  maintenanceSubtotal: number;
  combinedSubtotal: number;
  discountAmount: number;
  taxableSubtotal: number;
  sstAmount: number;
  grandTotal: number;
}

export interface ParsedMeetingResponse {
  salesReport: {
    clientName: string;
    contactPerson: string;
    contactPhone: string;
    siteType: SiteType;
    location: string;
    businessScopes: BusinessScope[];
    workflowStage: WorkflowStage;
    painPoints: string;
    technicalRequirements: string;
    actionItems: string[];
    nextFollowUpDate: string;
    dealStatus: DealStatus;
  };
  quotationDraft: {
    projectTitle: string;
    equipmentItems: Array<{
      itemName: string;
      brandSpec: string;
      businessScope: BusinessScope;
      qty: number;
      unit: string;
      unitPrice: number;
    }>;
    serviceItems: Array<{
      serviceCategory: EngineeringServiceType;
      description: string;
      qty: number;
      unit: string;
      unitPrice: number;
    }>;
    maintenanceItems: Array<{
      planName: string;
      frequency: 'Annual' | 'Quarterly' | 'Bi-Annual' | 'Monthly';
      description: string;
      qty: number;
      unitPrice: number;
    }>;
    notes: string;
  };
}

export const ALL_BUSINESS_SCOPES: BusinessScope[] = [
  'CCTV Surveillance System',
  'Alarm System',
  'Access Control System',
  'Automation System',
  'Security Products Retail',
];

export const ALL_ENGINEERING_SERVICES: EngineeringServiceType[] = [
  'Consultation',
  'Design',
  'Supply & Retail',
  'Installation',
  'Testing & Commissioning',
  'Maintenance & Support',
];

export const ALL_WORKFLOW_STAGES: WorkflowStage[] = [
  'Consultation',
  'Design & Quotation',
  'Supply & Installation',
  'Testing & Handover',
  'Maintenance & Support',
];

export const ALL_DEAL_STATUSES: DealStatus[] = [
  'New Lead',
  'Quotation Sent',
  'Negotiating',
  'Closed Won',
  'Closed Lost',
];

export const ALL_SITE_TYPES: SiteType[] = [
  'Factory',
  'Office',
  'Residential',
  'Warehouse',
  'Commercial',
  'Industrial Park',
  'Other',
];
