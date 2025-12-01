import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Props { data: any }

const ComparisonReportButton: React.FC<Props> = ({ data }) => {
  const generate = () => {
    const pdf = new jsPDF({ unit: 'pt' });
    const margin = 40;

    pdf.setFontSize(16);
    pdf.text('Competitor Comparison Report', margin, 40);
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 60);

    // Summary table
    const rows = data.comparison.diffs.map((d:any) => ([
      d.url,
      d.performance.score ?? '—',
      d.seo.score ?? '—',
      d.seo.issues ?? '—',
      d.readability.fle ?? '—',
    ]));

    (pdf as any).autoTable({
      startY: 80,
      head: [[ 'URL', 'Performance', 'SEO Score', 'SEO Issues', 'Readability (FRE)' ]],
      body: rows,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [79,70,229] }
    });

    // Keyword overlap
    let nextY = (pdf as any).lastAutoTable.finalY + 20;
    pdf.setFontSize(12);
    pdf.text('Keyword Overlap (All)', margin, nextY);
    nextY += 10;
    const shared = data.comparison.overlapAll.join(', ');
    pdf.setFontSize(10);
    pdf.text(shared || 'None', margin, nextY, { maxWidth: 520 });

    nextY += 30;
    pdf.setFontSize(12);
    pdf.text('Keyword Overlap (Pairwise)', margin, nextY);
    nextY += 10;

    data.comparison.pairwise.forEach((p:any) => {
      const title = `${p.a} ↔ ${p.b}`;
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, nextY);
      nextY += 14;
      pdf.setFont('helvetica', 'normal');
      const list = p.overlap.join(', ') || 'None';
      const lines = (pdf as any).splitTextToSize(list, 520);
      pdf.text(lines, margin, nextY, { maxWidth: 520 });
      const lineHeight = 12; // approximate line height in pt for 10pt font
      nextY += (Array.isArray(lines) ? lines.length : 1) * lineHeight + 12;
      if (nextY > 740) { pdf.addPage(); nextY = 40; }
    });

    pdf.save('comparison-report.pdf');
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-900">Export Comparison</div>
        <div className="text-xs text-gray-500">Download a PDF with summary metrics and keyword overlap.</div>
      </div>
      <button onClick={generate} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Export PDF</button>
    </div>
  );
};

export default ComparisonReportButton;
