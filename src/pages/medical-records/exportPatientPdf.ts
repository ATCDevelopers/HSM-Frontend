import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  PatientHeader,
  ConsultationRow,
  VitalsRow,
  LabTestRow,
  PrescriptionRow,
  DiagnosisRow,
} from "./types";

const NAVY: [number, number, number] = [23, 58, 94];
const ACCENT: [number, number, number] = [37, 99, 235];
const LIGHT_BG: [number, number, number] = [240, 246, 255];
const TEXT_MUTED: [number, number, number] = [110, 118, 130];
const BORDER: [number, number, number] = [225, 230, 238];

interface ExportPatientPdfArgs {
  header: PatientHeader;
  consultations: ConsultationRow[];
  vitals: VitalsRow[];
  labTests: LabTestRow[];
  prescriptions: PrescriptionRow[];
  diagnoses: DiagnosisRow[];
}

export function exportPatientRecordPdf({
  header,
  consultations,
  vitals,
  labTests,
  prescriptions,
  diagnoses,
}: ExportPatientPdfArgs) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 44;
  const contentWidth = pageWidth - marginX * 2;

  const HEADER_HEIGHT = 92;
  const FOOTER_HEIGHT = 46;

  /** Draws the letterhead — called on every page. */
  const drawHeader = () => {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

    // Simple monogram mark, left side.
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(marginX, 22, 40, 40, 8, 8, "F");
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("H", marginX + 20, 48, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Hospital Management System", marginX + 54, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 212, 230);
    doc.text(
      "Electronic Medical Record — Official Patient Summary",
      marginX + 54,
      55,
    );

    doc.setFontSize(8.5);
    doc.setTextColor(200, 212, 230);
    doc.text(
      `Generated ${new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      pageWidth - marginX,
      40,
      { align: "right" },
    );
    doc.text(
      new Date().toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
      pageWidth - marginX,
      53,
      { align: "right" },
    );
  };

  /** Draws the confidentiality footer + page number — called on every page. */
  const drawFooter = (pageNum: number, pageCount: number) => {
    const y = pageHeight - FOOTER_HEIGHT;
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.75);
    doc.line(marginX, y, pageWidth - marginX, y);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      "Confidential — for authorized clinical use only.",
      marginX,
      y + 16,
    );
    doc.text(`${header.name} · ${header.patient_id}`, marginX, y + 28);

    doc.text(`Page ${pageNum} of ${pageCount}`, pageWidth - marginX, y + 16, {
      align: "right",
    });
  };

  /** Section title with a small accent bar, consistent across the doc. */
  const sectionTitle = (title: string, y: number) => {
    doc.setFillColor(...ACCENT);
    doc.rect(marginX, y - 11, 4, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.setTextColor(30, 30, 30);
    doc.text(title, marginX + 12, y);
    return y + 14;
  };

  const tableTheme = {
    theme: "grid" as const,
    margin: {
      left: marginX,
      right: marginX,
      top: HEADER_HEIGHT + 16,
      bottom: FOOTER_HEIGHT + 10,
    },
    headStyles: {
      fillColor: NAVY,
      textColor: 255,
      fontStyle: "bold" as const,
      fontSize: 9,
      cellPadding: { top: 7, bottom: 7, left: 8, right: 8 },
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [40, 40, 40] as [number, number, number],
      cellPadding: { top: 6, bottom: 6, left: 8, right: 8 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 253] as [number, number, number],
    },
    styles: { lineColor: BORDER, lineWidth: 0.5 },
  };

  // ---- Page 1: header + patient info card ----
  drawHeader();
  let y = HEADER_HEIGHT + 34;

  const cardHeight = 78;
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(marginX, y, contentWidth, cardHeight, 8, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(20, 20, 20);
  doc.text(header.name, marginX + 18, y + 26);

  const fields: [string, string][] = [
    ["Patient ID", header.patient_id],
    ["Gender", header.gender],
    ["Age", `${header.age} years`],
    ["Phone", header.phone],
  ];
  const fieldWidth = (contentWidth - 36) / 4;
  fields.forEach(([label, value], i) => {
    const fx = marginX + 18 + i * fieldWidth;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(label.toUpperCase(), fx, y + 48);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 30, 30);
    doc.text(value, fx, y + 62);
  });

  y += cardHeight + 32;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - FOOTER_HEIGHT - 20) {
      doc.addPage();
      y = HEADER_HEIGHT + 30;
    }
  };

  // ---- Consultations ----
  ensureSpace(60);
  y = sectionTitle("Consultations", y);
  autoTable(doc, {
    ...tableTheme,
    startY: y,
    head: [["Date", "Doctor", "Chief Complaint", "Diagnosis"]],
    body: consultations.map((c) => [
      c.date,
      c.doctor_name,
      c.chief_complaint,
      c.diagnosis,
    ]),
  });
  y = (doc as any).lastAutoTable.finalY + 30;

  // ---- Vitals ----
  ensureSpace(60);
  y = sectionTitle("Vitals", y);
  autoTable(doc, {
    ...tableTheme,
    startY: y,
    head: [["Date", "BP", "Temp", "HR", "RR", "SpO2", "Weight"]],
    body: vitals.map((v) => [
      v.date,
      v.bp,
      v.temp,
      v.hr,
      v.rr,
      v.spo2,
      v.weight,
    ]),
  });
  y = (doc as any).lastAutoTable.finalY + 30;

  // ---- Lab Tests ----
  ensureSpace(60);
  y = sectionTitle("Lab Tests", y);
  autoTable(doc, {
    ...tableTheme,
    startY: y,
    head: [["Date", "Test", "Status", "Result"]],
    body: labTests.map((l) => [l.date, l.test, l.status, l.result]),
    columnStyles: {
      2: {
        cellWidth: 80,
      },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
        const status = String(data.cell.raw);
        if (status === "Completed") data.cell.styles.textColor = [22, 101, 52];
        if (status === "Pending") data.cell.styles.textColor = [161, 98, 7];
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 30;

  // ---- Prescriptions ----
  ensureSpace(60);
  y = sectionTitle("Prescriptions", y);
  autoTable(doc, {
    ...tableTheme,
    startY: y,
    head: [["Date", "Medication", "Dose", "Frequency", "Status"]],
    body: prescriptions.map((p) => [
      p.date,
      p.medication,
      p.dose,
      p.frequency,
      p.status,
    ]),
  });
  y = (doc as any).lastAutoTable.finalY + 30;

  // ---- Diagnoses ----
  ensureSpace(60);
  y = sectionTitle("Diagnoses", y);
  autoTable(doc, {
    ...tableTheme,
    startY: y,
    head: [["Date", "Diagnosis", "ICD-10", "Status"]],
    body: diagnoses.map((d) => [d.date, d.diagnosis, d.icd10, d.status]),
  });
  y = (doc as any).lastAutoTable.finalY + 40;

  // ---- Sign-off block ----
  ensureSpace(90);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.75);
  doc.line(marginX, y, marginX + 200, y);
  doc.line(marginX + contentWidth - 200, y, marginX + contentWidth, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Attending Clinician Signature", marginX, y + 14);
  doc.text("Date", marginX + contentWidth - 200, y + 14);

  // ---- Header + footer on every page ----
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    if (i > 1) drawHeader();
    drawFooter(i, pageCount);
  }

  doc.save(`${header.name.replace(/\s+/g, "_")}_${header.patient_id}_EMR.pdf`);
}
