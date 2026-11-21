import { Printer, X } from 'lucide-react';
import type { EngineeringQuotation, Language } from '../types/masbina.ts';
import { UI_TEXT } from '../data/i18n.ts';
import { computeQuotationTotals, formatRM } from '../data/seedData.ts';
import { MasbinaLogo } from './MasbinaLogo.tsx';

interface QuotationPreviewModalProps {
  quotation: EngineeringQuotation;
  lang: Language;
  onClose: () => void;
}

export function QuotationPreviewModal({
  quotation,
  lang,
  onClose,
}: QuotationPreviewModalProps) {
  const t = UI_TEXT[lang];
  const totals = computeQuotationTotals(quotation);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 sm:p-8 print-only-container"
      role="dialog"
      aria-modal="true"
      aria-label={`Quotation Preview ${quotation.quoteRef}`}
    >
      <div className="relative w-full max-w-[900px] rounded-lg border border-slate-200 bg-white shadow-xl print-only-container">
        {/* Modal Action Toolbar (hidden during print) */}
        <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3.5 rounded-t-lg">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="font-mono font-semibold text-slate-900">
              {quotation.quoteRef}
            </span>
            <span aria-hidden="true">·</span>
            <span>{quotation.clientName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Printer className="h-3.5 w-3.5" />
              {t.printSavePdf}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <X className="h-3.5 w-3.5" />
              {t.closePreview}
            </button>
          </div>
        </div>

        {/* Printable Official Engineering Quotation Document */}
        <article className="px-8 py-8 sm:px-12 sm:py-10 text-slate-900 bg-white">
          {/* Corporate Letterhead */}
          <header className="flex flex-col justify-between gap-6 border-b-2 border-[#0F172A] pb-6 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <div className="flex items-center gap-3.5">
                <MasbinaLogo className="h-16 w-auto shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
                    MASBINA TECHNOLOGY S/B
                  </h2>
                  <p className="text-xs font-medium text-slate-600">
                    Integrated Security &amp; Automation Solutions
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                CCTV Surveillance · Intrusion Alarm · Access Control · Automation Systems · Security Retail
                <br />
                Johor Bahru, Malaysia · Engineering Sales &amp; Technical Support
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <p className="text-lg font-bold tracking-wide text-[#2563EB] whitespace-nowrap">
                QUOTATION
              </p>
              <dl className="mt-2 space-y-1 text-xs">
                <div className="flex sm:justify-end gap-2">
                  <dt className="text-slate-500 whitespace-nowrap">Ref No:</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    {quotation.quoteRef}
                  </dd>
                </div>
                <div className="flex sm:justify-end gap-2">
                  <dt className="text-slate-500 whitespace-nowrap">Date:</dt>
                  <dd className="font-mono text-slate-900 tabular-nums whitespace-nowrap">
                    {quotation.issueDate}
                  </dd>
                </div>
                <div className="flex sm:justify-end gap-2">
                  <dt className="text-slate-500 whitespace-nowrap">Valid Until:</dt>
                  <dd className="font-mono text-slate-900 tabular-nums whitespace-nowrap">
                    {quotation.validityDate}
                  </dd>
                </div>
                <div className="flex sm:justify-end gap-2">
                  <dt className="text-slate-500 whitespace-nowrap">Currency:</dt>
                  <dd className="font-mono font-medium text-slate-900 whitespace-nowrap">
                    MYR (RM)
                  </dd>
                </div>
              </dl>
            </div>
          </header>

          {/* Client & Project Details */}
          <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 border-b border-slate-200 pb-6 text-xs">
            <div>
              <p className="font-semibold text-slate-500">Prepared For</p>
              <p className="mt-1.5 text-sm font-semibold text-slate-900">
                {quotation.clientName || '—'}
              </p>
              {quotation.contactPerson && (
                <p className="mt-1 text-slate-700">
                  Attn: {quotation.contactPerson}
                  {quotation.contactPhone ? ` (${quotation.contactPhone})` : ''}
                </p>
              )}
              {quotation.siteLocation && (
                <p className="mt-1 text-slate-600">Site: {quotation.siteLocation}</p>
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-500">Project Title</p>
              <p className="mt-1.5 text-sm font-semibold text-slate-900 leading-snug">
                {quotation.projectTitle || 'Integrated Security & Automation Proposal'}
              </p>
              <p className="mt-1.5 text-slate-600">
                Prepared By: {quotation.preparedBy || 'Masbina Engineering Sales Team'}
              </p>
            </div>
          </section>

          {/* Section A: Equipment Supply & Retail */}
          <section className="mt-6">
            <h3 className="text-xs font-bold tracking-wide text-[#0F172A] mb-2">
              SECTION A: EQUIPMENT SUPPLY &amp; RETAIL
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="border border-slate-300 px-2.5 py-2 text-center w-10">
                    No.
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-left">
                    Equipment Description &amp; Brand / Specification
                  </th>
                  <th className="border border-slate-300 px-2.5 py-2 text-right w-20">
                    Qty
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-right w-28">
                    Unit Price (RM)
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-right w-28">
                    Amount (RM)
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotation.equipmentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border border-slate-300 px-3 py-3 text-center text-slate-400"
                    >
                      No equipment items specified.
                    </td>
                  </tr>
                ) : (
                  quotation.equipmentItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="border border-slate-300 px-2.5 py-2 text-center font-mono tabular-nums text-slate-600 align-top">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 align-top">
                        <div className="font-semibold text-slate-900">
                          {item.itemName}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-600">
                          {item.brandSpec} · {item.businessScope}
                        </div>
                      </td>
                      <td className="border border-slate-300 px-2.5 py-2 text-right font-mono tabular-nums whitespace-nowrap align-top">
                        {item.qty} {item.unit}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap align-top">
                        {item.unitPrice.toLocaleString('en-MY', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-mono font-medium tabular-nums whitespace-nowrap align-top">
                        {(item.qty * item.unitPrice).toLocaleString('en-MY', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-semibold">
                  <td
                    colSpan={4}
                    className="border border-slate-300 px-3 py-2 text-right text-slate-700"
                  >
                    Subtotal Section A (Equipment Supply)
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-mono tabular-nums text-slate-900">
                    {formatRM(totals.equipmentSubtotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Section B: Engineering Services */}
          <section className="mt-6 print-break-avoid">
            <h3 className="text-xs font-bold tracking-wide text-[#0F172A] mb-2">
              SECTION B: ENGINEERING SERVICES
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="border border-slate-300 px-2.5 py-2 text-center w-10">
                    No.
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-left">
                    Service Category &amp; Engineering Scope
                  </th>
                  <th className="border border-slate-300 px-2.5 py-2 text-right w-20">
                    Qty
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-right w-28">
                    Unit Price (RM)
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-right w-28">
                    Amount (RM)
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotation.serviceItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border border-slate-300 px-3 py-3 text-center text-slate-400"
                    >
                      No engineering service items specified.
                    </td>
                  </tr>
                ) : (
                  quotation.serviceItems.map((svc, idx) => (
                    <tr key={svc.id}>
                      <td className="border border-slate-300 px-2.5 py-2 text-center font-mono tabular-nums text-slate-600 align-top">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 align-top">
                        <div className="font-semibold text-slate-900">
                          {svc.serviceCategory}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-600">
                          {svc.description}
                        </div>
                      </td>
                      <td className="border border-slate-300 px-2.5 py-2 text-right font-mono tabular-nums whitespace-nowrap align-top">
                        {svc.qty} {svc.unit}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap align-top">
                        {svc.unitPrice.toLocaleString('en-MY', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-mono font-medium tabular-nums whitespace-nowrap align-top">
                        {(svc.qty * svc.unitPrice).toLocaleString('en-MY', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-semibold">
                  <td
                    colSpan={4}
                    className="border border-slate-300 px-3 py-2 text-right text-slate-700"
                  >
                    Subtotal Section B (Engineering Services)
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-mono tabular-nums text-slate-900">
                    {formatRM(totals.serviceSubtotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Section C: Optional Maintenance Plan */}
          {quotation.maintenanceItems.length > 0 && (
            <section className="mt-6 print-break-avoid">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-xs font-bold tracking-wide text-[#0F172A]">
                  SECTION C: OPTIONAL MAINTENANCE &amp; SUPPORT PLAN
                </h3>
                <span className="text-[11px] text-slate-500">
                  {quotation.includeMaintenanceInTotal
                    ? 'Included in Grand Total'
                    : 'Optional Addendum — Excluded from Grand Total'}
                </span>
              </div>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-300 px-3 py-2 text-left">
                      Maintenance Plan &amp; Coverage
                    </th>
                    <th className="border border-slate-300 px-2.5 py-2 text-left w-24">
                      Cycle
                    </th>
                    <th className="border border-slate-300 px-2.5 py-2 text-right w-16">
                      Qty
                    </th>
                    <th className="border border-slate-300 px-3 py-2 text-right w-28">
                      Amount (RM)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.maintenanceItems.map((m) => (
                    <tr key={m.id}>
                      <td className="border border-slate-300 px-3 py-2 align-top">
                        <div className="font-semibold text-slate-900">{m.planName}</div>
                        <div className="mt-0.5 text-[11px] text-slate-600">
                          {m.description}
                        </div>
                      </td>
                      <td className="border border-slate-300 px-2.5 py-2 align-top text-slate-700">
                        {m.frequency}
                      </td>
                      <td className="border border-slate-300 px-2.5 py-2 text-right font-mono tabular-nums align-top">
                        {m.qty}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-mono font-medium tabular-nums whitespace-nowrap align-top">
                        {(m.qty * m.unitPrice).toLocaleString('en-MY', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Financial Summary Box */}
          <section className="mt-6 flex justify-end print-break-avoid">
            <div className="w-full max-w-sm border border-slate-300 text-xs">
              <div className="flex justify-between px-4 py-2 border-b border-slate-200">
                <span className="text-slate-600">Combined Subtotal</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {formatRM(totals.combinedSubtotal)}
                </span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between px-4 py-2 border-b border-slate-200 text-emerald-700">
                  <span>
                    Discount
                    {quotation.discountType === 'percent'
                      ? ` (${quotation.discountValue}%)`
                      : ''}
                  </span>
                  <span className="font-mono tabular-nums font-medium">
                    - {formatRM(totals.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between px-4 py-2 border-b border-slate-200">
                <span className="text-slate-600">
                  SST ({quotation.sstRate}%)
                </span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {formatRM(totals.sstAmount)}
                </span>
              </div>
              <div className="flex justify-between px-4 py-3 bg-[#0F172A] text-white text-sm font-semibold">
                <span>GRAND TOTAL (MYR)</span>
                <span className="font-mono tabular-nums">
                  {formatRM(totals.grandTotal)}
                </span>
              </div>
            </div>
          </section>

          {/* Remarks & Terms */}
          <section className="mt-8 border-t border-slate-200 pt-5 space-y-4 text-xs print-break-avoid">
            {quotation.notes && (
              <div>
                <h4 className="font-bold text-slate-800">Engineering Remarks</h4>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {quotation.notes}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-bold text-slate-800">Terms &amp; Conditions</h4>
              <ol className="mt-1.5 list-decimal pl-4 space-y-1 text-slate-600 leading-relaxed">
                {quotation.termsAndConditions.map((term, idx) => (
                  <li key={idx}>{term}</li>
                ))}
              </ol>
            </div>
          </section>

          {/* Signature Block */}
          <footer className="mt-10 grid grid-cols-2 gap-12 pt-4 text-xs print-break-avoid">
            <div>
              <p className="text-slate-500">Prepared &amp; Issued By:</p>
              <p className="mt-1 font-semibold text-slate-900">
                Masbina Technology S/B
              </p>
              <div className="mt-12 border-t border-slate-400 pt-2 text-slate-600">
                Authorized Signatory &amp; Company Stamp
              </div>
            </div>
            <div>
              <p className="text-slate-500">Confirmed &amp; Accepted By:</p>
              <p className="mt-1 font-semibold text-slate-900">
                {quotation.clientName || 'Client Organization'}
              </p>
              <div className="mt-12 border-t border-slate-400 pt-2 text-slate-600">
                Name, Signature, Date &amp; Company Chop
              </div>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
