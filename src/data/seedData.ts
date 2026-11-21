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

export const INITIAL_USERS: AppUser[] = [];

export const INITIAL_CRM_RECORDS: CrmRecord[] = [];

export const INITIAL_QUOTATIONS: EngineeringQuotation[] = [];
