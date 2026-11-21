import type {
  AppUser,
  CrmRecord,
  EngineeringQuotation,
  QuotationTotals,
} from '../types/masbina.ts';

export const DEFAULT_TERMS_AND_CONDITIONS: string[] = [
  'Validity: This quotation is valid for thirty (30) days from the date of issue.',
  'Payment Terms: 50% deposit upon order confirmation, 40% upon equipment delivery to site, and 10% balance upon testing, commissioning & handover.',
  'Warranty: Twelve (12) months carry-in / on-site manufacturer warranty on supplied hardware against manufacturing defects, excluding lightning surge, water ingress, or misuse.',
  'Site Readiness: Client shall provide 240V AC power points, network internet uplink, and uninterrupted site access during scheduled installation hours.',
  'Variation Works: Any additional cabling run, concealed hacking, or civil works outside the listed specification will be billed separately upon site measurement.',
];

export function computeQuotationTotals(quote: EngineeringQuotation): QuotationTotals {
  const equipmentSubtotal = quote.equipmentItems.reduce(
    (sum, item) => sum + Math.max(0, item.qty) * Math.max(0, item.unitPrice),
    0,
  );
  const serviceSubtotal = quote.serviceItems.reduce(
    (sum, item) => sum + Math.max(0, item.qty) * Math.max(0, item.unitPrice),
    0,
  );
  const maintenanceSubtotal = quote.maintenanceItems.reduce(
    (sum, item) => sum + Math.max(0, item.qty) * Math.max(0, item.unitPrice),
    0,
  );

  const combinedSubtotal =
    equipmentSubtotal +
    serviceSubtotal +
    (quote.includeMaintenanceInTotal ? maintenanceSubtotal : 0);

  const rawDiscount =
    quote.discountType === 'percent'
      ? combinedSubtotal * (Math.min(100, Math.max(0, quote.discountValue)) / 100)
      : Math.max(0, quote.discountValue);

  const discountAmount = Math.min(combinedSubtotal, rawDiscount);
  const taxableSubtotal = Math.max(0, combinedSubtotal - discountAmount);
  const sstAmount = taxableSubtotal * (quote.sstRate / 100);
  const grandTotal = taxableSubtotal + sstAmount;

  return {
    equipmentSubtotal,
    serviceSubtotal,
    maintenanceSubtotal,
    combinedSubtotal,
    discountAmount,
    taxableSubtotal,
    sstAmount,
    grandTotal,
  };
}

export function formatRM(amount: number): string {
  return `RM ${amount.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function generateNextQuoteRef(existingQuotes: EngineeringQuotation[]): string {
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;
  let maxNum = 0;

  for (const q of existingQuotes) {
    if (q.quoteRef.startsWith(prefix)) {
      const parsed = parseInt(q.quoteRef.slice(prefix.length), 10);
      if (!Number.isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
  }

  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

export function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isValidPassword(password: string): boolean {
  return password.length > 6;
}

export function generateSixDigitCode(): string {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const code = 100000 + (array[0] % 900000);
  return String(code);
}

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-seed-admin',
    fullName: 'Daniel Lim',
    email: 'admin@masbina.com.my',
    password: 'Admin@1234',
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-01-10T01:00:00.000Z',
    lastLoginAt: '2026-11-20T01:30:00.000Z',
  },
  {
    id: 'usr-seed-manager',
    fullName: 'Marcus Tan',
    email: 'manager@masbina.com.my',
    password: 'Manager@1234',
    role: 'Manager',
    status: 'Active',
    createdAt: '2026-02-14T02:15:00.000Z',
    lastLoginAt: '2026-11-19T09:10:00.000Z',
  },
  {
    id: 'usr-seed-tech',
    fullName: 'Afiq Rahman',
    email: 'tech@masbina.com.my',
    password: 'Tech@1234',
    role: 'Technical',
    status: 'Active',
    createdAt: '2026-03-05T04:00:00.000Z',
    lastLoginAt: '2026-11-18T14:45:00.000Z',
  },
];

export const INITIAL_CRM_RECORDS: CrmRecord[] = [
  {
    id: 'crm-seed-001',
    clientName: 'Apex Precision Manufacturing Sdn Bhd',
    contactPerson: 'Ir. Kenneth Chong',
    contactPhone: '012-718 9034',
    siteType: 'Factory',
    location: 'Kawasan Perindustrian Pasir Gudang, Johor',
    businessScopes: [
      'CCTV Surveillance System',
      'Access Control System',
      'Automation System',
    ],
    workflowStage: 'Design & Quotation',
    painPoints:
      'Existing perimeter analog CCTV suffers poor night clarity; guardhouse barrier gate frequently jams during shift-change lorry traffic.',
    technicalRequirements:
      'Upgrade to 24-channel 4MP IP CCTV with 16TB NVR, integrate 2 UHF long-range barrier gates at guardhouse, and install biometric access for cleanroom QA lab.',
    actionItems: [
      'Finalize guardhouse loop-detector trenching drawing',
      'Submit revised RM quotation with 8% SST breakdown',
      'Schedule technical walkthrough with plant safety officer',
    ],
    nextFollowUpDate: addDaysISO(2),
    dealStatus: 'Quotation Sent',
    linkedQuotationId: 'qt-seed-001',
    createdAt: '2026-11-16T03:15:00.000Z',
    updatedAt: '2026-11-19T08:40:00.000Z',
  },
  {
    id: 'crm-seed-002',
    clientName: 'Horizon Cold-Chain Logistics S/B',
    contactPerson: 'Pn. Nurul Aina',
    contactPhone: '019-744 6210',
    siteType: 'Warehouse',
    location: 'SILC Industrial Park, Iskandar Puteri',
    businessScopes: ['Alarm System', 'CCTV Surveillance System'],
    workflowStage: 'Supply & Installation',
    painPoints:
      'Cold-room loading bays need 24/7 intrusion monitoring and instant mobile alerts if dock shutters remain open past 10pm.',
    technicalRequirements:
      '12x low-temperature rated 4MP dome cameras, 16-zone commercial intrusion alarm panel with magnetic roller-shutter contacts and dual-path GSM/IP communicator.',
    actionItems: [
      'Confirm conduit routing with warehouse supervisor',
      'Deliver hardware batch 1 and begin cabling on Monday',
    ],
    nextFollowUpDate: addDaysISO(5),
    dealStatus: 'Closed Won',
    linkedQuotationId: 'qt-seed-002',
    createdAt: '2026-11-08T06:00:00.000Z',
    updatedAt: '2026-11-18T10:20:00.000Z',
  },
];

export const INITIAL_QUOTATIONS: EngineeringQuotation[] = [
  {
    id: 'qt-seed-001',
    quoteRef: 'QT-2026-001',
    linkedCrmId: 'crm-seed-001',
    clientName: 'Apex Precision Manufacturing Sdn Bhd',
    contactPerson: 'Ir. Kenneth Chong',
    contactPhone: '012-718 9034',
    siteLocation: 'Kawasan Perindustrian Pasir Gudang, Johor',
    projectTitle:
      'Integrated 24-Ch IP CCTV, Guardhouse Barrier Automation & Cleanroom Biometric Access',
    preparedBy: 'Masbina Engineering Sales Team',
    issueDate: '2026-11-19',
    validityDate: '2026-12-19',
    equipmentItems: [
      {
        id: 'eq-s1-1',
        itemName: '4MP Outdoor IP Bullet Camera (IP67, Night Vision 40m)',
        brandSpec: 'Hikvision DS-2CD2T43G2-4I AcuSense',
        businessScope: 'CCTV Surveillance System',
        qty: 24,
        unit: 'Units',
        unitPrice: 420,
      },
      {
        id: 'eq-s1-2',
        itemName: '32-Channel 4K Enterprise NVR + 2x 8TB Surveillance HDD',
        brandSpec: 'Hikvision DS-7732NXI-I4 / WD Purple Pro',
        businessScope: 'CCTV Surveillance System',
        qty: 1,
        unit: 'Set',
        unitPrice: 3650,
      },
      {
        id: 'eq-s1-3',
        itemName: 'Industrial High-Speed Boom Barrier Gate (4.5m Arm)',
        brandSpec: 'MAG BR630T Brushless + Loop Detector & UHF Reader',
        businessScope: 'Automation System',
        qty: 2,
        unit: 'Sets',
        unitPrice: 4800,
      },
      {
        id: 'eq-s1-4',
        itemName: 'Biometric & RFID Door Access Terminal (EM Lock Kit)',
        brandSpec: 'ZKTeco SpeedFace-V5L + 600lbs EM Lock + PSU',
        businessScope: 'Access Control System',
        qty: 2,
        unit: 'Doors',
        unitPrice: 1450,
      },
    ],
    serviceItems: [
      {
        id: 'sv-s1-1',
        serviceCategory: 'Design',
        description:
          'Site Survey, Camera Field-of-View Layout & Network Topology Engineering',
        qty: 1,
        unit: 'Lot',
        unitPrice: 1200,
      },
      {
        id: 'sv-s1-2',
        serviceCategory: 'Installation',
        description:
          'Structured Cat6 Conduit Cabling, Camera Mounting, Barrier Civil Mounting & Access Wiring',
        qty: 1,
        unit: 'Lot',
        unitPrice: 6800,
      },
      {
        id: 'sv-s1-3',
        serviceCategory: 'Testing & Commissioning',
        description:
          'NVR Configuration, Mobile Viewing Setup, Barrier Loop Calibration & Operator Training',
        qty: 1,
        unit: 'Lot',
        unitPrice: 1650,
      },
    ],
    maintenanceItems: [
      {
        id: 'mt-s1-1',
        planName: 'Comprehensive Quarterly Preventive Maintenance (4 Visits/Year)',
        frequency: 'Annual',
        description:
          'Quarterly lens cleaning, NVR RAID/HDD health diagnostics, barrier motor tensioning, and priority 24-hr breakdown support.',
        qty: 1,
        unitPrice: 3600,
      },
    ],
    includeMaintenanceInTotal: false,
    discountType: 'fixed',
    discountValue: 500,
    sstRate: 8,
    termsAndConditions: DEFAULT_TERMS_AND_CONDITIONS,
    notes:
      'Civil trenching for barrier gate loop detector is included up to 8 meters from guardhouse DB.',
    createdAt: '2026-11-19T08:40:00.000Z',
    updatedAt: '2026-11-19T08:40:00.000Z',
  },
  {
    id: 'qt-seed-002',
    quoteRef: 'QT-2026-002',
    linkedCrmId: 'crm-seed-002',
    clientName: 'Horizon Cold-Chain Logistics S/B',
    contactPerson: 'Pn. Nurul Aina',
    contactPhone: '019-744 6210',
    siteLocation: 'SILC Industrial Park, Iskandar Puteri',
    projectTitle: 'Cold-Room Warehouse Intrusion Alarm & 12-Ch IP Surveillance System',
    preparedBy: 'Masbina Engineering Sales Team',
    issueDate: '2026-11-12',
    validityDate: '2026-12-12',
    equipmentItems: [
      {
        id: 'eq-s2-1',
        itemName: '4MP Cold-Rated IP Dome Camera (-30°C Operating Spec)',
        brandSpec: 'Dahua WizSense IPC-HDBW2441R-ZS',
        businessScope: 'CCTV Surveillance System',
        qty: 12,
        unit: 'Units',
        unitPrice: 460,
      },
      {
        id: 'eq-s2-2',
        itemName: '16-Channel PoE NVR with 8TB Surveillance Storage',
        brandSpec: 'Dahua NVR4216-16P-4KS2/L + 8TB SkyHawk',
        businessScope: 'CCTV Surveillance System',
        qty: 1,
        unit: 'Set',
        unitPrice: 2350,
      },
      {
        id: 'eq-s2-3',
        itemName: '16-Zone Commercial Hybrid Alarm Panel + 4G Communicator',
        brandSpec: 'Paradox EVO192 + PCS265LTE + 8 Roller Shutter Contacts',
        businessScope: 'Alarm System',
        qty: 1,
        unit: 'Set',
        unitPrice: 3280,
      },
    ],
    serviceItems: [
      {
        id: 'sv-s2-1',
        serviceCategory: 'Design',
        description: 'Alarm Zone Partitioning & Cold-Room Conduit Engineering Plan',
        qty: 1,
        unit: 'Lot',
        unitPrice: 800,
      },
      {
        id: 'sv-s2-2',
        serviceCategory: 'Installation',
        description:
          'Weatherproof GI Conduit Cabling, Roller-Shutter Sensor Fitting & Camera Installation',
        qty: 1,
        unit: 'Lot',
        unitPrice: 4200,
      },
      {
        id: 'sv-s2-3',
        serviceCategory: 'Testing & Commissioning',
        description:
          'Zone Trigger Verification, 4G Alert Routing & Handover Documentation',
        qty: 1,
        unit: 'Lot',
        unitPrice: 1100,
      },
    ],
    maintenanceItems: [
      {
        id: 'mt-s2-1',
        planName: 'Bi-Annual Security System Health Check & Backup Battery Audit',
        frequency: 'Annual',
        description:
          '2 scheduled on-site audits per year covering alarm sensor testing, backup battery replacement check, and firmware updates.',
        qty: 1,
        unitPrice: 1800,
      },
    ],
    includeMaintenanceInTotal: true,
    discountType: 'fixed',
    discountValue: 0,
    sstRate: 8,
    termsAndConditions: DEFAULT_TERMS_AND_CONDITIONS,
    notes: 'Installation scheduled during off-peak loading hours (2pm–6pm).',
    createdAt: '2026-11-12T04:00:00.000Z',
    updatedAt: '2026-11-18T10:20:00.000Z',
  },
];
