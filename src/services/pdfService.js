import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export async function generateStreakReport(userData, streaks, completedDates) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function for centered text
  const centerText = (text, y, fontSize = 12) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
  };

  // ===== COVER PAGE =====
  doc.setFillColor(249, 115, 22); // Orange
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  centerText('🔥 Streak Report', 40);
  
  doc.setFontSize(14);
  centerText(`Generated on ${format(new Date(), 'MMMM d, yyyy')}`, 55);
  
  doc.setTextColor(0, 0, 0);
  yPosition = 100;

  // User info
  doc.setFontSize(16);
  doc.text('User Profile', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Email: ${userData.email || 'N/A'}`, margin, yPosition);
  yPosition += 20;

  // ===== SUMMARY STATISTICS =====
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text('Summary Statistics', margin, yPosition);
  yPosition += 10;

  const totalStreaks = streaks.length;
  const totalCompletions = completedDates.length;
  const activeStreaks = streaks.filter(s => s.currentStreak > 0).length;
  const longestEver = Math.max(...streaks.map(s => s.longestStreak || 0), 0);
  const currentLongest = Math.max(...streaks.map(s => s.currentStreak || 0), 0);

  // Stats boxes
  const statsData = [
    ['Total Streaks', totalStreaks.toString()],
    ['Active Streaks', activeStreaks.toString()],
    ['Total Completions', totalCompletions.toString()],
    ['Longest Streak Ever', `${longestEver} days`],
    ['Current Best Streak', `${currentLongest} days`]
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22] },
    margin: { left: margin, right: margin },
    styles: { fontSize: 11 }
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // ===== STREAK DETAILS =====
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(16);
  doc.text('Streak Details', margin, yPosition);
  yPosition += 10;

  if (streaks.length > 0) {
    const streakTableData = streaks.map(streak => [
      streak.title,
      streak.currentStreak.toString(),
      streak.longestStreak.toString(),
      (streak.completedDates?.length || 0).toString(),
      streak.createdAt?.toDate ? format(streak.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Streak Name', 'Current', 'Longest', 'Total Days', 'Created']],
      body: streakTableData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] }, // Green
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 }
    });

    yPosition = doc.lastAutoTable.finalY + 20;
  } else {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('No streaks created yet.', margin, yPosition);
    yPosition += 20;
  }

  // ===== RECENT ACTIVITY =====
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text('Recent Activity (Last 30 Days)', margin, yPosition);
  yPosition += 10;

  // Get last 30 days activity
  const last30Days = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = completedDates.filter(d => d === dateStr).length;
    if (count > 0) {
      last30Days.push([format(date, 'MMM d, yyyy'), count.toString()]);
    }
  }

  if (last30Days.length > 0) {
    doc.autoTable({
      startY: yPosition,
      head: [['Date', 'Completions']],
      body: last30Days.slice(0, 15), // Limit to 15 rows
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // Blue
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 }
    });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('No activity in the last 30 days.', margin, yPosition);
  }

  // ===== FOOTER =====
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      '🔥 Streak App - Track Your Habits',
      margin,
      pageHeight - 10
    );
  }

  // Save the PDF
  doc.save(`streak-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
