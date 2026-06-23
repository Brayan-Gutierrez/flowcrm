// ============================================================
// FlowCRM — Generación de PDF de cotizaciones (cliente)
// Usa jsPDF + autoTable. Se importa de forma dinámica para no
// engrosar el bundle inicial.
// ============================================================
import type { Quote, User } from "./types";
import { quoteTotals } from "./analytics";
import { formatCurrency } from "./utils";
import { formatDate } from "./format";

export async function exportQuotePdf(quote: Quote, owner?: User) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const { subtotal, tax, total } = quoteTotals(quote);
  const PRIMARY: [number, number, number] = [99, 102, 241];
  const pageW = doc.internal.pageSize.getWidth();

  // Encabezado
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("FlowCRM", 40, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("CRM para PYMES · www.flowcrm.io", 40, 64);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("COTIZACIÓN", pageW - 40, 45, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(quote.number, pageW - 40, 64, { align: "right" });

  // Datos
  doc.setTextColor(30, 30, 30);
  let y = 130;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Cliente", 40, y);
  doc.setFont("helvetica", "normal");
  doc.text(quote.accountName, 40, y + 16);

  doc.setFont("helvetica", "bold");
  doc.text("Detalles", pageW - 220, y);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${formatDate(quote.createdAt)}`, pageW - 220, y + 16);
  doc.text(`Válida hasta: ${formatDate(quote.validUntil)}`, pageW - 220, y + 32);
  if (owner) doc.text(`Ejecutivo: ${owner.name}`, pageW - 220, y + 48);

  // Tabla de conceptos
  autoTable(doc, {
    startY: y + 70,
    head: [["Concepto", "Cant.", "Precio unit.", "Importe"]],
    body: quote.items.map((it) => [
      it.description,
      String(it.quantity),
      formatCurrency(it.unitPrice),
      formatCurrency(it.quantity * it.unitPrice),
    ]),
    theme: "striped",
    headStyles: { fillColor: PRIMARY, halign: "left" },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    margin: { left: 40, right: 40 },
  });

  // Totales
  // @ts-expect-error lastAutoTable lo agrega autoTable en runtime
  const endY: number = doc.lastAutoTable.finalY + 20;
  const labelX = pageW - 200;
  const valueX = pageW - 40;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal", labelX, endY);
  doc.text(formatCurrency(subtotal), valueX, endY, { align: "right" });
  doc.text(`IVA (${quote.taxRate}%)`, labelX, endY + 16);
  doc.text(formatCurrency(tax), valueX, endY + 16, { align: "right" });
  doc.setDrawColor(...PRIMARY);
  doc.line(labelX, endY + 24, valueX, endY + 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total", labelX, endY + 42);
  doc.text(formatCurrency(total), valueX, endY + 42, { align: "right" });

  // Notas + pie
  if (quote.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(`Notas: ${quote.notes}`, 40, endY + 80, {
      maxWidth: pageW - 240,
    });
  }
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Gracias por su preferencia · Documento generado con FlowCRM",
    pageW / 2,
    doc.internal.pageSize.getHeight() - 30,
    { align: "center" },
  );

  doc.save(`${quote.number}.pdf`);
}
