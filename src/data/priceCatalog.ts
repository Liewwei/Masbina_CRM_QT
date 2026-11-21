import type {
  BusinessScope,
  EngineeringQuotation,
  EngineeringServiceType,
  EquipmentLineItem,
  MaintenanceLineItem,
  ServiceLineItem,
} from '../types/masbina.ts';

export interface CctvHardwareCatalogItem {
  code: string;
  itemName: string;
  brandSpec: string;
  businessScope: BusinessScope;
  unit: string;
  unitPrice: number;
  priceRange?: string;
}

export interface CctvServiceCatalogItem {
  code: string;
  serviceCategory: EngineeringServiceType;
  description: string;
  unit: string;
  minPrice: number;
  maxPrice: number;
}

export interface CctvMaintenanceCatalogItem {
  code: string;
  tier: 'Small' | 'Medium' | 'Industrial';
  planName: string;
  frequency: MaintenanceLineItem['frequency'];
  description: string;
  unitPrice: number;
}

export interface CctvQuotationPreset {
  id: 'cctv-4ch' | 'cctv-8ch' | 'cctv-16ch';
  labelEn: string;
  labelZh: string;
  summaryEn: string;
  summaryZh: string;
  projectTitle: string;
  notes: string;
  equipmentItems: Array<Omit<EquipmentLineItem, 'id'>>;
  serviceItems: Array<Omit<ServiceLineItem, 'id'>>;
  maintenanceItems: Array<Omit<MaintenanceLineItem, 'id'>>;
}

export const CCTV_HARDWARE_CATALOG: Record<string, CctvHardwareCatalogItem> = {
  bullet4mpStandard: {
    code: 'CAM-4MP-BLT',
    itemName: '4MP Outdoor IP Bullet Camera (IP67, IR 40m)',
    brandSpec: 'Hikvision / Dahua Commercial IP67 Series (IR 40m)',
    businessScope: 'CCTV Surveillance System',
    unit: 'Units',
    unitPrice: 380,
  },
  bullet4mpIndustrial: {
    code: 'CAM-4MP-BLT-IND',
    itemName: '4MP Outdoor IP Bullet Camera (IP67, IR 40m — Industrial Heavy-Duty)',
    brandSpec: 'Hikvision / Dahua Industrial Heavy-Duty Metal IP67 (IR 40m)',
    businessScope: 'CCTV Surveillance System',
    unit: 'Units',
    unitPrice: 420,
  },
  dome4mpIndoor: {
    code: 'CAM-4MP-DOM',
    itemName: '4MP Indoor IP Dome Camera (IR 30m)',
    brandSpec: 'Hikvision / Dahua Commercial Dome Series (IR 30m)',
    businessScope: 'CCTV Surveillance System',
    unit: 'Units',
    unitPrice: 360,
  },
  colorVu5mp: {
    code: 'CAM-5MP-CVU',
    itemName: '5MP ColorVu Full-Color IP Camera',
    brandSpec: 'Hikvision ColorVu / Dahua Full-Color 24/7 Series',
    businessScope: 'CCTV Surveillance System',
    unit: 'Units',
    unitPrice: 480,
  },
  nvr4ch: {
    code: 'NVR-4CH-4K',
    itemName: '4-Channel 4K PoE NVR',
    brandSpec: '4-Ch Embedded 4K PoE NVR (H.265+, HDMI/VGA)',
    businessScope: 'CCTV Surveillance System',
    unit: 'Set',
    unitPrice: 780,
  },
  nvr8ch: {
    code: 'NVR-8CH-4K',
    itemName: '8-Channel 4K PoE NVR',
    brandSpec: '8-Ch Embedded 4K PoE NVR (H.265+, Dual Stream)',
    businessScope: 'CCTV Surveillance System',
    unit: 'Set',
    unitPrice: 1150,
  },
  nvr16ch: {
    code: 'NVR-16CH-4K',
    itemName: '16-Channel 4K PoE NVR',
    brandSpec: '16-Ch Enterprise 4K PoE NVR (H.265+, Dual SATA)',
    businessScope: 'CCTV Surveillance System',
    unit: 'Set',
    unitPrice: 2350,
  },
  nvr32ch: {
    code: 'NVR-32CH-ENT',
    itemName: '32-Channel Enterprise NVR',
    brandSpec: '32-Ch Enterprise 4K NVR (4-Bay SATA, RAID Ready)',
    businessScope: 'CCTV Surveillance System',
    unit: 'Set',
    unitPrice: 3650,
  },
  hdd2tb: {
    code: 'HDD-2TB-SURV',
    itemName: '2TB Surveillance HDD (24/7 Rated)',
    brandSpec: 'WD Purple / Seagate SkyHawk 24/7 Surveillance Grade',
    businessScope: 'CCTV Surveillance System',
    unit: 'Unit',
    unitPrice: 380,
  },
  hdd4tb: {
    code: 'HDD-4TB-SURV',
    itemName: '4TB Surveillance HDD (24/7 Rated)',
    brandSpec: 'WD Purple / Seagate SkyHawk 24/7 Surveillance Grade',
    businessScope: 'CCTV Surveillance System',
    unit: 'Unit',
    unitPrice: 550,
  },
  hdd8tb: {
    code: 'HDD-8TB-SURV',
    itemName: '8TB Surveillance HDD (24/7 Rated)',
    brandSpec: 'WD Purple Pro / Seagate SkyHawk AI 24/7 Grade',
    businessScope: 'CCTV Surveillance System',
    unit: 'Unit',
    unitPrice: 1050,
  },
  accessoriesKitSmall: {
    code: 'ACC-CCTV-SM',
    itemName: 'CCTV Installation Accessories & Surge Protection Kit',
    brandSpec: 'Weatherproof Junction Boxes, RJ45 Plugs, Patch Cords & Surge Protector',
    businessScope: 'CCTV Surveillance System',
    unit: 'Lot',
    unitPrice: 220,
    priceRange: 'RM 220 – RM 680',
  },
  accessoriesKitMedium: {
    code: 'ACC-CCTV-MD',
    itemName: 'CCTV Installation Accessories & Surge Protection Kit',
    brandSpec: 'Weatherproof Boxes, Mounting Brackets, Patch Panel & Surge Protection',
    businessScope: 'CCTV Surveillance System',
    unit: 'Lot',
    unitPrice: 380,
    priceRange: 'RM 220 – RM 680',
  },
  accessoriesKitIndustrial: {
    code: 'ACC-CCTV-IND',
    itemName: 'CCTV Installation Accessories & Surge Protection Kit',
    brandSpec: 'Industrial Weatherproof Enclosures, GI Conduit Fittings & Surge Protection',
    businessScope: 'CCTV Surveillance System',
    unit: 'Lot',
    unitPrice: 680,
    priceRange: 'RM 220 – RM 680',
  },
};

export const CCTV_SERVICE_CATALOG: Record<string, CctvServiceCatalogItem> = {
  design: {
    code: 'SVC-CCTV-DES',
    serviceCategory: 'Design',
    description: 'Camera Field-of-View Layout & Network Design',
    unit: 'Lot',
    minPrice: 250,
    maxPrice: 800,
  },
  installation: {
    code: 'SVC-CCTV-INS',
    serviceCategory: 'Installation',
    description: 'Structured Cat6 Cabling, Conduit & Camera Mounting',
    unit: 'Points',
    minPrice: 250,
    maxPrice: 320,
  },
  testingCommissioning: {
    code: 'SVC-CCTV-TNC',
    serviceCategory: 'Testing & Commissioning',
    description: 'NVR Setup, Mobile Remote Viewing & User Training',
    unit: 'Lot',
    minPrice: 300,
    maxPrice: 850,
  },
};

export const CCTV_MAINTENANCE_CATALOG: Record<
  'small' | 'medium' | 'industrial',
  CctvMaintenanceCatalogItem
> = {
  small: {
    code: 'MNT-CCTV-SM',
    tier: 'Small',
    planName: 'Preventive CCTV Maintenance & Health Audit (Small Site)',
    frequency: 'Annual',
    description:
      'Bi-annual lens cleaning, NVR & HDD health check, firmware updates, and remote troubleshooting support.',
    unitPrice: 600,
  },
  medium: {
    code: 'MNT-CCTV-MD',
    tier: 'Medium',
    planName: 'Preventive CCTV Maintenance & Health Audit (Medium Site)',
    frequency: 'Annual',
    description:
      'Scheduled preventive inspections, camera alignment, NVR storage diagnostics, and priority on-site support.',
    unitPrice: 1100,
  },
  industrial: {
    code: 'MNT-CCTV-IND',
    tier: 'Industrial',
    planName: 'Preventive CCTV Maintenance & Health Audit (Industrial Quarterly)',
    frequency: 'Annual',
    description:
      'Quarterly on-site preventive maintenance (4 visits/year), NVR RAID/HDD diagnostics, and priority 24-hr breakdown response.',
    unitPrice: 2200,
  },
};

export const CCTV_QUOTATION_PRESETS: CctvQuotationPreset[] = [
  {
    id: 'cctv-4ch',
    labelEn: '4-Ch CCTV (Shop / Home)',
    labelZh: '4路监控套餐（商铺 / 住宅）',
    summaryEn: '4× 4MP Cams · 4-Ch PoE NVR · 2TB HDD',
    summaryZh: '4× 4MP摄像头 · 4路PoE NVR · 2TB硬盘',
    projectTitle: '4-Channel 4MP IP CCTV Surveillance System Supply & Installation',
    notes:
      'Standard commercial/residential PVC conduit cabling up to 25m per camera point. Includes smartphone remote viewing setup.',
    equipmentItems: [
      {
        itemName: CCTV_HARDWARE_CATALOG.bullet4mpStandard.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.bullet4mpStandard.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 2,
        unit: CCTV_HARDWARE_CATALOG.bullet4mpStandard.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.bullet4mpStandard.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.dome4mpIndoor.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.dome4mpIndoor.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 2,
        unit: CCTV_HARDWARE_CATALOG.dome4mpIndoor.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.dome4mpIndoor.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.nvr4ch.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.nvr4ch.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 1,
        unit: CCTV_HARDWARE_CATALOG.nvr4ch.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.nvr4ch.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.hdd2tb.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.hdd2tb.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 1,
        unit: CCTV_HARDWARE_CATALOG.hdd2tb.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.hdd2tb.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.accessoriesKitSmall.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.accessoriesKitSmall.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 1,
        unit: CCTV_HARDWARE_CATALOG.accessoriesKitSmall.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.accessoriesKitSmall.unitPrice,
      },
    ],
    serviceItems: [
      {
        serviceCategory: 'Design',
        description: CCTV_SERVICE_CATALOG.design.description,
        qty: 1,
        unit: 'Lot',
        unitPrice: 250,
      },
      {
        serviceCategory: 'Installation',
        description: CCTV_SERVICE_CATALOG.installation.description,
        qty: 4,
        unit: 'Points',
        unitPrice: 250,
      },
      {
        serviceCategory: 'Testing & Commissioning',
        description: CCTV_SERVICE_CATALOG.testingCommissioning.description,
        qty: 1,
        unit: 'Lot',
        unitPrice: 300,
      },
    ],
    maintenanceItems: [
      {
        planName: CCTV_MAINTENANCE_CATALOG.small.planName,
        frequency: CCTV_MAINTENANCE_CATALOG.small.frequency,
        description: CCTV_MAINTENANCE_CATALOG.small.description,
        qty: 1,
        unitPrice: CCTV_MAINTENANCE_CATALOG.small.unitPrice,
      },
    ],
  },
  {
    id: 'cctv-8ch',
    labelEn: '8-Ch CCTV (Office / Bungalow)',
    labelZh: '8路监控套餐（办公室 / 别墅）',
    summaryEn: '8× 4MP/5MP ColorVu · 8-Ch PoE NVR · 4TB HDD',
    summaryZh: '8× 4MP/5MP全彩 · 8路PoE NVR · 4TB硬盘',
    projectTitle: '8-Channel 4MP/5MP IP CCTV Surveillance System Supply & Installation',
    notes:
      'Includes 2x 5MP ColorVu full-color cameras for main entrance/perimeter and structured Cat6 cabling in conduit.',
    equipmentItems: [
      {
        itemName: CCTV_HARDWARE_CATALOG.bullet4mpStandard.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.bullet4mpStandard.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 4,
        unit: CCTV_HARDWARE_CATALOG.bullet4mpStandard.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.bullet4mpStandard.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.colorVu5mp.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.colorVu5mp.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 2,
        unit: CCTV_HARDWARE_CATALOG.colorVu5mp.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.colorVu5mp.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.dome4mpIndoor.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.dome4mpIndoor.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 2,
        unit: CCTV_HARDWARE_CATALOG.dome4mpIndoor.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.dome4mpIndoor.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.nvr8ch.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.nvr8ch.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 1,
        unit: CCTV_HARDWARE_CATALOG.nvr8ch.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.nvr8ch.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.hdd4tb.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.hdd4tb.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 1,
        unit: CCTV_HARDWARE_CATALOG.hdd4tb.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.hdd4tb.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.accessoriesKitMedium.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.accessoriesKitMedium.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 1,
        unit: CCTV_HARDWARE_CATALOG.accessoriesKitMedium.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.accessoriesKitMedium.unitPrice,
      },
    ],
    serviceItems: [
      {
        serviceCategory: 'Design',
        description: CCTV_SERVICE_CATALOG.design.description,
        qty: 1,
        unit: 'Lot',
        unitPrice: 450,
      },
      {
        serviceCategory: 'Installation',
        description: CCTV_SERVICE_CATALOG.installation.description,
        qty: 8,
        unit: 'Points',
        unitPrice: 280,
      },
      {
        serviceCategory: 'Testing & Commissioning',
        description: CCTV_SERVICE_CATALOG.testingCommissioning.description,
        qty: 1,
        unit: 'Lot',
        unitPrice: 500,
      },
    ],
    maintenanceItems: [
      {
        planName: CCTV_MAINTENANCE_CATALOG.medium.planName,
        frequency: CCTV_MAINTENANCE_CATALOG.medium.frequency,
        description: CCTV_MAINTENANCE_CATALOG.medium.description,
        qty: 1,
        unitPrice: CCTV_MAINTENANCE_CATALOG.medium.unitPrice,
      },
    ],
  },
  {
    id: 'cctv-16ch',
    labelEn: '16-Ch CCTV (Factory / Warehouse)',
    labelZh: '16路监控套餐（工厂 / 仓库）',
    summaryEn: '16× Industrial/ColorVu · 16-Ch PoE NVR · 8TB HDD',
    summaryZh: '16× 工业级/全彩 · 16路PoE NVR · 8TB硬盘',
    projectTitle:
      '16-Channel Industrial IP CCTV Surveillance System Supply & Installation',
    notes:
      'Industrial/factory specification with heavy-duty weatherproof outdoor bullet cameras, GI conduit cabling, and 24/7 enterprise storage.',
    equipmentItems: [
      {
        itemName: CCTV_HARDWARE_CATALOG.bullet4mpIndustrial.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.bullet4mpIndustrial.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 10,
        unit: CCTV_HARDWARE_CATALOG.bullet4mpIndustrial.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.bullet4mpIndustrial.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.dome4mpIndoor.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.dome4mpIndoor.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 4,
        unit: CCTV_HARDWARE_CATALOG.dome4mpIndoor.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.dome4mpIndoor.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.colorVu5mp.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.colorVu5mp.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 2,
        unit: CCTV_HARDWARE_CATALOG.colorVu5mp.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.colorVu5mp.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.nvr16ch.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.nvr16ch.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 1,
        unit: CCTV_HARDWARE_CATALOG.nvr16ch.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.nvr16ch.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.hdd8tb.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.hdd8tb.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 1,
        unit: CCTV_HARDWARE_CATALOG.hdd8tb.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.hdd8tb.unitPrice,
      },
      {
        itemName: CCTV_HARDWARE_CATALOG.accessoriesKitIndustrial.itemName,
        brandSpec: CCTV_HARDWARE_CATALOG.accessoriesKitIndustrial.brandSpec,
        businessScope: 'CCTV Surveillance System',
        qty: 1,
        unit: CCTV_HARDWARE_CATALOG.accessoriesKitIndustrial.unit,
        unitPrice: CCTV_HARDWARE_CATALOG.accessoriesKitIndustrial.unitPrice,
      },
    ],
    serviceItems: [
      {
        serviceCategory: 'Design',
        description: CCTV_SERVICE_CATALOG.design.description,
        qty: 1,
        unit: 'Lot',
        unitPrice: 800,
      },
      {
        serviceCategory: 'Installation',
        description: CCTV_SERVICE_CATALOG.installation.description,
        qty: 16,
        unit: 'Points',
        unitPrice: 320,
      },
      {
        serviceCategory: 'Testing & Commissioning',
        description: CCTV_SERVICE_CATALOG.testingCommissioning.description,
        qty: 1,
        unit: 'Lot',
        unitPrice: 850,
      },
    ],
    maintenanceItems: [
      {
        planName: CCTV_MAINTENANCE_CATALOG.industrial.planName,
        frequency: CCTV_MAINTENANCE_CATALOG.industrial.frequency,
        description: CCTV_MAINTENANCE_CATALOG.industrial.description,
        qty: 1,
        unitPrice: CCTV_MAINTENANCE_CATALOG.industrial.unitPrice,
      },
    ],
  },
];

export function createQuotationFromCctvPreset(
  preset: CctvQuotationPreset,
  options: {
    quoteRef: string;
    issueDate: string;
    validityDate: string;
    termsAndConditions: string[];
    preparedBy?: string;
  },
): EngineeringQuotation {
  const now = new Date().toISOString();
  return {
    id: `qt-${crypto.randomUUID()}`,
    quoteRef: options.quoteRef,
    clientName: '',
    contactPerson: '',
    contactPhone: '',
    siteLocation: '',
    projectTitle: preset.projectTitle,
    preparedBy: options.preparedBy || 'Masbina Engineering Sales Team',
    issueDate: options.issueDate,
    validityDate: options.validityDate,
    equipmentItems: preset.equipmentItems.map((item) => ({
      ...item,
      id: `eq-${crypto.randomUUID()}`,
    })),
    serviceItems: preset.serviceItems.map((svc) => ({
      ...svc,
      id: `sv-${crypto.randomUUID()}`,
    })),
    maintenanceItems: preset.maintenanceItems.map((m) => ({
      ...m,
      id: `mt-${crypto.randomUUID()}`,
    })),
    includeMaintenanceInTotal: false,
    discountType: 'fixed',
    discountValue: 0,
    sstRate: 8,
    termsAndConditions: [...options.termsAndConditions],
    notes: preset.notes,
    createdAt: now,
    updatedAt: now,
  };
}

export function formatCctvCatalogForPrompt(): string {
  return `MASBINA TECHNOLOGY S/B STANDARD CCTV PRICE CATALOG (MYR / RM — APPLY THESE EXACT UNIT PRICES FOR CCTV ITEMS):
Hardware (businessScope: "CCTV Surveillance System"):
- 4MP Outdoor IP Bullet Camera (IP67, IR 40m): RM 380 / Unit (Industrial / Factory Heavy-Duty Spec: RM 420 / Unit)
- 4MP Indoor IP Dome Camera (IR 30m): RM 360 / Unit
- 5MP ColorVu Full-Color IP Camera: RM 480 / Unit
- 4-Channel 4K PoE NVR: RM 780 / Set
- 8-Channel 4K PoE NVR: RM 1,150 / Set
- 16-Channel 4K PoE NVR: RM 2,350 / Set
- 32-Channel Enterprise NVR: RM 3,650 / Set
- 2TB Surveillance HDD (24/7 Rated): RM 380 / Unit
- 4TB Surveillance HDD (24/7 Rated): RM 550 / Unit
- 8TB Surveillance HDD (24/7 Rated): RM 1,050 / Unit
- CCTV Installation Accessories & Surge Protection Kit: RM 220 – RM 680 / Lot (Small 4-Ch: RM 220, Medium 8-Ch: RM 380, Industrial 16-Ch+: RM 680)

CCTV Engineering Services (Section B):
- "Design" (Camera Field-of-View Layout & Network Design): RM 250 – RM 800 / Lot (Small: RM 250, Medium: RM 450, Industrial/Factory: RM 800)
- "Installation" (Structured Cat6 Cabling, Conduit & Camera Mounting): RM 250 – RM 320 / Point (Small/Shop/Home: RM 250/Point, Office/Bungalow: RM 280/Point, Industrial/Factory/Warehouse: RM 320/Point; set qty = total camera points and unit = "Points")
- "Testing & Commissioning" (NVR Setup, Mobile Remote Viewing & User Training): RM 300 – RM 850 / Lot (Small: RM 300, Medium: RM 500, Industrial: RM 850)

CCTV Maintenance & Support (Section C — Optional Maintenance Plan):
- Preventive CCTV Maintenance & Health Audit: RM 600 / year (Small Site), RM 1,100 / year (Medium Site), RM 2,200 / year (Industrial Quarterly — 4 visits/year)`;
}
